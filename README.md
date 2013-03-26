# open-thumbnailer

##Overview
A friendly [node.js](www.nodejs.org) JavaScript wrapper around [phantomjs](http://phantomjs.org/) that lets you create webpage thumbnails in a headless environment with a few lines of code.  There are generally several things you want to do when creating a thumbnail:

 - Render the webpage as a PNG or JPG
 - Control the quality level of your saved thumbnail (for JPGs)
 - Resize the thumbnail
 - Crop the thumbnail
 - Copy / Delete / Rename thumbnails

The open-thumbnailer library makes all of this very easy.

##Installation
`npm install open-thumbnailer`

To use a lot of the functionality in the library you will need to install [graphicsmagick](http://www.graphicsmagick.org) as well.

##Examples Thumbnails
Here are some example thumbnails generated by this library:

![](https://raw.github.com/markdaws/open-thumbnailer/master/examples/thumbs/apple.com.small.jpg)
![](https://raw.github.com/markdaws/open-thumbnailer/master/examples/thumbs/amazon.com.small.jpg)


![](https://raw.github.com/markdaws/open-thumbnailer/master/examples/thumbs/clipboard.com.small.jpg)
![](https://raw.github.com/markdaws/open-thumbnailer/master/examples/thumbs/ebay.com.small.jpg)

To see some more thumbnails, look in the examples/thumbs directory.  You can run the examples/top.js example and generate these thumbs for yourself.

##Thumbnailer Examples

###Supported File Formats
You can save thumbnails as PNG of JPG files.  For JPG files you can also specify a quality value in the fromUrl options that affects the JPG quality.

To create a thumbnail it's really just a few lines of code.  For example to create a thumbnail for www.imdb.com you would do:

```javascript
var OT = require('open-thumbnailer'),
    thumbnailer = new OT.Thumbnailer();

thumbnailer.fromUrl(
    'http://www.imdb.com',
    __dirname + '/imdb.com.jpg',
    function(error, thumbnail) {

        if (error) {
            console.dir(error);
            return;
        }

        console.dir(thumbnail.getInfo());
    }
);
```

At any point you can cancel an in progress thumbnail
```
thumbnailer.cancel();
```

There are various options you can specify to the thumbnailer when creating a thumb:
```javascript
var OT = require('open-thumbnailer'),
    thumbnailer = new OT.Thumbnailer();

thumbnailer.fromUrl(
    'http://www.imdb.com',

    // To save as a PNG, simply change the file extension to PNG
    __dirname + '/imdb.com.jpg',
    {
      // A number between 0 and 100 that specifies the quality of the jpg thumb.
      // Only applies if you are creating jpgs, not pngs
      quality: 75,

      // If you don't specify an extension on the output path, then you must specify
      // the format here, if you don't want the default of jpg.  Can be jpg, jpeg or png.
      // This value will be ignored if the output path has an extension already set on
      // it of png | jpg | jpeg
      format: 'jpg',

      // Can be true, which will use a simple internal console.log method
      // to log status, or you can provide your own log object e.g.
      log: {
        verbose: function(message) { console.log(message); },
        error: function(message, error) { console.error(JSON.stringify(error))}
      },

      // The amount of time to wait before cancelling the thumbnail.  If a page
      // is taking a long time to load you may want to cancel
      timeout: 60,

      // The amount of time (in seconds) to wait after the page loads before actually
      // trying to render the page.  There may be cases where the page loads content
      // asyncronously and if you render straight away on load the page may not have
      // all the content.
      delay: 10,

      // The size of the window when the page is loaded.  This is not a crop size it
      // is the size of the browser window to use when loading the content.  Content loaded
      // outside of these values will still be rendered in the final thumb.  If you want
      // to crop then use the crop value as specified below
      viewport: { width: 1024, height: 768 },

      // The part of the page to render. The interesting part here is cropToPage, if this
      // is false then if the rendered webpage is smaller than the crop region the thumbnail
      // will still be as big as the crop region with pixels filled in black, however if you
      // set cropToPage:true, then if the webpage is smaller than the crop size the thumbnail
      // will be the same size as the page.
      crop: { top:0, left:0, width: 1024, height: 400, cropToPage: true }
    },
    function(error, thumbnail) {

        if (error) {
            console.dir(error);
            return;
        }

        console.dir(thumbnail.getInfo());
    }
);
```

##Thumbnail Examples
Once you have generated a thumbnail, you will have a Thumbnail instance, there are several methods available to you:

###getInfo -> returns basic information about the thumbnail
```javascript
var info = thumb.getInfo();
console.log(info.width + 'x' + info.height + ' at ' + info.path + ' ' + info.size + ' bytes');
```

###destroy -> deletes the thumbnail from the disk
```javascript
thumb.destroy(function(error) {
  console.dir(error);
});
```

###copy -> creates a copy of the thumbnail on disk
```javascript
thumb.copy('some-new-file-name.jpg', function(error, copyOfThumb) {
  console.log(copyOfThumb.getInfo().path);
});
```

###move -> moves the thumbnail on disk
```javascript
thumb.move('new-file-location.jpg', function(error) {
  console.dir(error);
});
```

###resize -> resizes and potentially crops the thumbnail
```javascript
thumb.resize(
  {
    // scales the thumbnail to 400 pixels wide, the aspect ratio of the clip
    // will be maintained
    scaleToWidth: 400,

    // scales the thumbnail to 600 pixels tall.  Only specify one of scaleToWidth
    // and scaleToHeight, if both are specified the behaviour is unspecified
    scaleToHeight: 600,

    // Optional - if not specified the thumb will be resized and the original
    // thumb variable points to the resized thumb.  If you specify a targetPath
    // then a copy of the thumb is made and resized and the copied thumb is
    // returned in the callback
    targetPath: 'some-new-file.jpg',

    // crops the thumbnail AFTER it has been resized, so for example if you set
    // scaleToWidth to 400 and wanted a square thumbnail, you could then crop the
    // height to 400 pixels here to make the output square
    crop: { top:0, left: 0, width: 400, height: 400 }

  },
  function(error, resizedThumb) {
    // NOTE: resizedThumb will be null if you did not specify a targetpath
    // in the options
  }
);
```




## Development
1. Install GraphicsMagick http://www.graphicsmagick.org/   (sudo port install graphicsmagick)

```shell
git clone https://github.com/markdaws/open-thumbnailer.git
cd open-thumbnailer
npm install
npm test


node examples/top.js
