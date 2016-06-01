/*jslint browser: false */
/*global angular*/

(function () {
    'use strict';
    
    var modules = [
        //'sky',
        'npi-datamart.authentication',
        'npi-datamart.api'
    ];

    angular.module('npi-datamart', modules);
}());
angular.module('npi-datamart.templates', []).run(['$templateCache', function($templateCache) {

}]);

//# sourceMappingURL=npi-datamart.js.map