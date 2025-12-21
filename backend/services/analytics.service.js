class AnalyticsService {
  // Calculate topic distribution
  calculateTopicDistribution(problems) {
    const distribution = {};
    
    problems.forEach(problem => {
      problem.topics?.forEach(topic => {
        distribution[topic] = (distribution[topic] || 0) + 1;
      });
    });

    return Object.entries(distribution)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Calculate pattern coverage
  calculatePatternCoverage(problems) {
    const coverage = {};
    
    problems.forEach(problem => {
      problem.patterns?.forEach(pattern => {
        coverage[pattern] = (coverage[pattern] || 0) + 1;
      });
    });

    return Object.entries(coverage)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Calculate difficulty distribution
  calculateDifficultyDistribution(problems) {
    const distribution = { Easy: 0, Medium: 0, Hard: 0 };
    
    problems.forEach(problem => {
      if (problem.difficulty) {
        distribution[problem.difficulty]++;
      }
    });

    return distribution;
  }

  // Calculate platform distribution
  calculatePlatformDistribution(problems) {
    const distribution = {};
    
    problems.forEach(problem => {
      const platform = problem.platform || 'Other';
      distribution[platform] = (distribution[platform] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Generate heatmap data (activity calendar)
  // Helper to check if a problem is considered solved
  isSolvedProblem(problem) {
    // A problem is solved if it has status 'Solved'/'Completed' OR has a solvedAt date
    return problem.status === 'Solved' || problem.status === 'Completed' || problem.solvedAt;
  }

  generateHeatmapData(problems) {
    const heatmap = {};
    
    problems.forEach(problem => {
      // Only count solved problems
      if (!this.isSolvedProblem(problem)) return;
      
      // Check solvedAt first, then updatedAt, then createdAt
      const dateField = problem.solvedAt || problem.updatedAt || problem.createdAt;
      if (dateField) {
        let date;
        // Handle Firestore timestamp with _seconds
        if (dateField._seconds) {
          date = new Date(dateField._seconds * 1000);
        } 
        // Handle Firestore timestamp with seconds
        else if (dateField.seconds) {
          date = new Date(dateField.seconds * 1000);
        } 
        // Handle ISO string or Date
        else {
          date = new Date(dateField);
        }
        
        if (!isNaN(date.getTime())) {
          const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          heatmap[dateKey] = (heatmap[dateKey] || 0) + 1;
        }
      }
    });

    return Object.entries(heatmap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // Calculate progress over time
  calculateProgressTimeline(problems, days = 30) {
    const timeline = [];
    const now = new Date();
    
    // Helper to extract date from various formats
    const getDateFromField = (dateField) => {
      if (!dateField) return null;
      let date;
      if (dateField._seconds) {
        date = new Date(dateField._seconds * 1000);
      } else if (dateField.seconds) {
        date = new Date(dateField.seconds * 1000);
      } else {
        date = new Date(dateField);
      }
      return isNaN(date.getTime()) ? null : date;
    };
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const problemsOnDate = problems.filter(p => {
        // Only count solved problems
        if (!this.isSolvedProblem(p)) return false;
        
        const solvedDate = getDateFromField(p.solvedAt || p.updatedAt || p.createdAt);
        if (!solvedDate) return false;
        
        return solvedDate.toISOString().split('T')[0] === dateKey;
      });

      timeline.push({
        date: dateKey,
        count: problemsOnDate.length,
        easy: problemsOnDate.filter(p => p.difficulty === 'Easy').length,
        medium: problemsOnDate.filter(p => p.difficulty === 'Medium').length,
        hard: problemsOnDate.filter(p => p.difficulty === 'Hard').length
      });
    }

    return timeline;
  }

  // Calculate overall statistics
  calculateOverallStats(problems) {
    const total = problems.length;
    const difficultyDist = this.calculateDifficultyDistribution(problems);
    
    // Calculate streaks and heatmap
    const heatmapData = this.generateHeatmapData(problems);
    const currentStreak = this.calculateCurrentStreak(heatmapData);
    const longestStreak = this.calculateLongestStreak(heatmapData);

    // Calculate total active days (unique days with any solved problem)
    const totalActiveDays = this.calculateTotalActiveDays(problems);

    // Calculate topic and pattern diversity
    const topics = new Set();
    const patterns = new Set();
    
    problems.forEach(p => {
      p.topics?.forEach(t => topics.add(t));
      p.patterns?.forEach(pat => patterns.add(pat));
    });

    return {
      totalProblems: total,
      easyCount: difficultyDist.Easy,
      mediumCount: difficultyDist.Medium,
      hardCount: difficultyDist.Hard,
      currentStreak,
      longestStreak,
      totalActiveDays,
      topicsCovered: topics.size,
      patternsMastered: patterns.size,
      averagePerDay: this.calculateAveragePerDay(problems)
    };
  }

  // Calculate total unique active days
  calculateTotalActiveDays(problems) {
    if (problems.length === 0) return 0;

    const activeDates = new Set();
    
    problems.forEach(problem => {
      // Check solvedAt first, then updatedAt, then createdAt
      const dateField = problem.solvedAt || problem.updatedAt || problem.createdAt;
      if (dateField) {
        let date;
        if (dateField._seconds) {
          date = new Date(dateField._seconds * 1000);
        } else if (dateField.seconds) {
          date = new Date(dateField.seconds * 1000);
        } else {
          date = new Date(dateField);
        }
        
        if (!isNaN(date.getTime())) {
          // Only count if problem is solved
          if (this.isSolvedProblem(problem)) {
            activeDates.add(date.toISOString().split('T')[0]);
          }
        }
      }
    });

    return activeDates.size;
  }

  calculateCurrentStreak(heatmapData) {
    if (heatmapData.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedData = heatmapData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Check if there's activity today or yesterday
    const latestDate = sortedData[0].date;
    const daysDiff = Math.floor((new Date(today) - new Date(latestDate)) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0;

    for (let i = 0; i < sortedData.length; i++) {
      if (i === 0) {
        streak = 1;
      } else {
        const prevDate = new Date(sortedData[i - 1].date);
        const currDate = new Date(sortedData[i].date);
        const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  }

  calculateLongestStreak(heatmapData) {
    if (heatmapData.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;
    const sortedData = heatmapData.sort((a, b) => new Date(a.date) - new Date(b.date));

    for (let i = 1; i < sortedData.length; i++) {
      const prevDate = new Date(sortedData[i - 1].date);
      const currDate = new Date(sortedData[i].date);
      const diff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  calculateAveragePerDay(problems) {
    if (problems.length === 0) return 0;

    const dates = problems
      .filter(p => p.solvedAt)
      .map(p => {
        const date = new Date(p.solvedAt._seconds ? p.solvedAt._seconds * 1000 : p.solvedAt);
        return date.toISOString().split('T')[0];
      });

    if (dates.length === 0) return 0;

    const uniqueDates = new Set(dates);
    return Math.round((problems.length / uniqueDates.size) * 100) / 100;
  }
}

module.exports = new AnalyticsService();
