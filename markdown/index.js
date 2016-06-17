/*jslint browser: false */
/*global require */
var fs = require('fs'),
    nunjucks = require('nunjucks'),
    parse = require('jsdoc-parse');
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

function flattenParameters(params) {
    'use strict';
    var param_objects = {},
        p_nested,
        j;
    for (j = 0; j < params.length; j += 1) {
        if (params[j].name.includes(".")) {
            p_nested = params[j].name.split(".");
            p_nested[0] = p_nested[0].replace("[]", "");
            if (param_objects.hasOwnProperty(p_nested[0])) {
                if (param_objects[p_nested[0]].params) {
                    param_objects[p_nested[0]].params[p_nested[1]] = {};
                    param_objects[p_nested[0]].params[p_nested[1]].name = p_nested[1];
                    param_objects[p_nested[0]].params[p_nested[1]].description = params[j].description;
                    param_objects[p_nested[0]].params[p_nested[1]].optional = params[j].optional;
                } else {
                    param_objects[p_nested[0]].params = {};
                    param_objects[p_nested[0]].params[p_nested[1]] = {};
                    param_objects[p_nested[0]].params[p_nested[1]].name = p_nested[1];
                    param_objects[p_nested[0]].params[p_nested[1]].description = params[j].description;
                    param_objects[p_nested[0]].params[p_nested[1]].optional = params[j].optional;

                }
            }
        } else {
            if (param_objects.hasOwnProperty(params[j].name)) {
                param_objects[params[j].name].description = params[j].description;
                param_objects[params[j].name].name = params[j].name;
                param_objects[params[j].name].optional = params[j].optional;
            } else {
                param_objects[params[j].name] = {};
                param_objects[params[j].name].description = params[j].description;
                param_objects[params[j].name].name = params[j].name;
                param_objects[params[j].name].optional = params[j].optional;
            }
        }
    }
    return param_objects;
        
}

// Generates the markdown files
// src is either a json file or a json string.
function generateMarkdown(src, destpath) {
    'use strict';
    var i,
        item,
        param_objects,
        dirty_docs,
        docs,
        outstr,
        module,
        functions,
        obj,
        newParams,
        p_obj;
    if (src.endsWith(".json")) {
        dirty_docs = JSON.parse(fs.readFileSync(src, 'utf8'));
    } else {
        dirty_docs = JSON.parse(src);
    }
    
    docs = clean_docs(dirty_docs);
    outstr = "";
    functions = [];
    for (i = 0; i < docs.length; i += 1) {
        item = docs[i];
        switch (item.kind) {
        case 'member':
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
        param_objects = {};
        if (item.params) {
            param_objects = flattenParameters(item.params);
        }
        
        item.params = [];
        for (obj in param_objects) {
            if (param_objects.hasOwnProperty(obj)) {
                newParams = [];
                for (p_obj in param_objects[obj].params) {
                    if (param_objects[obj].params.hasOwnProperty(p_obj)) {
                        newParams.push(param_objects[obj].params[p_obj]);
                    }
                }
                param_objects[obj].params = newParams;
                item.params.push(param_objects[obj]);
            }
        }
    }
    outstr = nunjucks.render('docs.j2', {
        module: module,
        functions: functions
    });
    fs.writeFileSync(destpath, outstr);
}
function prepareMarkdown(source) {
    'use strict';
    var stream;
    stream = parse({src: source});
    return stream;
}

function startGenerate(source, dest) {
    'use strict';
    var stream = prepareMarkdown(source),
        str = '',
        chunk;

    stream.on('readable', function () {
        while ((chunk = stream.read()) !== null) {
            str += chunk;
        }
    });
    stream.on('end', function () {
        generateMarkdown(str, dest);

    });
}


startGenerate('../js/src/datamartapi/datamartapi.js', 'dmapi.md');
