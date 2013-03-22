var OT = require('../index');

var thumbnailer = new OT.Thumbnailer();

thumbnailer.fromUrl(
    'http://www.clipboard.com/login', 
    __dirname + '/thumbs/clipboard-login.jpg',
    function(error, thumbnail) {

        if (error) {
            console.dir(error);
            return;
        }

        console.dir(thumbnail.getInfo());
    }
);