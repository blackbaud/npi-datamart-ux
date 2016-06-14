/*global module*/
module.exports = function (grunt, env, utils) {
    'use strict';

    grunt.config.merge({
        npiux: {
            paths: {
                dist: (env.isCurrent(env.SUPPORTED.LOCAL) ? 'bin/' : 'dist/'),
                src: 'js/src/',
                docs: 'js/docs/',
                templates: 'js/templates/',
                npiDatamartJs: [
                    '<%= npiux.paths.src %>*/*.js',
                    '<%= npiux.paths.src %>module.js',
                    '<%= npiux.paths.templates %>templates.js.tmp'
                ],
                libsJs: [
                    'node_modules/blackbaud-skyux/dist/js/sky-bundle.js'
                ]
            }
        },
        concat_sourcemap: {
            options: {
                process: function (src) {
                    //Remove source map on input, as the process cant handle that and it will fail.
                    return src.replace("//# sourceMappingURL=sky-bundle.js.map", "");
                },
                sourcesContent: true,
                sourceRoot: '../..'
            },
            dist: {
                files: {
                    '<%= npiux.paths.dist %>js/libs.js': '<%= npiux.paths.libsJs %>',
                    '<%= npiux.paths.dist %>js/npi-datamart.js': '<%= npiux.paths.npiDatamartJs %>'
                }
            },
            npibundle: {
                files: {
                    '<%= npiux.paths.dist %>js/npi-bundle.js': [
                        '<%= npiux.paths.libsJs %>',
                        '<%= npiux.paths.npiDatamartJs %>'
                    ]
                }
            }
        },
        html2js: {
            options: {
                base: 'js/',
                indentString: '    ',
                module: 'npi-datamart.templates',
                quoteChar: '\'',
                singleModule: true
            },
            main: {
                src: ['<%= npiux.paths.templates %>**/*.html'],
                dest: '<%= npiux.paths.templates %>templates.js.tmp'
            }
        },
        sri: {
            dist: {
                options: {
                    algorithms: ['sha384'],
                    dest: '<%= npiux.paths.dist %>sri.json'
                },
                src: '<%= npiux.paths.dist %>/**/*.js'
            }
        },
        // Renamed the original grunt-contrib-watch task
        watchRenamed: {
            options: {
                livereload: true
            },
            scripts: {
                files: [
                    '<%= npiux.paths.npiDatamartJs %>',
                    '<%= npiux.paths.templates %>**/*.html'
                ],
                tasks: ['watch-scripts']
            },
            jshint: {
                files: ['gruntfile.js', 'js/**/*.js'],
                tasks: ['lint']
            }
        },
        uglify: {
            options: {
                // Source map isn't perfect here, but it's serviceable.  Be on the lookout for updates to this task
                // in case it's fixed.
                sourceMap: true,
                sourceMapIncludeSources: true
            },
            libs: {
                options: {
                    sourceMapIn: '<%= npiux.paths.dist %>js/libs.js.map'
                },
                src: ['<%= npiux.paths.dist %>js/libs.js'],
                dest: '<%= npiux.paths.dist %>js/libs.min.js'
            },
            dist: {
                options: {
                    sourceMapIn: '<%= npiux.paths.dist %>js/npi-datamart.js.map'
                },
                src: ['<%= npiux.paths.dist %>js/npi-datamart.js'],
                dest: '<%= npiux.paths.dist %>js/npi-datamart.min.js'
            },
            npibundle: {
                options: {
                    sourceMapIn: '<%= npiux.paths.dist %>js/npi-bundle.js.map'
                },
                src: ['<%= npiux.paths.dist %>js/npi-bundle.js'],
                dest: '<%= npiux.paths.dist %>js/npi-bundle.min.js'
            }
        }
    });

    // The watch task supports the "--rapid" flag.
    grunt.registerTask('scripts', function () {
        utils.run({
            'html2js': true,
            'concat_sourcemap': true,
            'uglify': false
        });
    });

    // The watch task supports the "--rapid" flag.
    grunt.registerTask('watch', function () {
        utils.run({
            'build': false,
            'docs': false,
            'karma:watch:start': false,
            'watchRenamed': true
        });
    });

    // The watch-scripts task supports the "--rapid" flag.
    grunt.registerTask('watch-scripts', function () {
        utils.run({
            'scripts': true,
            'karma:watch:run': false,
            'docs': true
        });
    });

    // Main build task
    grunt.registerTask('build', ['scripts', 'sri']);
};
