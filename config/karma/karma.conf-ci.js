/*jshint node: true */

/**
 * Karma configuration options when testing a push or pull request from a branch.
 * This file expects certain TRAVIS secure environment variables to be set.
 **/
module.exports = function (config) {
    'use strict';

    var shared = require('./karma.conf-shared.js');

//    shared.files.push(
//        'dist/js/locales/sky-locale-en-US.js'
//    );

    // Add new reporters
    shared.reporters.push('coveralls');

    // Coveralls needs lcov
    shared.coverageReporter.reporters.push({
        type: 'lcov',
        dir: 'coverage/'
    });
    
    config.set(shared);
    config.set({
        singleRun: true,
        port: 9876,
        browsers: [
            'PhantomJS'
        ],
        browserDisconnectTimeout: 3e5,
        browserDisconnectTolerance: 3,
        browserNoActivityTimeout: 3e5,
        captureTimeout: 3e5,
        
        phantomjsLauncher: {
            exitOnResourceError: true
        }
    });
};
