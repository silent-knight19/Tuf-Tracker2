const fs = require('fs').promises;
const path = require('path');

class RevisionService {
  constructor() {
    this.schedules = null;
    this.loaded = false;
  }

  async loadSchedules() {
    if (this.loaded) return;

    try {
      const schedulesPath = path.join(__dirname, '../data/revision-schedules.json');
      this.schedules = JSON.parse(await fs.readFile(schedulesPath, 'utf-8'));
      this.loaded = true;
    } catch (error) {
      console.error('Error loading revision schedules:', error);
      throw error;
    }
  }

  // Calculate next revision date
  async calculateNextRevision(difficulty, revisionCount = 0, strategy = 'default') {
    await this.loadSchedules();

    let intervals;
    if (strategy === 'default') {
      intervals = this.schedules.spaced_repetition[difficulty]?.intervals;
    } else {
      intervals = this.schedules.custom_strategies[strategy]?.[difficulty];
    }

    if (!intervals) {
      intervals = this.schedules.spaced_repetition.Medium.intervals;
    }

    // Get the interval for this revision count
    const intervalIndex = Math.min(revisionCount, intervals.length - 1);
    const daysToAdd = intervals[intervalIndex];

    // Calculate next revision date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    nextDate.setHours(9, 0, 0, 0); // Set to 9 AM

    return {
      nextRevisionDate: nextDate,
      daysUntilNext: daysToAdd,
      revisionNumber: revisionCount + 1
    };
  }

  // Get revision schedule for a problem
  async getRevisionSchedule(difficulty, strategy = 'default') {
    await this.loadSchedules();

    let intervals;
    if (strategy === 'default') {
      intervals = this.schedules.spaced_repetition[difficulty]?.intervals || [1, 3, 7, 14, 30];
    } else {
      intervals = this.schedules.custom_strategies[strategy]?.[difficulty] || [1, 3, 7, 14, 30];
    }

    return intervals;
  }

  // Check if a problem is due for revision
  isDueForRevision(nextRevisionDate) {
    if (!nextRevisionDate) return false;
    const now = new Date();
    const revisionDate = new Date(nextRevisionDate);
    return now >= revisionDate;
  }

  // Mark a revision as complete and calculate next one
  async completeRevision(problem, strategy = 'default') {
    const currentRevisionCount = problem.revisionDates?.length || 0;
    
    const nextRevision = await this.calculateNextRevision(
      problem.difficulty,
      currentRevisionCount,
      strategy
    );

    return {
      nextRevisionDate: nextRevision.nextRevisionDate,
      revisionNumber: nextRevision.revisionNumber,
      completedAt: new Date()
    };
  }

  // Get all available strategies
  async getAvailableStrategies() {
    await this.loadSchedules();
    
    return {
      default: this.schedules.spaced_repetition,
      ...this.schedules.custom_strategies
    };
  }
}

module.exports = new RevisionService();
