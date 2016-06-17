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

function flattenParameters(params) {
    'use strict';
    var param_objects = {},
        p_nested,
        item,
        j,
        arr,
        object;
    for (j = 0; j < params.length; j += 1) {
        if (params[j].name.includes(".")) {
            p_nested = params[j].name.split(".");
            p_nested[0] = p_nested[0].replace("[]", "")
            if(p_nested[0] in param_objects) {
                if(param_objects[p_nested[0]].params) {
                    param_objects[p_nested[0]].params[p_nested[1]] = {};
                    param_objects[p_nested[0]].params[p_nested[1]].name = p_nested[1];
                    param_objects[p_nested[0]].params[p_nested[1]].description = params[j].description;
                    param_objects[p_nested[0]].params[p_nested[1]].optional = params[j].optional;
                }
                else {
                    param_objects[p_nested[0]].params = {};
                    param_objects[p_nested[0]].params[p_nested[1]] = {};
                    param_objects[p_nested[0]].params[p_nested[1]].name = p_nested[1];
                    param_objects[p_nested[0]].params[p_nested[1]].description = params[j].description;
                    param_objects[p_nested[0]].params[p_nested[1]].optional = params[j].optional;

                }
            }
        }
        else {
            if(params[j].name in param_objects) {
                param_objects[params[j].name].description = params[j].description;
                param_objects[params[j].name].name = params[j].name
                param_objects[params[j].name].optional = params[j].optional;
            }
            else {
                param_objects[params[j].name] = {}
                param_objects[params[j].name].description = params[j].description;
                param_objects[params[j].name].name = params[j].name
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
    var i, j,
        item,
        param_objects,
        params,
        dirty_docs,
        docs,
        outstr,
        module,
        members,
        module_title,
        functions;
    if(src.endsWidth(".json")){
        dirty_docs = JSON.parse(fs.readFileSync(src, 'utf8'));
    }
    else {
        dirty_docs = JSON.parse(src);
    }
    docs = clean_docs(dirty_docs);
    outstr = "";
    functions = [];
    members = [];
    for (i = 0; i < docs.length; i += 1) {
        item = docs[i];
        switch (item.kind) {
        case 'member':
            //members.push(item);
            //break;
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
        if(item.params) {
            param_objects = flattenParameters(item.params);
        }
        
        item.params = [];
        for(var object in param_objects) {
            var newParams = []
            for (var p in param_objects[object].params){
                newParams.push(param_objects[object].params[p])
            }
            param_objects[object].params = newParams;
            item.params.push(param_objects[object]);
        }
        console.log(item.params)
    }
    outstr = nunjucks.render('docs.j2', {
        module: module,
        functions: functions,
        members: members,
    });
    fs.writeFileSync(destpath, outstr);
}
generateMarkdown('dmauth.json', 'dmauth.md');
generateMarkdown('dmapi2.json', 'dmapi2.md');
generateMarkdown('dmreport.json', 'dmreport.md')
//console.log(_docs)