/**
 * Spaced Repetition Service
 * Handles scheduling logic for the revision system
 *
 * Note: this module is pure scheduling math + call-site-injected `db`.
 * (An unused `@google-cloud/firestore` import was removed in S3 so there is
 * exactly one Firestore client: the Admin SDK in config/firebase.config.js.)
 */
class SpacedRepetitionService {
  /**
   * Calculate next review date based on current phase and confidence
   * @param {Object} revision - Current revision object
   * @param {number} confidence - User confidence rating (1-5)
   * @returns {Object} - { nextDate, nextPhase, scheduledReviews }
   */
  calculateNextReview(revision, confidence) {
    const now = new Date();
    const { phase, scheduledReviews = [], totalReviews = 0 } = revision;

    // Confidence-based adjustment
    if (confidence === 1) {
      // Forgot completely - reset to Day 7
      return {
        nextDate: this.addDays(now, 7),
        nextPhase: 'day_7',
        message: 'Reset to Day 7 cycle due to complete memory loss'
      };
    }

    if (confidence === 2) {
      // Struggled - add extra review in 5-7 days
      return {
        nextDate: this.addDays(now, 6),
        nextPhase: phase, // Stay in same phase
        message: 'Extra review scheduled due to struggle'
      };
    }

    if (confidence >= 4) {
      // Mastered - skip ahead or graduate
      return this.accelerateSchedule(phase, now, totalReviews);
    }

    // Confidence 3 - Follow normal schedule
    return this.followNormalSchedule(phase, now, totalReviews);
  }

  /**
   * Follow normal spaced repetition schedule
   */
  followNormalSchedule(currentPhase, now, totalReviews) {
    const schedule = {
      'day_0': { next: 2, nextPhase: 'day_2' },
      'day_2': { next: 5, nextPhase: 'day_7' },
      'day_7': { next: 7, nextPhase: 'day_14' },
      'day_14': { next: 16, nextPhase: 'day_30' },
      'day_30': { next: 7, nextPhase: 'month_2_week_1' },
      
      // Month 2: Weekly reviews
      'month_2_week_1': { next: 7, nextPhase: 'month_2_week_2' },
      'month_2_week_2': { next: 7, nextPhase: 'month_2_week_3' },
      'month_2_week_3': { next: 7, nextPhase: 'month_2_week_4' },
      'month_2_week_4': { next: 15, nextPhase: 'month_3_check_1' },
      
      // Month 3: Fortnightly reviews
      'month_3_check_1': { next: 15, nextPhase: 'month_3_check_2' },
      'month_3_check_2': { next: 30, nextPhase: 'month_4_monthly' },
      
      // Months 4-6: Monthly reviews
      'month_4_monthly': { next: 30, nextPhase: 'month_5_monthly' },
      'month_5_monthly': { next: 30, nextPhase: 'month_6_monthly' },
      'month_6_monthly': { next: null, nextPhase: 'archived' }
    };

    const config = schedule[currentPhase];
    
    if (!config) {
      // Default to 7 days if phase unknown
      return {
        nextDate: this.addDays(now, 7),
        nextPhase: currentPhase,
        message: 'Default 7-day interval'
      };
    }

    if (config.next === null) {
      // Archive the problem
      return {
        nextDate: null,
        nextPhase: 'archived',
        message: 'Problem archived after 6 months'
      };
    }

    return {
      nextDate: this.addDays(now, config.next),
      nextPhase: config.nextPhase,
      message: `Advanced to ${config.nextPhase}`
    };
  }

  /**
   * Accelerate schedule for high confidence (4-5)
   */
  accelerateSchedule(currentPhase, now, totalReviews) {
    // Skip intermediate reviews in Month 2
    if (currentPhase === 'month_2_week_1' || currentPhase === 'month_2_week_2') {
      return {
        nextDate: this.addDays(now, 15),
        nextPhase: 'month_3_check_1',
        message: 'Skipped to Month 3 due to high confidence'
      };
    }

    // Skip to next major phase
    const acceleratedSchedule = {
      'day_7': { next: 14, nextPhase: 'day_30' },
      'day_14': { next: 16, nextPhase: 'month_2_week_3' },
      'month_2_week_3': { next: 15, nextPhase: 'month_3_check_2' },
      'month_3_check_2': { next: 60, nextPhase: 'month_5_monthly' }
    };

    const config = acceleratedSchedule[currentPhase];
    
    if (config) {
      return {
        nextDate: this.addDays(now, config.next),
        nextPhase: config.nextPhase,
        message: 'Accelerated due to mastery'
      };
    }

    // Default: follow normal schedule
    return this.followNormalSchedule(currentPhase, now, totalReviews);
  }

