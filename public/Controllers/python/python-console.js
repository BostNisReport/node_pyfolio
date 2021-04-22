(function (root) {

    angular.module('PythonConsoleModule', []).controller('PythonConsoleController', ['$scope', remoteChart_Controller]);

    function remoteChart_Controller($scope) {
        $scope.utilities = utilities;
        var chartTabsManager = $scope.chartTabsManager = new StrategyChartTabsManager(new StrategyObject('default'));
        chartTabsManager.hideTabsHeader = true;
        //A virtual source for JqxGrid
        var gridSource = new StrategyRowsGridSource(new StrategyObject('default'), 'gridDiv');


        //For the html controls
        $scope.ui = {
            selectedControl: 'Chart'
        };

        angular.ready(function () {
            $scope.setLoading();
            gridSource.addColumn(new IndexGridColumn('#'));
            gridSource.createGrid();
            //Add the primary chart tab
            chartTabsManager.addNewChartTab().
                getHighstock(function (highstock) {
               highstock.chartMessage = 'Your chart will appear here';
            });
            brython(0);
            setTimeout(function () { $scope.setReady(); }, 500);
        });

        (function (orig) {
            $.ajax = function (args) {
                //Handle this query locally
                if (args && args.url == '/api/user/remoteChart/sendMessageToRemoteChart') {
                    chartTabsManager.loadSeriesFromRemoteArgs(undefined, args.data);
                    $scope.ui.selectedControl = 'Chart';
                    return { responseText: '{}' };
                }
                else if (args && args.url == '/api/user/dataViewer/sendMessageToDataViewer') {
                    gridSource.grid('showloadelement');
                    gridSource.createGridFromRemoteArgs(args.data);
                    $scope.ui.selectedControl = 'Grid';
                    return { responseText: '{}' };
                }
                else if (args && args.url == 'clearChart') {
                    chartTabsManager.getSelectedTab().highstock.clearChart();
                    return { responseText: '{}' };
                }
                else if (args && args.url == 'clearGrid') {
                    gridSource.clear();
                    gridSource.createGrid();
                    return { responseText: '{}' };
                }
                $scope.$applyAsync();
                return orig.apply(null, arguments);
            }
        })($.ajax);


    }


})(this)