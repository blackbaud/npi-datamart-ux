/*jshint node: true */

/**
 * Karma configuration used locally (or by default).
 **/
module.exports = function (config) {
    'use strict';

    // Load our shared config files
    var shared = require('./karma.conf-shared.js');

    config.set(shared);
    config.set({
        port: 9876,
        browsers: [
            'Chrome'
        ]
    });
};
