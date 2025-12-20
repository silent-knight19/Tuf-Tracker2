const fs = require('fs').promises;
const path = require('path');
const cache = require('./cache.service');
const aiService = require('./ai.service');

class ProblemAnalyzerService {
  constructor() {
    this.companyTags = null;
    this.topicPatterns = null;
    this.loadedData = false;
  }

  async loadPreloadedData() {
    if (this.loadedData) return;

    try {
      const companyTagsPath = path.join(__dirname, '../data/company-tags.json');
      const topicPatternsPath = path.join(__dirname, '../data/topic-patterns.json');

      this.companyTags = JSON.parse(await fs.readFile(companyTagsPath, 'utf-8'));
      this.topicPatterns = JSON.parse(await fs.readFile(topicPatternsPath, 'utf-8'));
      
      this.loadedData = true;
      console.log('✅ Preloaded data loaded successfully');
      console.log(`📊 Total companies: ${this.companyTags.totalCompanies}`);
      console.log(`📊 Total problems in mapping: ${this.topicPatterns.totalProblems}`);
    } catch (error) {
      console.error('❌ Error loading preloaded data:', error);
      throw error;
    }
  }

  // Generate a simple hash key for caching
  generateProblemKey(title, platform = 'LeetCode') {
    return `${platform}::${title.toLowerCase().trim()}`;
  }

  // Check if problem exists in preloaded data
  findInPreloadedData(title) {
    if (!this.loadedData) return null;

    const normalizedTitle = title.trim();
    
    // Search in topic-patterns database
    if (this.topicPatterns.problems[normalizedTitle]) {
      return {
        ...this.topicPatterns.problems[normalizedTitle],
        companies: this.findCompaniesForProblem(normalizedTitle),
        source: 'preloaded'
      };
    }

    return null;
  }

  // Find which companies ask this problem
  findCompaniesForProblem(title) {
    const companies = [];
    
    if (!this.companyTags || !this.companyTags.companies) return companies;

    for (const [companyName, companyData] of Object.entries(this.companyTags.companies)) {
      if (companyData.problems && companyData.problems.includes(title)) {
        companies.push(companyName);
      }
    }

    return companies;
  }

  // Main analysis function - hybrid approach
  async analyzeProblem(title, platform = 'LeetCode', url = '') {
    await this.loadPreloadedData();

    // Use normalized keys for Firestore compatibility
    const cacheKey = `analysis_${cache.normalizeKey(platform)}_${cache.normalizeKey(title)}`;

    return await cache.getCachedOrGenerate(
      'problem_analysis_cache',
      cacheKey,
      async () => {
        // 1. Check preloaded data
        const preloadedResult = this.findInPreloadedData(title);
        if (preloadedResult) {
          console.log(`📚 Found in preloaded data: ${title}`);
          return preloadedResult;
        }

        // 2. Fallback to AI analysis
        console.log(`🤖 Using AI to analyze: ${title}`);
        const aiResult = await aiService.analyzeProblem(title, platform, url);
        
        return {
          ...aiResult,
          source: 'ai'
        };
      }
    );
  }

  // Get all available topics and patterns
  getAvailableTopics() {
    return this.topicPatterns?.topics || [];
  }

  getAvailablePatterns() {
    return this.topicPatterns?.patterns || [];
  }

  getAvailableCompanies() {
    if (!this.companyTags?.companies) return [];
    return Object.keys(this.companyTags.companies);
  }

  // Update company database with new problem
  async updateCompanyDatabase(title, companies) {
    if (!companies || companies.length === 0) return;

    await this.loadPreloadedData();
    let hasUpdates = false;
    
    // Normalize problem title to ensure consistency
    const problemTitle = title.trim();

    companies.forEach(companyName => {
      // Create company if it doesn't exist (optional, but good for robustness)
      if (!this.companyTags.companies[companyName]) {
        // We only add if it's a known company structure, or we can't infer difficulty/name properly
        // For now, only update EXISTING companies to preserve structure
        return;
      }

      const companyData = this.companyTags.companies[companyName];
      if (!companyData.problems.includes(problemTitle)) {
        companyData.problems.push(problemTitle);
        hasUpdates = true;
        console.log(`📝 Added "${problemTitle}" to ${companyName}`);
      }
    });

    if (hasUpdates) {
      try {
        const companyTagsPath = path.join(__dirname, '../data/company-tags.json');
        await fs.writeFile(companyTagsPath, JSON.stringify(this.companyTags, null, 2), 'utf-8');
        console.log('✅ Company tags database updated successfully');
      } catch (error) {
        console.error('❌ Failed to update company tags database:', error);
      }
    }
  }
}

module.exports = new ProblemAnalyzerService();
