(function (root) {


    angular.module('RemoteChartModule', []).controller('RemoteChartController', ['$scope', remoteChart_Controller]);

    function remoteChart_Controller($scope) {
        $scope.utilities = utilities;
        var strategyObject = new StrategyObject('default');
        var chartTabsManager = $scope.chartTabsManager = new StrategyChartTabsManager(strategyObject);
        chartTabsManager.showAddTabButton = function () {
            return false;
        }

        /**
         * Draw data in the chart
         * 
         * */
        function drawChartSeries(args) {
            chartTabsManager.addNewChartTab().getHighstock(function (highstock) {
                chartTabsManager.loadSeriesFromRemoteArgs(highstock, args);
            });
            $scope.$applyAsync();
        }


        angular.ready(function () {
            $scope.setReady();
            //check if the user is not the same as the passed username
            angular.checkIfSameLogin(utilities.urlParameters.username, function () {
                createSocketClient('remoteChart_socket', function (message) {
                    var args = JSON.parse(message);
                    drawChartSeries(args)

                });
            });
        });

    }



})(this)