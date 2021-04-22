(function (root) {

    //This module support dbclick events for mobile and PC
    angular.module('my-dbclick-module', []).
    directive('myDbclick', function () {

        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var delay = 300, clicks = 0, timer = null;
                element.on('click', function (event) {
                    clicks++;  //count clicks
                    if (clicks >= 2) {
                        scope.$apply(attr['myDbclick']);
                    } else {
                        setTimeout(function () {
                            clicks = 0;             //after action performed, reset counter
                        }, delay);
                    }
                });
            }
        };
    })


})(this)