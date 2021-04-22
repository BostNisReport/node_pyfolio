
(function (root) {

    //This module manage the strategy chart operations
    angular.module('strategy-directives', []).

    directive('strategyNewRowForm', function () {
        return {
            restrict: 'A',
            templateUrl: '/static_files/Templates/app/add-strategy-row-form-template.html?lastModified=20160909T1938',
            link: function (scope, element, attr) {
                var strategy = scope.strategy;
                //Support auto-complete feature
                element.find('.add-query-box').jqxInput({ source: ['GOOG', 'IBM', 'SPY'], minLength: 2 });
            }
        }
    }).


    directive('appMainControl', function () {
        return {
            restrict: 'A',
            templateUrl: '/static_files/Templates/app/app-main-control-template.html?lastModified=20160909T1938',
            replace: true,
            link: function (scope, element, attr) {
                var strategy = scope.strategy;
            }
        }
    }).

    directive('chartWithTable', function () {
        return {
            restrict: 'A',
            templateUrl: '/static_files/Templates/app/chart-with-table-template.html?lastModified=20160909T1938',
            replace: true,
            link: function (scope, element, attr) {
                var strategy = scope.strategy;
            }
        }
    });

})(this)