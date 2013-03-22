var Fs = require('fs'),
    Gm = require('gm'),
    Utils = require('./utils');

/**
* Represents an individual thumbnail
* @param {Number} width The width of the thumbnail in pixels
* @param {Number} height The height of the thumbnail in pixels
* @param {String} path The path where the thumbnail is located on disk
* @param {Number} size The size of the thumbnail in bytes
*/
function Thumbnail(width, height, path, size) {
    this._setInfo(width, height, path, size);
}

/**
* Returns an object containing information about the thumbnail. If the
* caller has graphicsmagick installed extra information such as the 
* width and height of the thumbnail will be present
*/
Thumbnail.prototype.getInfo = function() {
    return this._info;
};

Thumbnail.prototype._setInfo = function(width, height, path, size) {
    this._info = {
        width: width,
        height: height,
        path: path,
        size: size
    };
};

/**
* Deletes the thumbnail
* @param {Function} callback (error)
*/
Thumbnail.prototype.destroy = function(callback) {
    Fs.unlink(this._info.path, function(error) {
        callback && callback(error);
    });
};

/**
* Creates a copy of the thumbnail
*/
Thumbnail.prototype.copy = function(outPath, callback) {
    var readStream = Fs.createReadStream(this._info.path),
        self = this;

    readStream.on("error", function(error) {
        callback(error);
    });
    var writeStream = Fs.createWriteStream(outPath);
    writeStream.on("error", function(error) {
        callback(error);
    });
    writeStream.on("close", function() {
        callback(null, new Thumbnail(
            self._info.width,
            self._info.height,
            outPath,
            self._info.size
        ));
    });
    readStream.pipe(writeStream);
};

/**
* Moves the thumbnail to the targetPath
*/
Thumbnail.prototype.move = function(targetPath, callback) {
    var self = this;
    Fs.rename(this._info.path, targetPath, function(error) {
        if (error) {
            callback(error);
            return;
        }

        self._info.path = targetPath;
        callback();
    });
};

/**
* Provides the ability to resize and crop the thumbnail
*
* @param {Object} options
* @param {String} [options.targetPath] Optional, if supplied the original
* thumbnail will be untouched and a new file will be created. If not specified
* then the original thumbnail will be modified
* @param {Number} [options.scaleToWidth] 
* @param {Number} [options.scaleToHeight] 
*/
Thumbnail.prototype.resize = function(options, callback) {

    var self = this;
    Utils.gmInstalled(function(error, installed) {
        if (error) {
            callback(error);
            return;
        }

        if (!installed) {
            callback({ unsupported: true, msg: 'graphicsmagick is not installed' });
            return;
        }

        if (options.targetPath) {
            self.copy(options.targetPath, function(error, thumbCopy) {
                if (error) {
                    callback(error);
                    return;
                }

                _resize(thumbCopy, false);
            });
        }
        else {
            _resize(self, true);
        }

        function _resize(thumbnail, overrideThumb) {
            var targetWidth, targetHeight, cropRegion;

            if (options.scaleToWidth) {
                targetWidth = options.scaleToWidth;
                targetHeight = options.scaleToWidth / thumbnail.getInfo().width * 
                    thumbnail.getInfo().height;
            }
            else if (options.scaleToHeight) {
                targetHeight = options.scaleToHeight;
                targetWidth = options.scaleToHeight / thumbnail.getInfo().height +
                    thumbnail.getInfo().width;
            }

            if (options.crop) {
                cropRegion = options.crop;
            }
            else {
                cropRegion = { top: 0, left: 0, width: targetWidth, height: targetHeight };
            }

            executeGm(targetWidth, targetHeight, cropRegion);

            function executeGm(targetWidth, targetHeight, crop) {
                Gm(thumbnail.getInfo().path)
                    .resize(targetWidth, targetHeight)
                    .crop(crop.width, crop.height, crop.left, crop.top)
                    .write(thumbnail.getInfo().path, function(error) {
                        if (error) {
                            callback(error);
                            return;
                        }
                        
                        Fs.lstat(thumbnail.getInfo().path, function(error, stats) {
                            if (error) {
                                callback(error);
                                return;
                            }
                            
                            var finalWidth = Math.min(crop.width, targetWidth),
                                finalHeight = Math.min(crop.height, targetHeight);
                            
                            if (overrideThumb) {
                                thumbnail._setInfo(
                                    finalWidth, finalHeight, 
                                    thumbnail.getInfo().path, stats.size
                                );
                                callback();
                            }
                            else {
                                callback(null, new Thumbnail(
                                    Math.min(crop.width, targetWidth),
                                    Math.min(crop.height, targetHeight),
                                    thumbnail.getInfo().path,
                                    stats.size
                                ));
                            }
                        });
                    });
            }
        }
    });
};

module.exports = Thumbnail;