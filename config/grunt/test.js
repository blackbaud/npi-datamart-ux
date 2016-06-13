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
