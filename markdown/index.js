var fs = require('fs'),
    nunjucks = require('nunjucks');
//var docs_json = fs.readFileSync('docs.json', 'utf8');
//var docs = JSON.parse(docs_json);

//console.log(docs[0]);

function clean_docs(docs) {
    'use strict';
    var i = 0,
        newDocs = [];
    for (i = 0; i < docs.length; i += 1) {
        delete docs[i].meta;
        delete docs[i].comment;
        if (!docs[i].undocumented) {
            newDocs.push(docs[i]);
        }
    }
    return newDocs;
}
function generateMarkdown(srcpath, destpath) {
    'use strict';
    var i, j,
        item,
        main_object,
        params,
        dirty_docs,
        docs,
        outstr,
        module,
        module_title,
        functions;
    dirty_docs = JSON.parse(fs.readFileSync(srcpath, 'utf8'));
    docs = clean_docs(dirty_docs);
    outstr = "";
    functions = [];
    for (i = 0; i < docs.length; i += 1) {
        item = docs[i];
        switch (item.kind) {
        case 'function':
            functions.push(item);
            break;
        case 'module':
            module = item;
            break;
        }
    }
    for (i = 0; i < functions.length; i += 1) {
        item = functions[i];
        params = {};
        main_object = {};
        if (item.params) {
            for (j = 0; j < item.params.length; j += 1) {
                if (item.params[j].name.includes('.')) {
                    
                }
            }
        }
    }
    //module_title = module.description.split('\r')[0];
    //module.description = module.description.split('\r')[1];
    //module.title = module_title;
    //console.log(module);
    //console.log(functions);
    outstr = nunjucks.render('docs.j2', {
        module: module,
        functions: functions
    });
    fs.writeFileSync(destpath, outstr);
}
generateMarkdown('docs.json', 'docs.md');

//console.log(_docs)
