/*jshint node: true */

/**
 * Karma configuration used locally (or by default).
 **/
module.exports = function (config) {
    'use strict';

    // Load our shared config files
    var shared = require('./karma.conf-shared.js');

    // Make en-US the default locale
//    shared.files.push(
//        'bin/js/locales/sky-locale-en-US.js'
//    );

    config.set(shared);
    config.set({
        port: 9876,
        browsers: [
            'Chrome'
        ]
    });
};
