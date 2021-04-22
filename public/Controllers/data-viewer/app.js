(function (root) {

    angular.module('DataViewerModule', []).controller('DataViewerController', ['$scope', dataViewer_Controller]);

    function dataViewer_Controller($scope) {
        $scope.utilities = utilities;
        var strategy = new StrategyObject('default');
        //A virtual source for JqxGrid
        var gridSource = new StrategyRowsGridSource(strategy, 'gridDiv');



        /**
       * Export the grid
       * 
       * @param {string} exportType: Can be xls,pdf,html,xml,tsv or json
       * */
        $scope.exportGrid = function (exportType) {
            var rows = gridSource.getGridRows(0, 100);
            gridSource.grid('exportdata', exportType, 'jqxGrid', true, rows.slice(0, 100), true);
        }

        /**
         * Loads the rows into the grid
         * 
         * */
        $scope.loadStrategyRows = function (rows) {

            angular.requests.post('/api/user/dataViewer/sendMessageToDataViewer', {
                rows: rows,
                strategyName: 'default'
            }, function (err, data) { });

        }

        angular.ready(function () {
            $scope.setReady();
            //check if the user is not the same as the passed username
            angular.checkIfSameLogin(utilities.urlParameters.username, function () {
                createSocketClient('dataViewer_socket', function (message) {
                    var args = JSON.parse(message);
                    $scope.setLoading();
                    gridSource.createGridFromRemoteArgs(args, function () { $scope.setReady(); });
                });
            });

        });


    }


})(this)