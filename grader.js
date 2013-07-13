#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attrributes.
Uses commander.js and cheerio.  Teaches command line application development
and basic DOM parsing.

References:

+ cheerio
   - https://github.com/MattewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom
   - http://maxogden.com/scrapping-with-node.html

+ commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-inter
faces-made-easy

+ JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile){
    var instr = infile.toString();
    if(!fs.existsSync(instr)){
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioUrlData = function(urlData){
    return cheerio.load(urlData);
};

var loadChecks = function(checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, urlData){
    if(urlData)
	$ = cheerioUrlData(urlData);
    else
	$ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    checkJson(out);
};

var checkUrl = function(checksfile, url){
    rest.get(url).on('complete', function(response){
	processResponse(response, checksfile);
    });
};

var checkJson = function(json){
    var outJson = JSON.stringify(json, null, 4);
    console.log(outJson);
};


var processResponse = function(data, checksfile){
    var str = data.toString();
    console.log(str);
    checkHtmlFile(null, checksfile, data);
};

var clone = function(fn){
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'Point to URL to check')
	.parse(process.argv);
    if(program.url)
	checkUrl(program.checks, program.url);
    else
	checkHtmlFile(program.file, program.checks);
} else {
    exports.checkHtmlFile = checkhtmlFile;
}
