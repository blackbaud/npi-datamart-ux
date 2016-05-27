/*global module*/
module.exports = function (grunt, env, utils) {
    'use strict';

    grunt.config.merge({
        npiux: {
            paths: {
                dist: (env.isCurrent(env.SUPPORTED.LOCAL) ? 'bin/' : 'dist/'),
                src: 'js/src',
                templates: 'js/templates/',
                npiDatamartJs: [
                    '<%= npiux.paths.src %>*/*.js',
//                    '<%= npiux.paths.src %>module.js',
                    '<%= npiux.paths.templates %>templates.js.tmp'
                ],
                libsJs: [
                    'node_modules/jquery/dist/jquery.js',
                    'node_modules/jquery-ui-bundle/jquery-ui.js',
                    'node_modules/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js',
                    'node_modules/bootstrap/dist/js/bootstrap.js',
                    'node_modules/enquire.js/dist/enquire.js',
                    'node_modules/angular/angular.js',
                    'node_modules/angular-animate/angular-animate.js',
                    'node_modules/angular-messages/angular-messages.js',
                    'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
                    'node_modules/angular-ui-router/release/angular-ui-router.js',
                    'node_modules/moment/moment.js',
                    'node_modules/autonumeric/autonumeric.js',
                    'node_modules/free-jqgrid/js/jquery.jqGrid.js',
                    'node_modules/angular-toastr/dist/angular-toastr.tpls.js',
                    'node_modules/block-ui/jquery.blockUI.js',
                    'node_modules/fastclick/lib/fastclick.js',
                    'node_modules/ng-file-upload/dist/ng-file-upload.js',
                    'libs/easyXDM.js'
                ]
            }
        },
        concat_sourcemap: {
            options: {
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
//                    '<%= npiux.paths.locales %>**/*.*',
                    '<%= npiux.paths.templates %>**/*.html'
                ],
                tasks: ['watch-scripts']
            },
//            skylint: {
//                files: ['js/linter/skylint.js'],
//                tasks: ['uglify:skylint']
//            },
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
//            },
//            skylint: {
//                src: ['js/linter/skylint.js'],
//                dest: '<%= npiux.paths.dist %>js/skylint.min.js'
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
            'connect:docs': true,
            'karma:watch:start': false,
            'watchRenamed': true
        });
    });

    // The watch-scripts task supports the "--rapid" flag.
    grunt.registerTask('watch-scripts', function () {
        utils.run({
            'scripts': true,
            'karma:watch:run': false,
            'copy:docs': false,
            'docs': true
        });
    });

    // Main build task
    grunt.registerTask('build', ['scripts'/*, 'sri'*/]);
};
