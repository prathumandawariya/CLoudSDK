const { LRUCache } = require('lru-cache')
const HashMap = require("hashmap");

class CacheManager {


    constructor() {
         this.map = new HashMap(); 
        }


    createCache(cacheName, options) {
        options = {
            max: 500,
          
            // for use with tracking overall storage size
            maxSize: 5000,
            sizeCalculation: (value, key) => {
              return 1
            }
        }
        const cache = new LRUCache(options);
        this.map = cache.set(cacheName, cache);
        return cache;
    }


    getCache(cacheName) {
        return this.map.get(cacheName);
    }


    getOrCreateCache(cacheName, options = undefined) {
        let cache = this.getCache(cacheName);
        if(cache == null || !cache) {
            cache = this.createCache(cacheName, options);
            return cache;
        }
    }

}
module.exports = new CacheManager();