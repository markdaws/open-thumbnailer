// Run inside the phantomjs process

var ERROR_CODES = {
    badArg: 1,
    missingArg: 2,
    timeout: 3,
    openFailed: 4
}

function parseArgs() {
    var args = require('system').args;
    var parsedArgs = {}, parts;
    for (var i=1; i<args.length; ++i) {
        var pair = args[i].split(' ');
        switch(pair[0]) {
        case '--url':
            parsedArgs.url = pair[1];
            break;

        case '--out':
            parsedArgs.out = pair[1];
            break;

        case '--crop':
            parts = pair[1].split('x');
            parsedArgs.crop = {
                top: parseInt(parts[0], 10),
                left: parseInt(parts[1], 10),
                width: parseInt(parts[2], 10),
                height: parseInt(parts[3], 10),
                cropToPage: parts[4] === 'true'
            };
            break;

        case '--viewport':
            parts = pair[1].split('x');
            parsedArgs.viewportSize = {
                width: parseInt(parts[0], 10),
                height: parseInt(parts[1], 10)
            };
            break;

        case '--timeout':
            parsedArgs.timeout = parseInt(pair[1]);
            break;

        case '--delay':
            parsedArgs.delay = parseInt(pair[1], 10);
            break;

        default:
            console.error('Unknown arg: ' + args[i]);
            phantom.exit(ERROR_CODES.badArg);
        }
    }
    return parsedArgs;
}

var args = parseArgs();
if (!args.out) {
    console.error('Missing arg: --out');
    phantom.exit(ERROR_CODES.missingArg);
}

var page = require('webpage').create();

if (args.viewportSize) {
    page.viewportSize = args.viewportSize;
}

var timeoutId = setTimeout(function() {
    phantom.exit(ERROR_CODES.timeout);
}, args.timeout * 1000);

page.open(args.url, function (status) {
    clearTimeout(timeoutId);

    if (status !== 'success') {
        phantom.exit(ERROR_CODES.openFailed);
        return;
    }

    var documentSize = page.evaluate(function() {
        return { width: document.width, height: document.height };
    });

    if (args.crop) {
        page.clipRect = args.crop;

        if (args.crop.cropToPage) {
            page.clipRect = {
                top: args.crop.top,
                left: args.crop.left,
                width: Math.min(page.clipRect.width, documentSize.width),
                height: Math.min(page.clipRect.height, documentSize.height)
            };
        }
    }

    setTimeout(function() {
        page.render(args.out);
        phantom.exit();
    }, args.delay * 1000);
});