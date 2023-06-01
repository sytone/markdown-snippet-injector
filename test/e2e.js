var assert = require('assert'),
  fs = require('fs'),
  shelljs = require("shelljs"),
  rootFolder = "test/root",
  docsrootFolder = "./test/docsroot-output";

function preparedemo() {
  console.log('Preparing for tests ...');
  shelljs.rm('-rf', docsrootFolder);
  //shelljs.mkdir('-p', "test/docsroot-result");
  shelljs.cp("-R", "test/docsroot", docsrootFolder);
  console.log('Preparing for tests ... DONE');
}

function hasPattern(filename, pattern, shouldExists, callback) {
  fs.readFile(docsrootFolder + '/' + filename, function read(err, data) {
    if (err) {
      callback('Pattern ' + pattern + ' is NOT found because of an error: ' + err);
    } else {
      if (data.toString().indexOf(pattern) === -1) {
        callback(shouldExists ? 'Pattern ' + pattern + ' is NOT found' : null);
      } else {
        callback(shouldExists ? null : 'Pattern ' + pattern + ' WAS found. This is NOT expected.');
      }
    }
  });
}

function contain(filename, pattern, callback) {
  hasPattern(filename, pattern, true, callback);
}

function notContain(filename, pattern, callback) {
  hasPattern(filename, pattern, false, callback);
}

describe('markdown-snippet-injector', function () {

  beforeEach(function (done) {
    preparedemo();
    done();
  });

  describe('XML',
    function () {
      it('should process XML snippets', function (done) {
        shelljs.exec('node index.js --root=./test/root --docsroot=./test/docsroot-output --sourceext=".xml" --placeholderPrefix="<" --placeholderSuffix=">"');
        shelljs.cp('-f', "test/docsroot-output/test.md", "test/docsroot-result/xml1.md");
        notContain('test.md', "<snippet id='xml-snippet'/>", function () {
          notContain('test.md', "<snippet id='xml-snippet'>", function () {
            contain('test.md', '<Label fontSize="20" text="{{ itemName }}"/>', done);
          });
        });
      });

      it('should process XML snippets and wrap it', function (done) {
        shelljs.exec('node index.js -w --root=./test/root --docsroot=./test/docsroot-output --sourceext=".xml" --placeholderPrefix="<" --placeholderSuffix=">"');
        shelljs.cp('-f', "test/docsroot-output/test.md", "test/docsroot-result/xml2.md");
        notContain('test.md', "<snippet id='xml-snippet'/>", function () {
          contain('test.md', "<snippet id='xml-snippet'>", function () {
            contain('test.md', '<Label fontSize="20" text="{{ itemName }}"/>', done);
          });
        });
      });
    });

  describe('TypeScript',
    function () {
      it('should process TypeScript snippets', function (done) {
        var testFileName = 'test.ts.md';
        shelljs.exec(`node index.js --root=./test/root --docsroot=./test/docsroot-output/${testFileName} --sourceext=".ts"`);
        shelljs.cp('-f', `test/docsroot-output/${testFileName}`, "test/docsroot-result/ts1.md");
        notContain(testFileName, "%%snippet id='ts-snippet'/%%", function () {
          notContain(testFileName, "%%snippet id='ts-snippet'%%", function () {
            notContain(testFileName, "%%/snippet%%", function () {
              contain(testFileName, 'return a + b;', done);
            });
          });
        });
      });

      it('should process TypeScript snippets and wrap', function (done) {
        var testFileName = 'test.ts.md';
        shelljs.exec(`node index.js -w --root=./test/root --docsroot=./test/docsroot-output/${testFileName} --sourceext=".ts"`);
        shelljs.cp('-f', `test/docsroot-output/${testFileName}`, "test/docsroot-result/ts2.md");
        notContain(testFileName, "%%snippet id='ts-snippet'/%%", function () {
          contain(testFileName, "%%snippet id='ts-snippet'%%", function () {
            contain(testFileName, "%%/snippet%%", done);
          });
        });
      });
    });

  describe('CSS',
    function () {
      it('should process CSS snippets', function (done) {
        shelljs.exec('node index.js --root=./test/root --docsroot=./test/docsroot-output --sourceext=".css" --placeholderPrefix="<" --placeholderSuffix=">"');
        shelljs.cp('-f', "test/docsroot-output/test.md", "test/docsroot-result/css1.md");
        notContain('test.md', "<snippet id='css-snippet'/>", function () {
          notContain('test.md', "<snippet id='css-snippet'>", function () {
            notContain('test.md', "</snippet>", function () {
              contain('test.md', 'text-align: center;', done);
            });
          });
        });
      });

      it('should process CSS snippets and wrap', function (done) {
        shelljs.exec('node index.js -w --root=./test/root --docsroot=./test/docsroot-output --sourceext=".css" --placeholderPrefix="<" --placeholderSuffix=">"');
        shelljs.cp('-f', "test/docsroot-output/test.md", "test/docsroot-result/css2.md");
        notContain('test.md', "<snippet id='css-snippet'/>", function () {
          contain('test.md', "<snippet id='css-snippet'>", function () {
            contain('test.md', "</snippet>", function () {
              contain('test.md', 'text-align: center;', done);
            });
          });
        });
      });

      it('should keep hidden the marked area in CSS', function (done) {
        shelljs.exec('node index.js --root=./test/root --docsroot=./test/docsroot-output --sourceext=".css" --placeholderPrefix="<" --placeholderSuffix=">"');
        shelljs.cp('-f', "test/docsroot-output/test.md", "test/docsroot-result/css3.md");
        notContain('test.md', "visibility: hidden;", done);
      });

      it('should NOT process snippetIds that are not defined in source', function (done) {
        shelljs.exec('node index.js --root=./test/root --docsroot=./test/docsroot-output --sourceext=".css" --placeholderPrefix="<" --placeholderSuffix=">"');
        shelljs.cp('-f', "test/docsroot-output/test.md", "test/docsroot-result/css4.md");
        contain('test.md', "<snippet id='cssSnippet'/>", function () {
          notContain('test.md', "<snippet id='cssSnippet'>", done);
        });
      });

      it('should update the already processed snippet tags', function (done) {
        shelljs.exec('node index.js --root=./test/root --docsroot=./test/docsroot-output --sourceext=".css" -w --placeholderPrefix="<" --placeholderSuffix=">"');
        shelljs.cp('-f', "test/docsroot-output/test.md", "test/docsroot-result/css5.md");
        contain('test.md', "<snippet id='css-already-processed' options=''>", function () {
          contain('test.md', "</snippet>", function () {
            contain('test.md', "color: red;", done);
          });
        });
      });
    });
});