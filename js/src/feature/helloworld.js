/*jslint browser: false */
/*global angular */

(function () {
    'use strict';
    angular.module('hi', [])
        .controller('hwController', function ($scope) {
            $scope.text = function () {
                return 'Hello World!';
            };
        });
}());
