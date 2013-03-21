var OT = require('../index'),
    async = require('async');

// Some popular sites
var sites = [
    'clipboard.com',
    'google.com',
    'facebook.com',
    'youtube.com',
    'yahoo.com',
    'live.com',
    'blogspot.com',
    'wikipedia.org',
    'twitter.com',
    'msn.com',
    'amazon.com',
    'sina.com.cn',
    'linkedin.com',
    'wordpress.com',
    'ebay.com',
    'microsoft.com',
    'paypal.com',
    'flickr.com',
    'imdb.com',
    'craigslist.org',
    'apple.com',
    'bbc.co.uk',
    'cnn.com',
    'tumblr.com',
    'espn.go.com',
    'godaddy.com',
    'adobe.com',
    'about.com',
    'livejournal.com',
    'cnet.com',
    'nytimes.com',
    'weather.com',
    'netflix.com',
    'mozilla.com'
];

async.forEachLimit(
    sites,
    2,
    function(site, callback) {
        var thumbnailer = new OT.Thumbnailer();

        thumbnailer.fromUrl(
            'http://' + site,
            __dirname + '/thumbs/' + site + '.jpg',
            {
                // only applies to jpgs
                quality: 70,

                // Crop the page to be a maximum of 4000 pixels tall, but by setting
                // cropToPage==true this means if the page when rendered is smaller
                // than 4000 pixels we will crop to that size.
                crop: {
                    top: 0,
                    left: 0,
                    width: 1024,
                    height: 4000,
                    cropToPage: true
                },

                // max amount of time to wait before returning
                timeout: 60,

                // the amount of time to wait after the page loads until the
                // page is rendered.  There may be async items loading in the page
                // we will give them a few seconds to load
                delay: 0,

                // log info
                log: false
            },
            function(error, thumbnail) {
                
                console.log(site);
                if (error) {
                    console.error('FAILED: ' + JSON.stringify(error));
                    callback();
                    return;
                }

                // Show details about the thumbnail
                console.dir(thumbnail.getInfo());

                // Make a small version of the thumbnail as well
                thumbnail.resize(
                    {
                        targetPath: __dirname + '/thumbs/' + site + '.small.jpg',

                        // Will fit the thumb to 400 pixels, maintaining
                        // the aspect ratio
                        scaleToWidth: 400,

                        // Crop applies after the scale so this will crop to a max
                        // of 400 pixels wide and tall.  If either dimension of the
                        // thumb is smaller it will not be cropped
                        crop: {
                            top: 0,
                            left: 0,
                            width: 400,
                            height: 400
                        }
                    },
                    function(error, smallThumb) {
                        if (error) {
                            console.dir(error);
                            callback();
                            return;
                        }

                        callback();
                    }
                );
            }
        );      
    },
    function(error) {
        console.log('all done');
    });