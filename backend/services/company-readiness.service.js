const fs = require('fs').promises;
const path = require('path');

class CompanyReadinessService {
  constructor() {
    this.companyTags = null;
    this.difficultyMetadata = null;
    this.topicPatterns = null;
    this.loaded = false;
  }

  async loadData() {
    if (this.loaded) return;

    try {
      const companyTagsPath = path.join(__dirname, '../data/company-tags.json');
      const difficultyPath = path.join(__dirname, '../data/difficulty-metadata.json');
      const topicPatternsPath = path.join(__dirname, '../data/topic-patterns.json');

      this.companyTags = JSON.parse(await fs.readFile(companyTagsPath, 'utf-8'));
      this.difficultyMetadata = JSON.parse(await fs.readFile(difficultyPath, 'utf-8'));
      this.topicPatterns = JSON.parse(await fs.readFile(topicPatternsPath, 'utf-8'));
      this.loaded = true;
    } catch (error) {
      console.error('Error loading company data:', error);
      throw error;
    }
  }

  // Calculate readiness score for a specific company
  async calculateReadiness(companyName, userProblems) {
    await this.loadData();

    const company = this.companyTags.companies[companyName];
    if (!company) {
      throw new Error(`Company ${companyName} not found`);
    }

    const companyProblems = company.problems;
    const totalProblems = companyProblems.length;

    // Find which company problems the user has solved
    const solvedProblems = userProblems.filter(p => 
      companyProblems.includes(p.title)
    );

    const solvedCount = solvedProblems.length;
    const coveragePercent = Math.round((solvedCount / totalProblems) * 100);

    // Calculate difficulty distribution
    const difficultyDist = { Easy: 0, Medium: 0, Hard: 0 };
    solvedProblems.forEach(p => {
      if (p.difficulty) difficultyDist[p.difficulty]++;
    });

    // Calculate topic coverage for this company
    const topicCoverage = this.calculateTopicCoverage(solvedProblems);

    // Calculate pattern mastery
    const patternMastery = this.calculatePatternMastery(solvedProblems);

    // Overall readiness score (0-100)
    // Simplified: Percentage of solved problems
    const readinessScore = Math.round((solvedCount / totalProblems) * 100);

    return {
      company: companyName,
      readinessScore,
      totalProblems,
      solvedCount,
      coveragePercent,
      difficultyDistribution: difficultyDist,
      topicCoverage,
      patternMastery,
      recommendations: this.generateRecommendations(
        companyProblems,
        userProblems,
        readinessScore
      )
    };
  }

  calculateTopicCoverage(problems) {
    const topics = {};
    problems.forEach(p => {
      p.topics?.forEach(topic => {
        topics[topic] = (topics[topic] || 0) + 1;
      });
    });
    return topics;
  }

  calculatePatternMastery(problems) {
    const patterns = {};
    problems.forEach(p => {
      p.patterns?.forEach(pattern => {
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      });
    });
    return patterns;
  }

  generateRecommendations(companyProblems, userProblems, readinessScore) {
    const recommendations = [];

    if (readinessScore < 30) {
      recommendations.push('Start with easy problems to build confidence');
      recommendations.push('Focus on fundamental data structures (Arrays, Strings, Hash Tables)');
    } else if (readinessScore < 60) {
      recommendations.push('Practice medium-difficulty problems');
      recommendations.push('Master common patterns (Two Pointers, Sliding Window, DFS/BFS)');
    } else if (readinessScore < 80) {
      recommendations.push('Tackle hard problems to refine skills');
      recommendations.push('Focus on advanced topics (DP, Graphs, Trees)');
    } else {
      recommendations.push('You\'re well prepared! Do mock interviews');
      recommendations.push('Review and revise solved problems');
    }

    return recommendations;
  }

  // Get all companies with their difficulty levels
  async getAllCompanies() {
    await this.loadData();
    
    return Object.entries(this.companyTags.companies).map(([name, data]) => ({
      name: data.name,
      difficulty: data.difficulty,
      totalProblems: data.problems.length
    }));
  }

  // Get problems asked by a specific company
  async getCompanyProblems(companyName) {
    await this.loadData();

    const company = this.companyTags.companies[companyName];
    if (!company) {
      throw new Error(`Company ${companyName} not found`);
    }

    const problems = company.problems.map(title => {
      const metadata = this.topicPatterns.problems[title];
      return {
        title,
        difficulty: metadata?.difficulty || 'Medium',
        topics: metadata?.topics || [],
        patterns: metadata?.patterns || [],
        platform: metadata?.platform || 'LeetCode',
        platformUrl: metadata?.platformUrl || '',
        company: companyName
      };
    });

    return problems;
  }
}

module.exports = new CompanyReadinessService();
