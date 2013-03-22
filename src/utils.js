var gm = require('gm'),
    shell = require('shelljs');

function Utils() {
}

Utils.gmInstalled = (function() {
    var installed;

    return function(callback) {
        if (installed != undefined) {
            process.nextTick(function() {
                callback(null, installed);
            });
            return;
        }

        installed = shell.which('gm') != null;
        process.nextTick(function() {
            callback(null, installed);
        });
    };
})();

module.exports = Utils;