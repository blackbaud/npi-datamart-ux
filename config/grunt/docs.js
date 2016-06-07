/*global module, require */
module.exports = function (grunt) {
    'use strict';

    grunt.config.merge({
        stacheConfig: grunt.file.readYAML('stache.yml'),
        jsdoc2md: {
            separateOutputFilePerInput: {
                files: [
                    { src: 'src/jacket.js', dest: 'api/jacket.md' },
                    { src: 'src/shirt.js', dest: 'api/shirt.md' }
                ]
            }
        },
        connect: {
            docs: {
                options: {
                    base: [
                        '<%= stacheConfig.build %>'
                    ],
                    livereload: true,
                    port: 4000
                }
            }
        },
        copy: {
            docs: {
                expand: true,
                src: '<%= npiux.paths.dist %>**',
                dest: '<%= stacheConfig.build %>'
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

    // Convert our documentation into standard JSDOC format JSON
    grunt.registerTask('prepareDocs', function (status) {
        var json = [],
            options = {
                filter: 'isFile',
                cwd: grunt.config.get('npiux.paths.src')
            },
            pages = {},
            pattern = '/docs/demo.',
            yfm = require('assemble-yaml');

        function addDemo(fm, component, ext) {
            var demo = grunt.config.get('npiux.paths.src') + component + pattern + ext;
            if (grunt.file.exists(demo)) {
                fm['example-' + ext] = grunt.file.read(demo);
            }
        }

        // Find all the demo.md files
        grunt.file.expand(options, '*' + pattern + 'md').forEach(function (filename) {
            var content,
                component,
                frontmatter,
                frontmatterProperty,
                jsonItem,
                pathMarkdown;

            component = filename.substr(0, filename.indexOf('/'));
            pathMarkdown = grunt.config.get('npiux.paths.src') + filename;
            frontmatter = yfm.extractJSON(pathMarkdown) || {};
            content = grunt.file.read(pathMarkdown);
            jsonItem = {};

            addDemo(frontmatter, component, 'html');
            addDemo(frontmatter, component, 'js');

            // Copy over properties shared
            for (frontmatterProperty in frontmatter) {
                if (frontmatter.hasOwnProperty(frontmatterProperty)) {
                    jsonItem[frontmatterProperty] = frontmatter[frontmatterProperty];
                }
            }

            // Add legacy jsdoc properties
            jsonItem.key = component;
            jsonItem.description = yfm.stripYFM(pathMarkdown).replace(/^\s+|\s+$/g, '');
            json.push(jsonItem);

            // Layout does not need to be in legacy JSON
            frontmatter.layout = '../../../../demo/layouts/layout-npiux';
            pages['components/' + component + '/index.md'] = {
                content: content,
                data: frontmatter
            };
        });

        grunt.file.write('demo/data/npi-dm.json', JSON.stringify(json, null, 2));
        grunt.config.set('assemble.custom.options.pages', pages);
        grunt.config.set('stache.config.build', '<%= stache.config.demo %>' + status + '/');
    });

    // Main docs task
    grunt.registerTask('docs', ['prepareDocs:build', 'status:demo/build', 'stache-build', 'copy:docs']);
};
