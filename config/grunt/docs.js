/*global module */
module.exports = function (grunt) {
    'use strict';

    grunt.config.merge({
        jsdoc2md: {
            options: {
                'heading-depth': 1,
                'param-list-format': 'list'
            },
            separateOutputFilePerInput: {
                files: [
                    {
                        src: 'js/src/datamartauthentication/datamartauthentication.js',
                        dest: 'js/src/datamartauthentication/docs/datamartauthentication.md'
                    }//,
                    //{
                    //    src: 'js/src/datamartapi/datamartapi.js',
                    //    dest: 'js/src/datamartapi/docs/datamartapi.md'
                    //},
                    //{
                    //    src: 'js/src/datamartreport/datamartreport.js',
                    //    dest: 'js/src/datamartreport/docs/datamartreport.md'
                    //}
                ]
            }
        },
        // Renamed the original grunt-contrib-watch task
        watchRenamed: {
            docs: {
                options: {
                    livereload: true
                },
                files: ['<%= npiux.paths.src %>*/docs/*.*'],
                tasks: ['docs']
            }
        }
    });
    
    grunt.registerTask('testDocs', function () {
        var options = {
                filter: 'isFile',
                cwd: grunt.config.get('npiux.paths.src')
            },
            order = 10;
        
        grunt.file.expand(options, '*/docs/*.md').forEach(function (filename) {
            var content,
                component,
                frontmatter,
                pathFrontmatter,
                pathMarkdown,
                lines,
                newFile;
            
            component = filename.substr(0, filename.indexOf('/'));
            pathMarkdown = grunt.config.get('npiux.paths.src') + filename;
            pathFrontmatter = grunt.config.get('npiux.paths.src') + 'docs-header.hbs';
            frontmatter = grunt.file.read(pathFrontmatter);
            content = grunt.file.read(pathMarkdown);
            lines = content.split('\n');
            
            frontmatter = frontmatter.replace('<<order>>', order);
            order += 10;
            frontmatter = frontmatter.replace('<<component>>', component);
            frontmatter = frontmatter.replace('<<desc>>', lines[3]);
            newFile = frontmatter.concat(content);
            
            grunt.file.write('stache/' + component + '/index.md', newFile);
        });
    });
   
    // Main docs task
    grunt.registerTask('docs', ['jsdoc2md', 'testDocs']);
};

