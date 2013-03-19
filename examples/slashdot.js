var OT = require('../index');

var thumbnailer = new OT.Thumbnailer();

thumbnailer.fromUrl(
    'http://slashdot.org', 
    __dirname + '/thumb/slashdot.org.jpg',
    {
        // only applies to jpgs
        quality: 90,

        // Crop the page to be a maximum of 4000 pixels tall, but by setting
        // cropToPage==true this means if the page when rendered is smaller
        // than 4000 pixels we will crop to that size.
        crop: {
            top: 0,
            left: 0,
            width: 2000,
            height: 4000,
            cropToPage: true
        },

        // specify the size of the window the page will be rendered with
        viewport: {
            width: 2000,
            height: 500
        },

        // max amount of time to wait before returning
        timeout: 20,

        // the amount of time to wait after the page loads until the
        // page is rendered.  There may be async items loading in the page
        // we will give them a few seconds to load
        delay: 5,

        // log info
        log: true
    },
    function(error, thumbnail) {
 
        // Show details about the thumbnail
        console.dir(thumbnail.getInfo());

        // Cleanup the thumbnail
        setTimeout(function() {
            thumbnail.destroy(function() {
                console.log('deleted');
            });
        }, 2000);
    }
);

/*
// you can call cancel to kill the thumbnailing process at any time
thumbnailer.cancel();
*/