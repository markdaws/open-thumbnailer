var OT = require('../index');

var thumbnailer = new OT.Thumbnailer();

thumbnailer.fromUrl(
    'http://www.imdb.com', 
    __dirname + '/thumbs/imdb.com.jpg',
    function(error, thumbnail) {

        if (error) {
            console.dir(error);
            return;
        }

        console.dir(thumbnail.getInfo());
        
        // Can make a smaller copy of the thumbnail, width a width of 400 pixels
        thumbnail.resize(
            {
                targetPath: __dirname + '/thumbs/imdb_small.com.jpg',
                scaleToWidth: 400
            },
            function(error, smallThumb) {
                if (error) {
                    console.dir(error);
                    return;
                }
                
                // We can move the thumbnail
                smallThumb.move(__dirname + '/thumbs/imdb-small.com.jpg', function(error) {
                    if (error) {
                        console.dir(error);
                        return;
                    }
                });
            }
        );
    }
);