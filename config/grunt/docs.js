/*global module */
module.exports = function (grunt, env, utils) {
    'use strict';

    grunt.config.merge({
        genmd: {
            template: "markdown/docs.j2"
        },
        jsdoc2md: {
            options: {
                'heading-depth': 1,
                'param-list-format': 'list',
                'name-format': '`'
            },
            dynamic_mappings: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= npiux.paths.src %>',
                        src: ['*/*.js'],
                        dest: '<%= npiux.paths.docs %>',
                        rename: function (dest, src) {
                            return dest + src.substr(src.indexOf('/') + 1);
                        },
                        ext: '.md',
                        extDot: 'first'
                    }
                ]
            }
        },
        // Renamed the original grunt-contrib-watch task
        watchRenamed: {
            docs: {
                options: {
                    livereload: true
                },
                files: ['<%= npiux.paths.src %>**/*.*'],
                tasks: ['docs']
            }
        }
    });
    
    grunt.registerTask('prepareDocs', function () {
        var options = {
                filter: 'isFile',
                cwd: grunt.config.get('npiux.paths.src')
            },
            order = 10;
        
        grunt.file.expand(options, '*/docs/*.md').forEach(function (filename) {
            var component,
                pathMarkdown,
                content,
                lines,
                pathFrontmatter,
                frontmatter,
                pathIcons,
                icons,
                i,
                newFile;
            
            component = filename.substr(0, filename.indexOf('/'));
            pathMarkdown = grunt.config.get('npiux.paths.src') + filename;
            content = grunt.file.read(pathMarkdown).replace(/\r\n/g, '\n'); // Standardize line endings
            lines = content.split(/[\r\n]/); // Finds any stray CR characters
            pathFrontmatter = grunt.config.get('npiux.paths.src') + 'docs-header.tmpl';
            frontmatter = grunt.file.read(pathFrontmatter);
            pathIcons = grunt.config.get('npiux.paths.src') + 'docs-icons.tmpl';
            icons = grunt.file.read(pathIcons).replace(/\r\n/g, '\n').split('\n');
            for (i = 0; i < icons.length; i++) {
                if (icons[i].includes(component)) {
                    frontmatter = frontmatter.replace('<<desc>>', '<<desc>>\nicon' + icons[i].substr(icons[i].indexOf(':')));
                    break;
                }
            }
            frontmatter = frontmatter.replace('<<component>>', lines[2].substr(2));
            frontmatter = frontmatter.replace('<<desc>>', lines[3]);
            frontmatter = frontmatter.replace('<<order>>', order);
            order += 10;
            newFile = frontmatter.concat(content);
            
            utils.log('Writing markdown file to stache/' + component + ' directory.');

            grunt.file.write('stache/' + component + '/index.md', newFile);
            
        });
    });
   
    // Main docs tasks
    grunt.registerTask('docs', ['genmd']);
    grunt.registerTask('releaseDocs', ['genmd', 'prepareDocs']);
};

