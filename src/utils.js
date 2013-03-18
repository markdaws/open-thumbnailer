var gm = require('gm');

function Utils() {
}

Utils.gmInstalled = function(callback) {
    process.nextTick(function() {
        //TODO: Real value
        callback(null, true);
    });
};

module.exports = Utils;