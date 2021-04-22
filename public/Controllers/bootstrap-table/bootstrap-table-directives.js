// JavaScript source code
(function (root) {
    angular.module('bootstrap-table-directives', []).
    directive('bsTableSelectColumnsDropdown', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                table: '='
            },
            templateUrl: '/static_files/Templates/bootstrap-table/select-columns-dropdown-template.html?lastModified=20170512T0811',
            link: function (scope) {
            }
        }
    })
})(this);