  /**
   * Get all scheduled reviews for a problem based on initial date
   */
  generateFullSchedule(startDate) {
    const schedule = [];
    const phases = [
      { days: 0, phase: 'day_0' },
      { days: 2, phase: 'day_2' },
      { days: 7, phase: 'day_7' },
      { days: 14, phase: 'day_14' },
      { days: 30, phase: 'day_30' },
      { days: 37, phase: 'month_2_week_1' },
      { days: 44, phase: 'month_2_week_2' },
      { days: 51, phase: 'month_2_week_3' },
      { days: 58, phase: 'month_2_week_4' },
      { days: 75, phase: 'month_3_check_1' },
      { days: 90, phase: 'month_3_check_2' },
      { days: 120, phase: 'month_4_monthly' },
      { days: 150, phase: 'month_5_monthly' },
      { days: 180, phase: 'month_6_monthly' }
    ];

    phases.forEach(({ days, phase }) => {
      schedule.push({
        date: this.addDays(startDate, days),
        phase,
        completed: false,
        confidence: null
      });
    });

    return schedule;
  }

  /**
   * Helper: Parse any date format safely (Date, Timestamp, ISO string, seconds)
   */
  parseDate(d) {
    if (!d) return null;
    if (d instanceof Date) return d;
    if (typeof d.toDate === 'function') return d.toDate();
    if (d._seconds !== undefined) return new Date(d._seconds * 1000);
    if (d.seconds !== undefined) return new Date(d.seconds * 1000);
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * Calculate overdue days safely
   */
  calculateOverdueDays(nextDueDate) {
    if (!nextDueDate) return 0;
    
    const due = this.parseDate(nextDueDate);
    if (!due) return 0;

    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * Check if problem should be archived
   */
  shouldArchive(revision) {
    const { phase, scheduledReviews = [] } = revision;
    
    // Archive if completed all scheduled reviews with high confidence
    if (phase === 'month_6_monthly') {
      const recentReviews = scheduledReviews.slice(-3);
      const allHighConfidence = recentReviews.every(r => r.completed && r.confidence >= 4);
      return allHighConfidence;
    }
    
    return false;
  }

  /**
   * Get bucket status (Fresh, Needs Revision, Mastered)
   */
  getBucketStatus(revision) {
    const { phase, archived } = revision;
    const totalReviews = Number(revision.totalReviews) || 0;
    
    if (archived) return 'mastered';
    if (totalReviews === 0) return 'fresh';
    if (phase === 'month_6_monthly' || phase === 'archived') return 'mastered';
    
    return 'needs_revision';
  }

  /**
   * Calculate problem health score (1-5 stars)
   */
  calculateHealthScore(revision) {
    const { scheduledReviews = [] } = revision;
    const totalReviews = Number(revision.totalReviews) || 0;
    
    if (totalReviews <= 0) return 3; // Default for fresh
    
    const completedReviews = scheduledReviews.filter(r => r && r.completed);
    if (completedReviews.length === 0) return 3;

    const completedOnTime = completedReviews.filter(r => !r.overdue).length;
    
    const ratedReviews = completedReviews.filter(r => typeof r.confidence === 'number' && !isNaN(r.confidence));
    const avgConfidence = ratedReviews.length > 0 
      ? ratedReviews.reduce((sum, r) => sum + r.confidence, 0) / ratedReviews.length 
      : 3;
    
    const onTimeRate = completedOnTime / Math.max(1, completedReviews.length);
    
    let score = (avgConfidence + onTimeRate * 5) / 2;
    if (isNaN(score)) return 3;

    return Math.min(5, Math.max(1, Math.round(score)));
  }


  /**
   * Helper: Add days to a date
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  /**
   * Add a problem to the revision queue
   */
  async addToQueue(userId, problemId, problemData, db) {
    // Check if already exists
    const existing = await db.collection('revisions')
      .where('userId', '==', userId)
      .where('problemId', '==', problemId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return { error: 'Problem already in revision queue' };
    }

    const now = new Date();
    const scheduledReviews = this.generateFullSchedule(now);

    const revisionData = {
      userId,
      problemId,
      problemTitle: problemData.title || '',
      pattern: problemData.pattern || '',
      patterns: problemData.patterns || [],
      topics: problemData.topics || [],
      difficulty: problemData.difficulty || 'Medium',
      coreIdea: problemData.coreIdea || '',
      algorithmSteps: [],
      edgeCases: [],
      notes: '',
      phase: 'day_0',
      nextDueDate: this.addDays(now, 2), // First review in 2 days
      scheduledReviews,
      totalReviews: 0,
      lastReviewedAt: now,
      archived: false,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await db.collection('revisions').add(revisionData);

    return {
      id: docRef.id,
      ...revisionData,
      bucket: 'fresh',
      healthScore: 3
    };
  }
}

module.exports = new SpacedRepetitionService();
