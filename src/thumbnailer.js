var childProcess = require('child_process'),
    Gm = require('gm'),
    Fs = require('fs'),
    Path = require('path'),
    Thumbnail = require('./thumbnail'),
    Utils = require('./utils');

function createPhantomError(code) {
    switch(code) {
    case 1:
        //badArg
        return { badArg: true };

    case 2:
        //missingArg
        return { missingArg: true };

    case 3:
        //timeout
        return { timeout: true };

    case 4:
        //openFailed
        return { openFailed: true };

    default:
        return { unknownError: true, code: code };
    }
}

function processRenderedPage(imagePath, options, originalExtension, callback) {
    Fs.lstat(imagePath, function(error, stat) {
        if (error) {
            callback(error);
            return;
        }

        Utils.gmInstalled(function(error, installed) {
            if (error) {
                callback(error);
                return;
            }

            if (installed) {
                if (options.quality) {
                    // Need to convert to jpg and set correct quality
                    var originalPath = imagePath;
                    imagePath = imagePath.replace('.png', originalExtension)

                    Gm(originalPath)
                        .quality(options.quality)
                        .write(imagePath, function(error) {
                            if (error) {
                                callback(error);
                                return;
                            }

                            Fs.unlink(originalPath, function(error) {
                                if (error) {
                                    callback(error);
                                    return;
                                }
                                fetchInfo(imagePath);
                            });
                        });
                }
                else {
                    fetchInfo(imagePath);
                }

                function fetchInfo(imagePath) {
                    Gm(imagePath).identify(function(error, info) {
                        if (error) {
                            callback(error);
                            return;
                        }

                        callback(null, new Thumbnail(
                            info.size.width,
                            info.size.height,
                            imagePath,
                            stat.size
                        ));
                    });
                }
            }
            else {
                callback(null, new Thumbnail(
                    null,
                    null,
                    imagePath,
                    stat.size
                ));
            }
        });
    });
}

/**
* Object responsible for thumbnailing a page
*/
function Thumbnailer() {
}

/**
* Renders a webpage from an URL
* @param {String} url The URL of the webpage
* @param {String} outPath The path where the rendered page will be saved to
* @param {Object} options
* @param {Boolean|Function} options.log
* @param {Number} [options.quality=100] Quality level of the jpg 0-100 (only valid for jpg output)
* @param {Number} [options.timeout=60] The number of seconds to wait for the page to be thumbnailed
* @param {Object} [options.viewport] The dimensions of the page to use when rendering
*                                    the page width, height
* @param {Object} [options.crop] The dimensions to crop the page to
* top,left,width,height,cropToPage
*/
Thumbnailer.prototype.fromUrl = function(url, outPath, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    this._parseOptionsAndRender(outPath, url, options, callback);
};

Thumbnailer.prototype._parseOptionsAndRender = function(outPath, url, options, callback) {
    var extension = Path.extname(outPath).toLowerCase();
    switch(extension) {
        case '.jpg':
        case '.jpeg':
        case '.png':
            break;

        default:
            callback({ unsupportedFileType: true, msg: 'Only jpg, jpeg and png supported' });
            return;
    }

    var self = this;
    Utils.gmInstalled(function(error, gmInstalled) {
        if (error) {
            callback(error);
            return;
        }

        if (extension === '.png' && options.quality) {
            callback({ badArg: true, msg: 'quality can only be specified with jpg images' });
            return;
        }

        if (options.quality && !gmInstalled) {
            callback({ unsupported: true, msg: 'Quality can only be specified when graphicsmagick is installed' });
            return;
        }

        var log = {};
        if (!options.log) {
            log.error = log.verbose = function() {};
        }
        else if (options.log === true) {
            log.error = function(message, error) {
                console.error('OT-ERROR: ' + message + ' : ' + JSON.stringify(error));
            };
            log.verbose = function(message) {
                console.log('OT-VERBOSE: ' + message);
            }
        }
        else {
            log = options.log;
        }

        // We always save as png then turn to jpg if needed so we can specify the quality level
        var originalExtension = extension;
        if (extension !== '.png') {
            outPath = outPath.replace(extension, '.png');
        }

        var args = [ 
            __dirname + '/shim.js', 
            '--url ' + url,
            '--out ' + outPath,
        ];

        if (options.crop) {
            args.push('--crop ' + 
                      (options.crop.top || 0) + 'x' +
                      (options.crop.left || 0) + 'x' +
                      //??? have to specify, 
                      options.crop.width + 'x' +
                      options.crop.height + 'x' +
                      ((options.crop.cropToPage == null) ? 'false' : options.crop.cropToPage));
        }

        options.timeout = options.timeout || 60;
        args.push('--timeout ' + options.timeout);

        options.delay = options.delay || 0;
        args.push('--delay ' + options.delay);

        options.viewport = options.viewport || { width: 1024, height: 768 };
        args.push('--viewport ' +
                  options.viewport.width + 'x' +
                  options.viewport.height);

        log.verbose('phantomargs: ' + JSON.stringify(args));

        self._process = childProcess.spawn(
            __dirname + '/../node_modules/phantomjs/bin/phantomjs', 
            args);

        self._process.stdout.on('data', function(data) {
            log.verbose('phantom stdout: ' + data);
        });
        self._process.stderr.on('data', function(data) {
            log.error('phantom stderr: ' + data);
        });

        self._process.on('exit', function(code) {
            self._process = null;

            if (code !== 0) {
                callback(createPhantomError(code));
                return;
            }

            processRenderedPage(outPath, options, originalExtension, function(error, thumbnail) {
                callback(error, thumbnail);
            });
        });
    });
};

Thumbnailer.prototype.cancel = function() {
    if (this._process) {
        this._process.kill(9);
    }
};

//TODO: fromFile
//TODO: fromHtml

module.exports = Thumbnailer;