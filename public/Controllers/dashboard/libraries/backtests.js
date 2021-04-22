
(function (root) {

    var BacktestsTable = function (scope) {
        var table = this;
        this.init({
            responseHandler: function (res) {
                if (res.error) {
                    table.element.trigger('load-error.bs.table', res.error)
                    return [];
                }
                res.result.forEach(function (row) {
                    var timestamp = moment.utc(row.timestamp, 'YYYYMMDDHHmm').local();
                    row.date = timestamp.format('YYYY/MM/DD');
                    row.time = timestamp.format('HH:mm');
                });
                res.result.forEach(function (row) {
                    var n = row.summary && row.summary['p&l_total'];
                    if (!n) return;
                    row.summary['p&l_total'] = Number(n.replace('$', ''));
                });
                return res.result;
            },
            uniqueId: 'output_key',
            showFooter: false,
            pagination: false,
            search: false,
            showRefresh: false,
            showColumns: false,
            hideCheckBoxColumn: true,
            sortable: true
        });
        /**
           * Add the default columns
           * 
           * 
           * */
        this.addDefaultsColumn = function (addIdColumn) {
            var table = this;
            table.options.columns = [];
            table.addColumn({
                field: 'state',
                valign: 'middle',
                checkbox: true,
                sortable: false
            });
            if (addIdColumn) {
                table.addColumn({
                    field: 'output_key',
                    title: 'ID',
                    titleTooltip: 'The backtest ID',
                    class: 'no-left-border',
                    align: 'left',
                    formatter: function (value, row, index) {
                        return '<a class="open-backtest" href="#backtest=' + value + '" title="View backtest\'s results" >' + value + '</a>';
                    },
                    events: {
                        'click .open-backtest': function (e, value, row, index) {
                            table.emit('openBacktestReport', row, index);
                        }
                    }
                });

                table.addColumn({
                    field: 'date',
                    title: 'Date',
                    //width:100,
                });
                table.addColumn({
                    field: 'time',
                    title: 'Time',
                    //width:70,
                });
            }
            table.addColumn({
                field: 'chart',
                title: 'Chart',
                titleTooltip: 'Chart the backtest data',
                clickToSelect: false,
                width: 50,
                searchable: false,
                sortable: false,
                formatter: function (value, row, index) {
                    return '<a class="chartBacktest" href="javascript:void(0)" style="margin-right:3px" title="Chart backtest" ><img src="/static_files/images/chartline16.png?lastModified=20160909T1938"/></a>';
                },
                events: {
                    'click .chartBacktest': function (e, value, row, index) {
                        table.emit('chartBacktest', row, index);
                    }

                }
            });
            table.addColumn({
                field: 'summary.p&l_total',
                title: 'P&L',
                class: 'no-left-border',
                align: 'center',
                //width:70,
                formatter: dollarFormats,
                cellStyle: greenRedValueStyle
            });
            table.addColumn({
                field: 'summary.p&l_total_percent',
                title: 'P&L%',
                align: 'center',
                //width:70,
                formatter: percentageFormats,
                cellStyle: greenRedValueStyle
            });
            table.addColumn({
                field: 'summary.sharpe',
                title: 'Sharpe',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
            table.addColumn({
                field: 'summary.sortino',
                title: 'Sortino',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
            table.addColumn({
                field: 'summary.max_drawdown',
                title: 'Max Drawdown',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
            table.addColumn({
                field: 'summary.trades_per_day',
                title: 'Trades/day',
                align: 'center',
                //width:70
            });
        }

    };

    BacktestsTable.prototype = new BootstrapTableWrapper();

    var BacktestSummaryTable = function (scope) {
        var table = this;
        this.init({
            showFooter: false,
            pagination: false,
            search: false,
            showRefresh: false,
            showColumns: false,
            hideCheckBoxColumn: true,
            sortable: false
        });
        /**
           * Add the default columns
           * 
           * 
           * */
        this.addDefaultsColumn = function () {
            var table = this;
            table.options.columns = [];
            table.addColumn({
                field: 'state',
                valign: 'middle',
                checkbox: true,
                sortable: false
            });

            table.addColumn({
                field: 'index',
                title: ' ',
                class: 'no-left-border summary-table-title',
                align: 'left',
                width: 210,
                formatter: function (value, row, index) {
                    var color = index == 1 ? 'rgb(186,124,39)' : 'rgb(80,122,213)';
                    var html = '<span class="color-key" style="background-color:' + color + '"></span> ';
                    html += index == 0 ? 'Backtest ' + row.output_key : 'SPDR S&P 500 ETF Trust';
                    return html;
                },
                //cellStyle: greenRedValueStyle
            });

            table.addColumn({
                field: 'summary.p&l_total',
                title: 'P&L',
                class: 'no-left-border',
                align: 'center',
                //width:70,
                formatter: dollarFormats,
                cellStyle: greenRedValueStyle
            });


            table.addColumn({
                field: 'summary.p&l_total_percent',
                title: 'P&L%',
                align: 'center',
                //width:70,
                formatter: percentageFormats,
                cellStyle: greenRedValueStyle
            });
            table.addColumn({
                field: 'summary.sharpe',
                title: 'Sharpe',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
            table.addColumn({
                field: 'summary.sortino',
                title: 'Sortino',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
            table.addColumn({
                field: 'summary.max_drawdown',
                title: 'Max Drawdown',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
            table.addColumn({
                field: 'summary.annual_volatility',
                title: 'Volatility',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
            table.addColumn({
                field: 'summary.calmar',
                title: 'Calmar',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
            table.addColumn({
                field: 'summary.omega',
                title: 'Omega',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
            table.addColumn({
                field: 'summary.annualized_alpha',
                title: 'Alpha',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
            table.addColumn({
                field: 'summary.annualized_beta',
                title: 'Beta',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
            table.addColumn({
                field: 'summary.trades_per_day',
                title: 'Trades/day',
                align: 'center',
                //width:70
            });
        }

    };

    BacktestSummaryTable.prototype = new BootstrapTableWrapper();

    var BacktestOutputTable = function (scope) {
        var table = this;
        this.init({
            responseHandler: function (res) {
                if (res.error) {
                    table.element.trigger('load-error.bs.table', res.error)
                    return [];
                }
                var result = res.result;

                var rows = table.allRows = processBacktestRows(result.rows || result);
                table.summary = result.summary;
                if (!utilities.urlParameters.hasOwnProperty('showEmpty'))
                    rows = rows.filter(function (row) { return row.myQuantity });
                // window.backtestRows = rows;
                return rows;
            },
            uniqueId: 'timestamp',
            showFooter: false,
            pagination: true,
            pageSize: 100,
            search: false,
            showRefresh: false,
            showColumns: false,
            hideCheckBoxColumn: true,
            sortable: true
        });
        /**
           * Add the default columns
           * 
           * 
           * */
        this.addDefaultsColumn = function () {
            var table = this;
            table.options.columns = [];
            table.addColumn({
                field: 'state',
                valign: 'middle',
                checkbox: true,
                sortable: false
            });
            table.addColumn({
                field: 'date',
                title: 'Date',
                class: 'no-left-border',
                //width:100,
            });
            table.addColumn({
                field: 'time',
                title: 'Time',
                //width:70,
            });

            table.addColumn({
                field: 'instruction',
                title: 'Instruction',
                align: 'center',
                //width:70
            });
            table.addColumn({
                field: 'p&l',
                title: 'P&L',
                align: 'center',
                //width:70,
                formatter: dollarFormats,
                cellStyle: greenRedValueStyle
            });
            table.addColumn({
                field: 'p&l_percent',
                title: 'P&L%',
                align: 'center',
                //width:70,
                formatter: percentageFormats,
                cellStyle: greenRedValueStyle
            });

            table.addColumn({
                field: 'myQuantity',
                title: 'Quantity',
                align: 'center',
                //width:70
            });

            table.addColumn({
                field: 'myCommission',
                title: 'Commission',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });

            table.addColumn({
                field: 'trade_price',
                title: 'Trade Price',
                align: 'center',
                //width:70,
                formatter: numberFormats
            });
        }

    };

    BacktestOutputTable.prototype = new BootstrapTableWrapper();

    //Format the cells with dollar values
    function dollarFormats(value, row, index) {
        var num = Number(value);
        if (!num) return value;
        return '$' + parseFloat(Math.round(num * 100) / 100).toFixed(2);
    }
    //Format the cells with % format
    function percentageFormats(value, row, index) {
        var num = Number(value);
        if (!num) return value;
        return parseFloat(Math.round(num * 10000) / 100).toFixed(3) + ' %';
    }
    //Format the cells with 3 digits value
    function numberFormats(value, row, index) {
        if (!value) return value;
        var num = Number(value);
        if (!num) return value;
        return parseFloat(Math.round(num * 10000) / 10000);
    }

    //Like a ternary chart, use green color for values>0 and red for values <0
    function greenRedValueStyle(value, row, index, field) {
        value = Number(value);
        if (!value) return {};
        return {
            classes: '',
            css: { "color": value > 0 ? "green" : "red" }
        };
    }
    //Make sure the rows are formatted as expected to UI
    function processBacktestRows(rows) {
        rows = Object.keys(rows).map(function (key) { return rows[key]; });

        rows.forEach(function (row) {
            row['p&l'] = row['p&l'] && Number(row['p&l'].replace('$', ''));
            row.myCommission = row.exit_fill_commission ||row.exit_commission || row.fill_commission;
            row.myQuantity = row.exit_fill_quantity || row.exit_quantity || row.fill_quantity || row.quantity;
        });
        return rows;
    }
    angular.module('dashboard-libraries-backtests-module', []).
        controller('DashboardLibrariesBacktestsController', ['$scope', '$http', '$element', '$compile', backtests_Controller]);

    function backtests_Controller($scope, $http, $element, $compile) {
        var backtestSummaryChart, backtestsChart;
        //Pointer to the UI tables
        var backtestsTable, summaryTable, outputsTable;
        $scope.view = 'startPage';

        //make sure the element is loaded before firing the ready callback
        var requireReady = function () { return $('#backtest-summary-chart').data('chart'); };
        angular.ready(function () {
            backtestSummaryChart = $('#backtest-summary-chart').data('chart');
            backtestsChart = $('#backtestsChart').data('chart');

            initBacktestsChart();
            createBacktestsTable();
            createSummaryTable();
            createBacktestOutputTable();
            //window.outputsTable = outputsTable;
        }, requireReady);




        //Opens a .csv file and draw it as a new trendline
        $scope.importCsvFile = function () {
            //Use new apiRequester for uploading progress monitor
            var apiRequester = new ApiRequester();
            var defaultStrategy = new StrategyObject('default');
            defaultStrategy.api.setRequester(apiRequester);

            backtestSummaryChart.getSelectedTab().highstock.chartMessage = '';
            var dialog = backtestSummaryChart.getSelectedTab().highstock.showImportSeriesDialog();
            dialog.events.on('dismiss', function () {
                apiRequester.abort();
            });
            dialog.events.on('filesValidated', function () {
                dialog.setStatus('Processing...');
            });
            //
            dialog.events.on('filesLoaded', function (seriesArray, overwrite) {
                apiRequester.abort();
                dialog.setError('');
                dialog.seriesArray = seriesArray;
                //Append all seirs to one array of name and value
                var list = [];
                seriesArray.forEach(function (s) {
                    var temp = Object.keys(s).map(function (k) {
                        return {
                            name: k,
                            value: s[k]
                        }
                    });
                    list = list.concat(temp);
                });

                //Upload the series one after one
                async.eachSeries(list, function (series, oneDone) {
                    defaultStrategy.api.uploadSeriesToSW(series.name, series.value, overwrite, oneDone);
                }, function (err) {
                    dialog.showLoadingImage = false;
                    dialog.disableCancelButton = false;
                    dialog.setStatus('');
                    if (err && err.indexOf('Time series exists') >= 0)
                        err = undefined;
                    dialog.setError(err);
                    if (!err) dialog.drawSelectedFiles();
                });

                apiRequester.on('UploadProgress', function (progress) {
                    var ratio = Math.round(100 * (progress.loaded / progress.total));
                    dialog.setStatus('Uploading... (' + ratio + ' %)');
                    if (ratio == 100) {
                        dialog.disableCancelButton = true;
                        dialog.showLoadingImage = true;
                        dialog.setStatus('Upload complete. Processing data...');
                    }
                });

            });
        }

        function initBacktestsChart() {
            var chartTab = backtestsChart.addNewChartTab();
            chartTab.on('beforeCreateHighstock', function (seriesOptions) {
                var chart = this,
                    legend = chart.highstock.options.legend;
                legend.enabled = true;
                legend.y = 0;
                legend.shadow = false;
            });
            chartTab.getHighstock(function (highstock) {

                highstock.on('beforeAddSeries', function (seriesOptions) {
                    seriesOptions.panelTitle = 'Return %';
                });
            });
        }
        //Loads the backtest report to the iframe
        function openBacktestReport(backtestRow, callback) {
            $scope.showLoading = true;
            angular.requests.get('/api/user/backtests/getBacktestReport', { output_key: backtestRow.output_key }, function (err, data) {
                if (err)
                    err = '<html><body>' + err + '</body></html>';
                var html = err || data.result.html;
                writeHtmlToReportIFrame(html);
                setTimeout(function () {
                    $('#backtest-summary-report').contents().find(".input").remove();
                    $scope.showLoading = false;
                    $scope.$applyAsync();
                }, 1000);
               
            });
        }


        //Loads the backtest data and chart it
        function openBacktestChartAndDetails(backtestRow, callback) {

            var chartTab = backtestSummaryChart.charts[0];
            if (chartTab)
                backtestSummaryChart.removeChartTab(chartTab);
            chartTab = backtestSummaryChart.addNewChartTab();
            chartTab.getHighstock(function (highstock) {


                highstock.on('beforeAddSeries', function (seriesOptions) {
                    seriesOptions.panelTitle = 'Return %';
                    seriesOptions.color = seriesOptions.name == 'Backtest' ? 'blue' : '#BA7C27';
                });
                highstock.on('afterAddSeries', function (seriesOptions) {
                    var yAxisId = seriesOptions.yAxis;
                    highstock.chart.getAxis(yAxisId).update({ title: { align: 'middle' } });
                });


                highstock.chartMessage = 'Loading...';
                chartTab.select();
                loadBacktestData(backtestRow, function (err, rows) {

                    if (err) {
                        highstock.chartMessage = err;
                        return callback && callback(err);
                    }
                    drawBacktestSummary(chartTab, rows, function (err) {
                        highstock.chartMessage = err;
                    });

                });

            });
        }
        //Loads the backtest datain table
        function loadBacktestData(backtestRow, callback) {
            outputsTable.bsTable.load([]);
            summaryTable.bsTable.load([]);
            summaryTable.bsTable.showLoading()
            outputsTable.refreshTable('/api/user/backtests/getBacktestOutput?output_key=' + backtestRow.output_key, function (err, data) {
                summaryTable.bsTable.hideLoading()
                if (err) return callback(err);
                backtestRow.summary = outputsTable.summary;
                summaryTable.bsTable.load([backtestRow, {}]);
                $scope.$applyAsync();
                callback(err, outputsTable.allRows);
            });
        }
        //Draw the SPY and backtest result
        function drawBacktestSummary(chartTab, backtestRows, callback) {
            var highstock = chartTab.highstock;
            var chartData = convertBacktestDataToChartData(backtestRows);

            // console.log(JSON.stringify(backtestData));
            highstock.addSeries({ name: 'Backtest', data: chartData.data });

            backtestSummaryChart.loadSeriesFromStrategyRows(highstock, [{
                query: 'SPY(c)',
                startTime: utilities.parseDateTime(chartData.firstRow.timestamp),
                endTime: utilities.parseDateTime(chartData.lastRow.timestamp)
            }], function (err) {
                if (err) return callback(err);

                callback();
            });

        }

        //Convert the backtestData to chart data 
        function convertBacktestDataToChartData(backtestRows) {
            // console.log(backtestRows);
            var firstRow = backtestRows[0];


            var startPrice = 0;
            for (var i = 0; !startPrice && i < backtestRows.length; i++)
                startPrice = utilities.parseNumber(backtestRows[i]['close_price']);

            var lastRow = backtestRows[backtestRows.length - 1];
            var backtestData = backtestRows.map(function (r, index) {
                var percent = utilities.parseNumber(r['p&l_percent']) || 0;
                startPrice = startPrice * (percent + 1);
                return {
                    x: utilities.parseDateTime(r.timestamp),
                    y: startPrice
                }
            });
            return {
                firstRow: firstRow,
                lastRow: lastRow,
                data: backtestData
            };

        }

        function createBacktestsTable() {
            backtestsTable = new BacktestsTable($scope);
            backtestsTable.addDefaultsColumn(true);
            var backtestsTableElement = $element.find('#backtestsTable');
            backtestsTable.drawTable(backtestsTableElement, backtestsTableElement.parent());
            backtestsTableElement.data('table', backtestsTable);

            backtestsTable.on('openBacktestReport', function (row) {
                //$('.dashboard-chart-header-title').html('Backtest ' + row.output_key + ' Results');
                $scope.openedBacktest = row;
                openBacktestReport(row, function (err) {
                    err && angular.showErrorMessage(err);
                });
                $scope.view = 'backtestReportPage';
                $scope.$applyAsync();
            });

            backtestsTable.on('chartBacktest', function (row) {
                return
                var chartTab = backtestsChart.charts[0];
                var seriesName = 'Backtest ' + row.output_key;
                chartTab.getHighstock(function (highstock) {
                    if (highstock.getSeriesByName(seriesName)) return;
                    highstock.chartMessage = 'loading...';
                    angular.requests.get('/api/user/backtests/getBacktestOutput', { output_key: row.output_key }, function (err, data) {
                        if (err) return angular.showErrorMessage(err);
                        var rows = processBacktestRows(data.result.rows || data.result);
                        var chartData = convertBacktestDataToChartData(rows);
                        if (!highstock.getSeriesByName(seriesName))
                            highstock.addSeries({ name: seriesName, data: chartData.data });
                        highstock.chartMessage = '';
                    });
                });
            });

            backtestsTable.refreshTable('/api/user/backtests/getBacktests', function (err, rows) {
                if (err) return angular.showErrorMessage(err);
                if (rows[0]) backtestsTable.emit('chartBacktest', rows[0]);
                var backtest = utilities.urlParameters.backtest;
                if (!backtest) return;
                var bacttestRow = rows.filter(function (row) { return row.output_key == backtest; })[0];
                if (!bacttestRow) return angular.showErrorMessage('Backtest \'' + backtest + '\' does not exist.');
                backtestsTable.emit('openBacktestReport', bacttestRow);
            });

            $scope.$applyAsync();
        }

        function createSummaryTable() {
            summaryTable = new BacktestSummaryTable($scope);
            summaryTable.addDefaultsColumn();
            var summaryTableElement = $element.find('#summaryTable');
            summaryTable.drawTable(summaryTableElement, summaryTableElement.parent());
            summaryTableElement.data('table', summaryTable);
        }

        function createBacktestOutputTable() {
            outputsTable = new BacktestOutputTable($scope);
            outputsTable.addDefaultsColumn();
            var outputsTableElement = $element.find('#outputsTable');
            outputsTable.drawTable(outputsTableElement, outputsTableElement.parent());
            outputsTableElement.data('table', outputsTable);
        }
        function writeHtmlToReportIFrame(html) {
            var myFrame = $('#backtest-summary-report');
            var doc = myFrame[0].contentDocument;
            doc.open();
            doc.writeln(html);
            doc.close();
        }
        $(window).on('hashchange', function () {
            $scope.view = utilities.urlParameters_Fun().backtest ? 'backtestReportPage' : 'startPage';
            $scope.$applyAsync();
        });
    }


})(this)