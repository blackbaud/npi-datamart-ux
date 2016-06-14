/*global module */
module.exports = function (grunt, env, utils) {
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
                    },
                    {
                        src: 'js/src/datamartapi/datamartapi.js',
                        dest: 'js/src/datamartapi/docs/datamartapi.md'
                    }//,
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
                files: ['<%= npiux.paths.src %>datamartreport/docs/*.*'],
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
            content = grunt.file.read(pathMarkdown).replace(/\r\n/g, '\n'); // Standardize Reports MD file
            lines = content.split(/[\r\n]/); // Find stray CR character
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
            frontmatter = frontmatter.replace('<<order>>', order);
            order += 10;
            if (order > 30) { // Don't modify Reports MD
                frontmatter = frontmatter.replace('<<component>>', lines[2].substr(2));
                frontmatter = frontmatter.replace('<<desc>>', lines[3]);
                frontmatter = frontmatter.replace('<<icon>>', lines[4]);
            } else {
                frontmatter = frontmatter.replace('<<component>>', lines[3]);
                frontmatter = frontmatter.replace('<<desc>>', lines[4]);
                frontmatter = frontmatter.replace('<<icon>>', lines[5]);
                lines[3] = '# ' + lines[3];
                lines.splice(2, 1);
                content = lines.join('\n');
                grunt.file.write(pathMarkdown, content);
            }
            newFile = frontmatter.concat(content);
            
            utils.log('Writing markdown file to stache/' + component + ' directory.');

            grunt.file.write('stache/' + component + '/index.md', newFile);
            
        });
    });
   
    // Main docs task
    grunt.registerTask('docs', ['jsdoc2md', 'prepareDocs']);
};

