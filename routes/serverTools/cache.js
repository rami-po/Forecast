// https://www.npmjs.com/package/node-cache
const NodeCache = require( "node-cache" );
const crypto = require('crypto');

const cache = new NodeCache( { stdTTL: 60, checkperiod: 20 } );
const inProgressCache = new NodeCache( { stdTTL: 60, checkperiod: 20 } );
const rollUpsCache = new NodeCache( {stdTTL: 60, checkperiod: 20} );

exports.cache = cache;
exports.inProgressCache = inProgressCache;
exports.rollUpsCache = rollUpsCache;

exports.checkOrClearCache = function(clearCache, cacheKey, theCache=cache) {
  var result = null;
  if (clearCache) {
    console.log('CACHE CLEAR for ' + cacheKey);
    theCache.del(cacheKey);
  }
  else {
    result = theCache.get(cacheKey);
  }
  return result;
}

exports.checkCaches = checkCaches;

// if the delay is too short (less than 100ms?), this function will start to block new requests.
function checkCaches(clear, key, delay, retries, reqId=0, callback) {
  // console.log('----ENTER CHECK_CACHE: ' + retries + ' TRIES LEFT FOR ' + reqId);
  inProgress = inProgressCache.get(key);
  if (clear) {
    cache.del(key);
    return callback(true, null);
  }
  else if (inProgress == null) {
    // console.log('----CHECK_CACHE REQUEST NOT IN PROGRESS ' + reqId + ' REMAINING TRIES=' + retries);
    return callback(true, cache.get(key));
  }
  else if (retries > 0) {
    // console.log('----IN PROGRESS ' + inProgress + ' CHECK FOR ' + reqId);
    retries--;
    setTimeout(function() {
      checkCaches(clear, key, delay, retries, reqId, (completed, result) => {
        // console.log('----TIMEOUT REQUEST COMPLETED FOR ' + reqId +' ('+completed+')' + ' RESULT IS ' + (finalResult == null ? 'NULL' : 'NOT NULL'));
        if (completed) {
          return callback(completed, result);
        }
      })}, delay);
    // console.log('----OUTSIDE OF TIMEOUT REQUEST FOR ' + reqId);
  }
  else {
    return callback(true, null);
  }
}

exports.createHashKey = createHashKey;

function createHashKey(prefix, stringToHash) {
  const secret = 'thisDoesntNeedToBeVerySecret';
  const hashedString = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(stringToHash))
    .digest('hex');
  return prefix + hashedString;
}
