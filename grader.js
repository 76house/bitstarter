#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var url = require('url');
var HTMLFILE_DEFAULT = "index.html";
var HTMLURL_DEFAULT = "http://warm-bayou-3554.herokuapp.com/";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlIsValid = function(inUrl) {
    if (url.parse(inUrl) == null)
    {
	console.log("%s is not a valid URL. Exiting.", inUrl);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code                                
    }
    return inUrl;
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var doChecks = function($, checksfile) {
    var checks = JSON.parse(fs.readFileSync(checksfile)).sort();
    var out = {};
    for(var ii in checks) {                                                                                                                                                  
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;                                                                                                                                           
    }

    var outJson = JSON.stringify(out, null, 4);                                                                                                                        
    console.log(outJson);
};


var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    doChecks($, checksfile);
};

var buildfn = function(checksfile) {
    return function(result, response) {
	if (result instanceof Error) {
	    console.log('Error: ' + util.format(response.message));
	} else {
	    $ = cheerio.load(result);
	    doChecks($, checksfile);
	}
    };
}

var checkHtmlUrl = function(htmlurl, checksfile) {
    var checkfn = buildfn(checksfile);
    rest.get(htmlurl).on('complete', checkfn);
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
        .option('-u, --url <url_address>', 'URL to index.html', clone(assertUrlIsValid))
        .parse(process.argv);

    var checkJson = (program.url != null) ? 
        checkHtmlUrl(program.url, program.checks) :
	checkHtmlFile(program.file, program.checks);
} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkHtmlUrl = checkHtmlUrl;
}
