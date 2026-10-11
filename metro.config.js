const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix Windows EMFILE (too many open files) by limiting parallel worker threads
config.maxWorkers = 2;

// Gracefully handle Windows file handle saturation in Metro cache
if (Array.isArray(config.cacheStores)) {
  config.cacheStores.forEach((store) => {
    if (store && typeof store.get === 'function') {
      const origGet = store.get.bind(store);
      store.get = async function (key) {
        try {
          return await origGet(key);
        } catch (err) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE' || err.code === 'EBUSY')) {
            return null; // Gracefully fall back to recompiling instead of crashing bundler
          }
          throw err;
        }
      };
    }
    if (store && typeof store.set === 'function') {
      const origSet = store.set.bind(store);
      store.set = async function (key, value) {
        try {
          return await origSet(key, value);
        } catch (err) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE' || err.code === 'EBUSY')) {
            return; // Ignore cache write error on Windows handle exhaustion
          }
          throw err;
        }
      };
    }
  });
}

module.exports = config;
