(function (root) {

    angular.module('Dashboard_ChartAreaModule', []).
        directive('dashboardChartArea', function () {
            return {
                restrict: 'A',
                templateUrl: '/static_files/Templates/dashboard/chart-area-template.html?lastModified=20170511T2118',
                replace: false,
                link: function (scope, element, attr) {
                    link_function(scope, element);
                }
            }
        });

    //
    function link_function(scope, element) {

        var chartAreaControl = scope.chartAreaControl = scope.$root.chartAreaControl = new StrategyChartTabsManager(new StrategyObject('default'));
        //Store the chart control refernece in data
        element.data('chart', chartAreaControl);
        chartAreaControl.hideTabsHeader = true;

        chartAreaControl.on('newTab', function (chartTab) {
            chartTab.getHighstock(function (highstock) {
                highstock.chartMessage = 'Chart is empty';
                highstock.drawVLinesEvery({ type: 'days', value: 1 }, true);
            });
        });

        // $(document).click(function (e) {
        //    if (!$(e.toElement).hasClass('run-backtest-button')) return;
        //    alert('Run Backtest clicked!');
        //});

       

        //loads the spy and penguin files
        chartAreaControl.loadSpyAndMBIFiles = function (chartTab,callback) {
            var files = ['/static_files/files/spy.csv?lastModified=20160929T2235', '/static_files/files/penguin_2010.csv?lastModified=20161003T1403'];
            chartTab.getHighstock(function (highstock) {

                highstock.chartMessage = 'Loading SPY and MBI data...';
                async.map(files, downloadFile, function (err, data) {
                    if (err) return callback && callback(err);
                    try {
                        var spyPoints = chartSeriesUtilities.parseSereisFromCsv(data[0]);
                        var penguinPoints = chartSeriesUtilities.parseSereisFromCsv(data[1]);
                        highstock.addSeriesFromDictionary(spyPoints, 'line');
                        highstock.addSeriesFromDictionary(penguinPoints, 'line');
                        highstock.chartMessage = '';
                    } catch (err) { console.log(err); highstock.chartMessage = 'Loading data failed.'; }
                    if (callback) callback();
                });

            });
            
        }


        //Loads the SPY and the last row in the default strategy
        chartAreaControl.loadSpyAndLastRow = function (chartTab,rows) {
            
            chartTab.getHighstock(function (highstock) {
                highstock.chartMessage = 'Loading...';
                var chartRows = [{ query: 'SPY(c)' }];
                var last = rows[rows.length - 1];
                if (last && (last.query + '').toLowerCase() != 'spy(c)') chartRows.push(last);
                chartAreaControl.loadSeriesFromStrategyRows(highstock, chartRows, function (err) {
                    scope.$applyAsync();
                    highstock.chartMessage = err;
                });
            });

        }

           //chartAreaControl.loadChartSession(function (err, savedCharts) {
            //    chart_files_db.removeAllItems();
            //    if (err || !savedCharts || !savedCharts.chartTabs || !savedCharts.chartTabs.length) {
            //        //chartAreaControl.loadSpyAndMBIFiles(chartTab);
            //    }
            //});

        function downloadFile(file, callback) {
            angular.requests.get(file, {}, callback);
        }


    }

})(this)
