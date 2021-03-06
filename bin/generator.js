#!/usr/bin/env node

const _fs = require('fs-magic');
const _path = require('path');
const _assetsPath = _path.join(__dirname, '../assets');
const _langPath = _path.join(__dirname, '../i18n');
const _cli = require('commander');
const _pkg = require('../package.json');
const _pageRenderer = require('../lib/page-renderer');
const _jsonReader = require('../lib/json-reader');

// global paths
let templatePath = null;
let cssPath = null;
let jsPath = null;

async function generator(configFilename, pageDefinitionFiles, distPath){
    // load config
    const config = await _jsonReader(configFilename);

    // load page definitions
    const pages = {};
    for (var pageDefinitionFile of pageDefinitionFiles) {
    	let lang = /pages-(.+)\.json/.exec(pageDefinitionFile)[1];
    	let page_messages = await _jsonReader(pageDefinitionFile);
    	let common_messages = await _jsonReader(_path.join(_langPath, 'common-'+lang+'.json'));
    	for (var key in page_messages) {
    		pages[key] = pages[key] || {};
    		pages[key].messages = pages[key].messages || [];
    		page_messages[key]["lang"] = lang;
    		for (var cm in common_messages) {
        		page_messages[key][cm] = common_messages[cm];
    		}
    		pages[key].messages.push(page_messages[key]);
    	}
    }
        
    // load template
    const tpl = await _fs.readFile(templatePath, 'utf8');
   
    // load css
    const css = await _fs.readFile(cssPath, 'utf8');
    
    // load js
    const js = await _fs.readFile(jsPath, 'utf8');

    console.log('Generating static pages');

    // for each errorcode generate custom page
    await Promise.all(Object.keys(pages).map(async function(p){
        // page config
        const pconf = pages[p];

        // inject errorcode
        pconf.code = p;

        // inject foote
        pconf.footer = pconf.footer || config.footer;

        // render page
        const content = await _pageRenderer(tpl, css, js, pconf);

        // generate filename
        const filename = 'HTTP' + p + '.html';

        // write content to file
        await _fs.writeFile(_path.join(distPath, filename), content, 'utf8');

        console.log(' |- Page <' + filename + '>');
    }));
}

async function loadFileList() {
	
}


// CLI setup
_cli
// read file version package.json
.version(_pkg.version)

// static error page generator
.command('static [config]')
    .description('run http-error-pages generator')
    .option('-t, --template <path>', 'path to your custom EJS template file', null)
    .option('-s, --styles <path>', 'path to your custom stylesheet (precompiled as CSS!)', null)
    .option('-p, --pages <path>', 'path to your custom page definition', null)
    .option('-l, --langs <langs>', 'the included languages of the page definition', null)
    .option('-o, --out <path>', 'output directory', null)
    .action(function(configFilename, options) {
    	
    	// Load available default language files
    	_fs.scandir(_langPath, false, false).then(function(langFiles) {
	    
	        // config set ?
	        const configPath = configFilename || _path.join(__dirname, '../config.json');
	
	        // template path set ?
	        templatePath = options.template || _path.join(_assetsPath, 'template.ejs');
	
	        // style path set ?
	        cssPath = options.styles || _path.join(_assetsPath, 'layout.css');
	
	        // javascript path set ?
	        jsPath = options.styles || _path.join(_assetsPath, 'translate.js');
	
	        // output path set ?
	        const distPath = options.out || _path.join(__dirname, '../dist');
	
	        // language set ? use en_US as default
	        const langs = options.langs;
	
	        // custom page definition available ?
	        let pageDefinitionFiles = options.pages || null;
	
	        // page definition not set ? use lang
	        if (pageDefinitionFiles === null) {
	        	pageDefinitionFiles = langFiles[0].filter(f => /pages-.+\.json/g.test(f));
	        } else if (!Array.isArray(pageDefinitionFiles)){
	        	pageDefinitionFiles = [pageDefinitionFiles];
	        }
	
	        // show paths
	        console.log('');
	        console.log('Paths');
	        console.log(' |- Config:', configPath);
	        console.log(' |- Template:', templatePath);
	        console.log(' |- Styles:', cssPath);
	        console.log(' |- Pages:', JSON.stringify(pageDefinitionFiles));
	        console.log('');
	
	        // run async generator
	        generator(configPath, pageDefinitionFiles, distPath)
	            .then(function(){
	                console.log('Static files generated\n');
	            })
	            .catch(function(e){
	                console.error(e);
	            });
        });
    });

_cli
    .command('*')
    .action(function(c){
        console.error('Unknown command "' + c + '"');
        _cli.outputHelp();
    });

// run the commander dispatcher
_cli.parse(process.argv);

// default action (no command provided)
if (!process.argv.slice(2).length) {
_cli.outputHelp();
}