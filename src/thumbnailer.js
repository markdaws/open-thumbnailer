var childProcess = require('child_process'),
    Gm = require('gm'),
    Fs = require('fs'),
    UUID = require('node-uuid'),
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

function processRenderedPage(options, workingPath, targetPath, format, callback) {
    Fs.lstat(workingPath, function(error, stat) {
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
                    Gm(workingPath)
                        .quality(options.quality)
                        .setFormat('jpg')
                        .write(targetPath, function(error) {
                            if (error) {
                                callback(error);
                                return;
                            }

                            Fs.unlink(workingPath, function(error) {
                                if (error) {
                                    callback(error);
                                    return;
                                }
                                fetchInfo(targetPath);
                            });
                        });
                }
                else {
                    // Since we always thumbnail as a png, and the output format
                    // is a png, then we can just save the file
                    Fs.rename(workingPath, targetPath, function(error) {
                        if (error) {
                            callback(error);
                            return;
                        }
                        fetchInfo(targetPath);
                    });
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
                Fs.rename(workingPath, targetPath, function(error) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    callback(null, new Thumbnail(
                        null,
                        null,
                        targetPath,
                        stat.size
                    ));
                });
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
    var format = Path.extname(outPath).toLowerCase().replace('.', '');
    switch(format) {
        case 'jpg':
        case 'jpeg':
        case 'png':
            break;

        default:
            if (options.format) {
                format = (options.format || 'jpg').toLowerCase();
                switch(format) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                    break;
                    
                default:
                    callback({ badArg: true,
                               msg: 'format must be one of jpg, jpeg or png' });
                    return;
                }
            }
            else {
                callback({ unsupportedFileType: true, 
                           msg: 'Only .jpg, .jpeg and .png supported' });
                return;
            }
    }

    var self = this;
    Utils.gmInstalled(function(error, gmInstalled) {
        if (error) {
            callback(error);
            return;
        }

        if (format === 'png' && options.quality) {
            callback({ badArg: true, 
                       msg: 'quality can only be specified with jpg images' });
            return;
        }

        if (options.quality && !gmInstalled) {
            callback({ unsupported: true, 
                       msg: 'Quality can only be specified when graphicsmagick is installed' });
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
            };
        }
        else {
            log = options.log;
        }

        // This is the temporary file we use during manipulation.  We always output a png
        // first, then if necessary we convert it to a jpg so we can control the quality since
        // phantomjs doesn't let us set a quality level on render
        var workingPath = Path.join(Path.dirname(outPath), UUID.v4() + '.png');

        if (format !== 'png') {
            // If this was a jpg then we specify a default quality level
            options.quality = options.quality || 75;
        }

        var args = [ 
            __dirname + '/shim.js', 
            '--url ' + url,
            '--out ' + workingPath
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

            processRenderedPage(options, workingPath, outPath, format, function(error, thumbnail) {
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