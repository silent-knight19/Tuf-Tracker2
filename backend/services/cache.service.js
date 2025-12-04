const { db, admin } = require('../config/firebase.config');

class CacheService {
  /**
   * Helper to normalize keys for caching
   * @param {string} str 
   * @returns {string}
   */
  normalizeKey(str) {
    if (!str) return 'unknown';
    return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  }

  /**
   * Get cached data or generate it using the provided function
   * @param {string} collectionName - Firestore collection name for cache
   * @param {string} key - Unique document ID
   * @param {Function} generateFn - Async function to generate data if cache miss
   * @returns {Promise<any>}
   */
  async getCachedOrGenerate(collectionName, key, generateFn) {
    try {
      const docRef = db.collection(collectionName).doc(key);
      const doc = await docRef.get();

      if (doc.exists) {
        console.log(`✅ Cache HIT for [${collectionName}/${key}]`);
        return doc.data().data; // We store actual data in a 'data' field
      }

      console.log(`⚠️ Cache MISS for [${collectionName}/${key}] - Generating...`);
      const data = await generateFn();

      // Save to cache asynchronously (don't block response)
      docRef.set({
        data: data,
        cachedAt: new Date(), // Using JS Date for simplicity
        lastAccessed: new Date()
      }).catch(err => console.error(`Failed to write to cache [${collectionName}/${key}]:`, err));

      return data;
    } catch (error) {
      console.error(`Cache error for [${collectionName}/${key}]:`, error);
      // Fallback: just generate and return without caching if cache fails
      return await generateFn();
    }
  }
}

module.exports = new CacheService();
