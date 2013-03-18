var OT = require('../index'),
    async = require('async');

// Some popular sites
var sites = [
    'google.com',
    'facebook.com',
    'youtube.com',
    'yahoo.com',
    'live.com',
    'baidu.com',
    'blogspot.com',
    'wikipedia.org',
    'twitter.com',
    'msn.com',
    'amazon.com',
    'sina.com.cn',
    'google.de',
    'linkedin.com',
    'bing.com',
    'wordpress.com',
    'google.co.uk',
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
    5,
    function(site, callback) {
        var thumbnailer = new OT.Thumbnailer();

        thumbnailer.fromUrl(
            'http://' + site,
            __dirname + '/' + site + '.jpg',
            {
                // only applies to jpgs
                quality: 75,

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

                // max amount of time to wait before returning
                timeout: 20,

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
                }

                if (thumbnail) {
                    // Show details about the thumbnail
                    console.dir(thumbnail.getInfo());
                }

                callback();

                /*
                // Cleanup the thumbnail
                setTimeout(function() {
                    thumbnail.destroy(function() {
                        console.log('deleted');
                    });
                }, 2000);*/
            }
        );      
    },
    function(error) {
        console.log('all done');
    });