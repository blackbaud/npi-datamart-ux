/*jshint node: true */

/**
 * Karma configuration options shared between CI and local versions.
 * Files array is set in grunt/test so we can use grunt.config.
 */
module.exports = {
    singleRun: false,
    autoWatch: false,
    basePath: '../../',
    frameworks: [
        'jasmine'
    ],
    // Look into moving this grunt so skyux.paths.libsJs can be used
    files: [
        'node_modules/blackbaud-skyux/dist/js/sky-bundle.js',
        'node_modules/angular-mocks/angular-mocks.js',
        'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
        'js/src/module.js',
        'js/src/*/*.js',
        'js/templates/templates.js.tmp',
        'js/test/config.js',
        'js/**/*.spec.js'
    ],
    exclude: [
        'src/**/docs/*'
    ],
    preprocessors: {
        'js/src/*/*.js': [
            'coverage'
        ]
    },
    reporters: [
        'dots',
        'coverage'
    ],
    coverageReporter: {
        dir: 'coverage/',
        reporters: [
            {
                type: 'html'
            }
        ]
    }
};
