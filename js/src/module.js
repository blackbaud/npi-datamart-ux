/*jslint browser: false */
/*global angular*/

(function () {
    'use strict';
    
    var modules = [
        //'sky',
        'npi-datamart.authentication',
        'npi-datamart.api',
        'npi-datamart.report',
        'npi-datamart.templates'
    ];

    angular.module('npi-datamart', modules);
}());