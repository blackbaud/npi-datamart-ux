/*global module*/
module.exports = function (grunt, env, utils) {
    'use strict';

    grunt.config.merge({
        npiux: {
            paths: {
                jsHint: [
                    'gruntfile.js',
                    'config/grunt/*.js',
                    'js/**/*.js'
                ]
            }
        },
        connect: {
            webdrivertest: {
                options: {
                    port: 8000
                }
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            all: '<%= npiux.paths.jsHint %>'
        },
        jscs: {
            options: {
                config: '.jscsrc'
            },
            all: '<%= npiux.paths.jsHint %>'
        },
        karma: {
            options: {
                configFile: './config/karma/karma.conf-local.js'
            },
            ci: {
                configFile: './config/karma/karma.conf-ci.js'
            },
            unit: {
                singleRun: true
            },
            watch: {
                background: true
            }
        },
        // Renamed the original grunt-contrib-watch task
        watchRenamed: {
            test: {
                files: ['<%= npiux.paths.src %>**/test/*.js'],
                tasks: ['karma:watch:run']
            }
        }
    });

    function buildTestFixtures(root) {
        var pathDist = grunt.config.get('npiux.paths.dist'),
            template = grunt.file.read((root + '/fixtures/template.html')),
            pattern = root + '/test/**/fixtures/*.html',
            options = {
                filter: 'isFile',
                cwd: '.'
            };

        grunt.file.expand(options, pattern).forEach(function (file) {
            var destFile,
                html;

            // Avoid processing already-built files in case the cleanup step failed to run.
            if (file.indexOf('.full.html') < 0) {
                html = grunt.file.read(file);
                html = template.replace(/##TEST_HTML##/gi, html);
                html = html.replace(/##DIST_PATH##/gi, pathDist);
                destFile = file.replace('.html', '.full.html');
                grunt.file.write(destFile, html);

                utils.log('File "' + destFile + '" created.');
            }
        });
    }

    function cleanupTestFixtures(root) {
        var pattern = root + '/test/**/fixtures/*.full.html';

        grunt.file.expand(
            {
                filter: 'isFile',
                cwd: '.'
            },
            pattern
        ).forEach(function (file) {
            grunt.file.delete(file);
        });

        utils.log('Visual test fixture temp files deleted.');
    }

    grunt.registerTask('lint', ['jshint', 'jscs']);

    grunt.registerTask('unittest', function () {
        var tasks = [];

        switch (env.get()) {
        case env.SUPPORTED.LOCAL:
            tasks.push('karma:unit');
            break;
        case env.SUPPORTED.LOCAL_BS:
        case env.SUPPORTED.CI_PUSH:
        case env.SUPPORTED.CI_PR_BRANCH:
            tasks.push('karma:ci');
            break;
        default:
            utils.log('grunt unittest is not configured to run in this environment.');
            return;
        }

        grunt.task.run(tasks);
    });

    // This is the main entry point for testing npiux.
    grunt.registerTask('test', function () {
        var tasks = [
            'lint',
            'build',
            'unittest'
        ];

        switch (env.get()) {
        case env.SUPPORTED.CI_PR_BRANCH:
            break;
        case env.SUPPORTED.LOCAL:
        case env.SUPPORTED.LOCAL_BS:
        case env.SUPPORTED.CI_PUSH:
            tasks.push('docs');
            break;
        case env.SUPPORTED.CI_PR_FORK:
            utils.log('Pull requests from forks are ran via blackbaud-npi-datamart-savage.');
            return;
        default:
            utils.log('grunt test is not configured to run in this environment.');
            return;
        }

        grunt.task.run(tasks);
    });
};
