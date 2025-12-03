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

    const cacheKey = this.generateProblemKey(title, platform);

    // 1. Check memory cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log(`💰 Cache hit for: ${title}`);
      return cachedResult;
    }

    // 2. Check preloaded data
    const preloadedResult = this.findInPreloadedData(title);
    if (preloadedResult) {
      console.log(`📚 Found in preloaded data: ${title}`);
      cache.set(cacheKey, preloadedResult);
      return preloadedResult;
    }

    // 3. Fallback to AI analysis
    console.log(`🤖 Using AI to analyze: ${title}`);
    const aiResult = await aiService.analyzeProblem(title, platform, url);
    
    const result = {
      ...aiResult,
      source: 'ai'
    };

    // Cache the AI result
    cache.set(cacheKey, result);

    return result;
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
}

module.exports = new ProblemAnalyzerService();
