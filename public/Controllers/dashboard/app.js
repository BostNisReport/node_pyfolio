(function (root) {
    //Open a connection to indexedDB
    var chart_files_db = root.chart_files_db = new IndexDBConnector('chart_files_db', 'files');
    chart_files_db.openDB();

    angular.module('DashboardModule', []).controller('DashboardController', ['$scope', app_function]);

    function app_function($scope) {
        //Store here the shared data
        var rootScope = $scope.$root;

        $scope.collapseNavbar = function (elementId) {
            if (!$('#' + elementId).attr('aria-expanded'))
                return;
            $('#' + elementId).collapse('hide');
        }
        $scope.utilities = utilities;

        //make sure the element is loaded before firing the ready callback
        var requireReady = function () { return  chart_files_db.db; };
        angular.ready(function () {
            $scope.setLoading();
            $scope.setReady();            
        }, requireReady);

    }

})(this)
