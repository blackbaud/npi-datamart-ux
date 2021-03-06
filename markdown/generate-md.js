/*jslint browser: false */
/*global require, module*/
/*exported startGenerate */
module.exports = function (grunt, env, utils) {
    'use strict';
    var fs = require('fs'),
        nunjucks = require('nunjucks'),
        parse = require('jsdoc-parse');

    function clean_docs(docs) {
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
                        param_objects[p_nested[0]].params[p_nested[1]].id = params[j].id;
                    } else {
                        param_objects[p_nested[0]].params = {};
                        param_objects[p_nested[0]].params[p_nested[1]] = {};
                        param_objects[p_nested[0]].params[p_nested[1]].name = p_nested[1];
                        param_objects[p_nested[0]].params[p_nested[1]].description = params[j].description;
                        param_objects[p_nested[0]].params[p_nested[1]].optional = params[j].optional;
                        param_objects[p_nested[0]].params[p_nested[1]].id = params[j].id;

                    }
                }
            } else {
                if (param_objects.hasOwnProperty(params[j].name)) {
                    param_objects[params[j].name].description = params[j].description;
                    param_objects[params[j].name].name = params[j].name;
                    param_objects[params[j].name].optional = params[j].optional;
                    param_objects[params[j].name].id = params[j].id;
                } else {
                    param_objects[params[j].name] = {};
                    param_objects[params[j].name].description = params[j].description;
                    param_objects[params[j].name].name = params[j].name;
                    param_objects[params[j].name].optional = params[j].optional;
                    param_objects[params[j].name].id = params[j].id;
                }
            }
        }
        return param_objects;

    }

    // Generates the markdown files
    // src is either a json file or a json string.
    function generateMarkdown(src, destpath) {
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
        outstr = nunjucks.render(grunt.config.get('genmd.template'), {
            module: module,
            functions: functions
        });
        grunt.file.write(destpath, outstr);
        //fs.writeFileSync(destpath, outstr);
        return true;
    }
    function prepareMarkdown(source) {
        var stream;
        stream = parse({src: source});
        return stream;
    }

    function startGenerate(src, dest) {
        var stream = prepareMarkdown(src),
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
        return stream;
    }
    grunt.registerTask('genmd', function () {
        var done = this.async(),
            options = {
                filter: 'isFile',
                cwd: grunt.config.get('npiux.paths.src')
            },
            files = grunt.file.expand(options, '*/*.js'),
            monitor = {
                finished: 0,
                done: function () {
                    this.finished++;
                    if (this.finished === files.length) {
                        done();
                    }
                }
            };

        files.forEach(function (filename) {
            var path,
                component = filename.substr(0, filename.indexOf('/')),
                renderStream;
            path = grunt.config.get('npiux.paths.src');
            utils.log('Writing markdown file to ' + path + filename.replace(".js", ".md").replace(component, component + "/docs"));
            renderStream = startGenerate(path + filename, path + filename.replace(".js", ".md").replace(component, component + "/docs"));
            renderStream.on('error', grunt.fail.fatal);
            renderStream.on('end', function () {
                monitor.done();
            });
        });
    });
};