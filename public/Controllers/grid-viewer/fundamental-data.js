(function (root) {

    angular.module('FundamentalDataModule', []).controller('FundamentalDataController', ['$scope', fundamentalData_Controller]);

    function fundamentalData_Controller($scope) {
        $scope.utilities = utilities;
        var schemaURL = '/static_files/grid-schema/fundamentalData_schema.txt?lastModified=20160909T1938';

        angular.ready(function () {
            createGrid();
            $scope.fundamentalDataDialog();
        });


        function createGrid(rows) {
            $scope.setLoading();

            var gridBuilder = new GridFromSchema("gridDiv");
            try { gridBuilder.grid('destroy'); }
            catch (err) { }
            $('#gridContainerDiv').html('<div id="gridDiv">');
            gridBuilder.loadDataFromArray(rows);
            gridBuilder.loadSchemaFromURL(schemaURL, function (err) {
                if (err) return $scope.setError(err);
                gridBuilder.createGrid();
                $scope.setReady();
            });
        }

        $scope.openTab = function (url) {
            window.open(url, '_blank');
        }


        var fundamentalDataDialogSettings = {
            title: "Fundamental data query",
            labelTitle: "Query",
            bodyUrl: '/static_files/Templates/queries/fundamental-data-query-template.html?lastModified=20160909T1938',
            // size: 'lg',
            companyTicker: 'AA',
            fiscalYear: '2015',
            fiscalType: 'Annual',
            statementType: 'INC',
            ok: function (settings, close) {
                settings.isBusy = true;
                angular.requests.get('/api/user/fundamental/data', settings, function (err, result) {
                    settings.isBusy = false;
                    if (err) return angular.showErrorMessage(err);
                    close();
                    createGrid(result.result.rows);
                });
            }
        };
        /**
         * Execute a select query and show the result in the grid
         * 
         * */
        $scope.fundamentalDataDialog = function () {
            angular.showMessage(fundamentalDataDialogSettings);
        }



    }


})(this)