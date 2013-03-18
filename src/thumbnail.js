var Fs = require('fs');

/**
* Represents an individual thumbnail
* @param {Number} width The width of the thumbnail in pixels
* @param {Number} height The height of the thumbnail in pixels
* @param {String} path The path where the thumbnail is located on disk
* @param {Number} size The size of the thumbnail in bytes
*/
function Thumbnail(width, height, path, size) {
    this._info = {
        width: width,
        height: height,
        path: path,
        size: size
    };
}

/**
* Returns an object containing information about the thumbnail. If the
* caller has graphicsmagick installed extra information such as the 
* width and height of the thumbnail will be present
*/
Thumbnail.prototype.getInfo = function() {
    return this._info;
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

module.exports = Thumbnail;

//TODO:
/*
        // helper methods
        thumbnail.copy('fooboo', function(error, thumbnail) {
            
        });
        
        thumbnail.copyToS3('key', 'secret', 'bucket', function(error) {
            
        });

        thumbnail.move(outPath, function(error) {
        });

        thumbnail.convert('jpg|png', { quality: 50 }, function(error) {
        });

        thumbnail.crop(x,y,w,h, function(error) {
        });

        thumbnail.resize(w,h, function() {
        });
*/