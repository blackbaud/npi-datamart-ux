/*global jasmine, angular, describe, afterEach, beforeEach, it, module, inject, expect */
/*jslint nomen: true */

(function () {
    'use strict';
    describe('hwTest', function () {
        
        beforeEach(module('hi'));
        
        var $controller;
        
        beforeEach(inject(function (_$controller_) {
            $controller = _$controller_;
        }));
        
        
        describe('$scope.text', function () {
            it('Says "Hello World!"', inject(function ($rootScope) {
                var actual,
                    expected = 'Hello World!',
                    $scope = {},
                    controller = $controller('hwController', { $scope: $scope });
                actual = $scope.text();
                expect(actual).toEqual(expected);
            }));
        });
    });
}());