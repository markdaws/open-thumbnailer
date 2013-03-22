var OT = require('../index');

var thumbnailer = new OT.Thumbnailer();

thumbnailer.fromUrl(
    'http://www.google.com/404', 
    __dirname + '/thumbs/404.jpg',
    function(error, thumbnail) {

        if (error) {
            console.dir(error);
            return;
        }

        console.dir(thumbnail.getInfo());
    }
);