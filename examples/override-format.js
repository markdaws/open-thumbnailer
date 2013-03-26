/**
 * An example showing how even if the output path does not
 * contain an extension like .jpg or .png you can specify the
 * format as an option to the fromUrl function
 */
var OT = require('../index');

var thumbnailer = new OT.Thumbnailer();

thumbnailer.fromUrl(
    'http://www.imdb.com', 
    __dirname + '/thumbs/imdb.com.override',
    {
        format: 'jpg'
    },
    function(error, thumbnail) {

        if (error) {
            console.dir(error);
            return;
        }

        console.dir(thumbnail.getInfo());
    }
);