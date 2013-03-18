var Fs = require('fs'),
    should = require('should'),
    gm = require('gm'),
    OT = require('../index'),
    Wrench = require('wrench');

function gmNotInstalled(callback) {
	process.nextTick(function() {
		callback(null, false);
	});
}

function gmInstalled(callback) {
	process.nextTick(function() {
		callback(null, true);
	});
}

// Place to stick all the temp files
var tempDir = __dirname + '/temp';
var log = false;

describe('thumbnailer', function() {
	before(function(done) {
		OT.Utils.gmInstalled(function(error, installed) {
			if (error) throw error;

			if (!installed) {
				throw new Error('graphicsmagick must be installed to run these tests');
			}

			done();
		});
	});

	describe('fromUrl', function() {

		beforeEach(function(done) {
			Wrench.rmdirSyncRecursive(tempDir, true);
			Wrench.mkdirSyncRecursive(tempDir, 0777);
			done();
		});

		it('only jpg jpeg and png files are supported', function(done) {
			var thumbnailer = new OT.Thumbnailer();
			thumbnailer.fromUrl('http://example.org', '/foo/bar/out.gif', function(error) {

				should.exist(error);
				error.unsupportedFileType.should.equal(true);
				done();
			});
		})

		it('if quality is specified with png, should give error', function(done) {
			var thumbnailer = new OT.Thumbnailer();
			thumbnailer.fromUrl(
				'http://example.org',
				'/foo/bar/out.png',
				{ quality: 88 },
				function(error) {
					should.exist(error);
					error.badArg.should.equal(true);
					done();
				});
		});

		it('if user specifies quality level and graphicsmagick is not installed, should give error', function(done) {
			var thumbnailer = new OT.Thumbnailer();

			var oldGmInstalled = OT.Utils.gmInstalled;
			OT.Utils.gmInstalled = gmNotInstalled;

			thumbnailer.fromUrl(
				'http://example.org',
				'/foo/bar/out.jpg',
				{ quality: 88 },
				function(error) {
					OT.Utils.gmInstalled = oldGmInstalled;

					should.exist(error);
					error.unsupported.should.equal(true);
					done();
				});
		});

		it('quality should be honoured for jpg thumbnails', function(done) {
			var thumbnailer = new OT.Thumbnailer(),
			    outPath = tempDir + '/slashdot.jpg',
    			quality = 25;

			thumbnailer.fromUrl(
				'http://www.youtube.com/watch?v=v-l2zl85PHs',
				outPath,
				{ quality: quality, delay: 1, log: log },
				function(error, thumbnail) {
					if (error) throw error;
					should.exist(thumbnail);

					gm(outPath).identify(function(error, info) {
						if (error) throw error;

						info['JPEG-Quality'].should.equal(quality.toString());
						done();
					});
				}
			);
		});

		//TODO: Test crop size
	});
});