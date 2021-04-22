(function (root) {

    angular.module('BacktestModule', []).controller('BacktestController', ['$scope', backtest_controller]);

    function backtest_controller($scope) {

        $scope.utilities = utilities;
        $scope.chart = {
            beforeCreateHighstock: function () {
                var chart = this;
                chart.showChartToolbar = false;
                chart.highstock.options.rangeSelector.enabled = false;
                chart.highstock.options.scrollbar.enabled = false;
            },
            afterCreateHighstock: function () {
                var chart = this;

            }
        };
        var btStrategy = {
            name: 'default'
        }



        /**
         * Create a backtest stats table using the element id
         * 
         * @param {string} elemenetId: The dom element id to draw the chart in
         * @param {string} containerElementId: The dom element id that will contains the table
         * */
        function createStatsTable(elementId, containerElementId) {
            var table = new BacktestStatsTable($scope);
            table.addDefaultsColumn();
            table.drawTable(elementId, containerElementId);
            return table;
        }
        /**
         * Refrsh the stats table data
         * 
         * */
        function refreshStatsTable(rowId) {
            var row = btStrategy.algoTable.getRowById(rowId);
            var stats = row.stats;
            var data = [{
                stats: 'Performance',
                threeMonths: utilities.percentFormatter(stats.profitLoss_threeMonths),
                sixMonths: utilities.percentFormatter(stats.profitLoss_sixMonths),
                oneYear: utilities.percentFormatter(stats.profitLoss_oneYear)
            }, {
                stats: 'Sharpe',
                threeMonths: utilities.numberFormatter(stats.sharpe_threeMonths),
                sixMonths: utilities.numberFormatter(stats.sharpe_sixMonths),
                oneYear: utilities.numberFormatter(stats.sharpe_oneYear)
            }, {
                stats: 'Trades/Day',
                threeMonths: utilities.numberFormatter(stats.tradesDay_threeMonths),
                sixMonths: utilities.numberFormatter(stats.tradesDay_sixMonths),
                oneYear: utilities.numberFormatter(stats.tradesDay_oneYear)
            }, {
                stats: 'Win/Loss',
                threeMonths: stats.winLoss_threeMonths,
                sixMonths: stats.winLoss_sixMonths,
                oneYear: stats.winLoss_oneYear
            }];
            btStrategy.statsTable.fn('load', data);
        }

        /**
         * Create a backtest algorithms table using the element id
         * 
         * @param {string} elemenetId: The dom element id to draw the chart in
         * @param {string} containerElementId: The dom element id that will contains the table
         * */
        function createAlgorithmsTable(elementId, containerElementId) {
            var table = new BacktestAlgorithmsTable($scope);
            table.options.responseHandler = function (res) {
                if (!res.result) return [];
                var rows = res.result.rows;
                //fills the table stats
                rows.forEach(function (row) {
                    var stats = row.stats;
                    row.profitLoss_threeMonths = stats.profitLoss_threeMonths;
                    row.profitLoss_sixMonths = stats.profitLoss_sixMonths;
                    row.profitLoss_oneYear = stats.profitLoss_oneYear;
                });
                return rows;
            }
            table.addDefaultsColumn();
            table.drawTable(elementId, containerElementId, '/api/kafka/GetStrategy?view=backtest&strategyName=' + btStrategy.name);
            table.element.on('check.bs.table', function (eventArgs, row) {
                // drawBacktestSeries(row.rowId);
                table.checkedRow = row.rowId;
                drawBacktestSeries(row.rowId);
                refreshStatsTable(row.rowId);
            });
            //fires after load the data
            table.element.on('load-success.bs.table', function (eventArgs, data) {
                if (data && data.length)
                    table.checkedRow = table.checkedRow || data[0].rowId;
                data.forEach(function (row, index) {
                    if (row.rowId == table.checkedRow)
                        table.fn('check', index);
                });

            });
            table.on('openBacktest', function (row, index) {
            });
            table.on('exportRow', function (row, index) {
                table.fn('updateRow', { index: index, row: { loadingExport: true } });
                btStrategy.api.exportSeriesFromURLWithBacktest(row, function (err, results) {
                    if (err) return alert(err);
                    table.fn('updateRow', { index: index, row: { loadingExport: false } });
                });
            });
            return table;
        }



        /**
         * Generate the backtest's result and draw it in the chart
         * 
         * */
        function drawBacktestSeries(rowId) {
            var highstock = $scope.chart.highstock;
            var yAxis = highstock.options.yAxis;
            var row = btStrategy.algoTable.getRowById(rowId);
            var colors = Highcharts.getOptions().colors;
            var panelTitle = 'Algo ' + row.rowIndex;

            if (yAxis && yAxis.length)
                highstock.removeYAxis(yAxis[0].id, true);
            row.seriesId = highstock.addSeries({
                type: 'column',
                name: panelTitle,
                yAxis: highstock.getOrAddYAxis(panelTitle).id,
                data: row.stats.chartData,
                color: colors[(Number(row.rowIndex) - 1) % colors.length]
            });
            //highstock.chart.rangeSelector.clickButton(3);
        }

        /**
         * Open the backtest's strategy for the curent user
         * 
         * @param {object} strategy: The strategy object
         * */
        $scope.openBacktestStrategy = function () {

            if (btStrategy.isLoaded) return;
            $scope.setLoading();
            btStrategy.api = StrategyObjectAPI(btStrategy.name);
            btStrategy.statsTable = createStatsTable('#table_stats', '#table_stats_container');
            btStrategy.algoTable = createAlgorithmsTable('#table_algorithms', '#table_algorithms_container');
            btStrategy.isLoaded = true;
            $scope.setReady();
        };

        angular.ready(function () {
            $scope.openBacktestStrategy();
            createSocketClient('BacktestSocket', function () { btStrategy.algoTable.refreshTable(); });
        });
    }

})(this)