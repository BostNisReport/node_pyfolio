(function (root) {
    angular.module('PredictionModelModule', []).controller('PredictionModelController', ['$scope', app_function]);

    function app_function($scope) {


        angular.ready(function () {
            $scope.setLoading();
            drawDefaultCharts(function (err) {
                $scope.accuracyValue = '92.347%';
                $scope.lossValue = 1.3;
                if (err) return $scope.setError(err);
                $scope.setReady();
            });

        });


        function drawDefaultCharts(callback) {
            var chartTabsManager = $('#chart-area1').data('chart');
            chartTabsManager.hideTabsHeader = true;
            var chartTab = chartTabsManager.addNewChartTab();
            chartTab.getHighstock(function (highstock) {
                showLegend(highstock.chart);
                var yAxis = highstock.addYAxis({ title: { text: '' } }).id;
                highstock.on('beforeAddSeries', function (series) {
                    series.yAxis = yAxis;
                    if (series.name == 'SPY') {
                        series.color = 'gold';
                    }
                    else {
                        series.color = 'rgb(26,179,203)';
                    }
                    series.lineWidth = 2;
                });
                loadSpyFile(highstock, callback);
            });

        }

        //loads the spy and penguin files
        function loadSpyFile(highstock, callback) {
            var spyFile = '/static_files/files/spy.csv?lastModified=20160929T2235';
            highstock.chartMessage = 'Loading SPY and MBI data...';
            angular.requests.get(spyFile, {}, function (err, content) {

                if (err) return  callback(err);
                var spyPoints = chartSeriesUtilities.parseSereisFromCsv(content);
                var seriesList = {
                    SPY: spyPoints["Spy"],
                    MODEL: spyPoints["Spy"].map(function (c) {
                        return {
                            x: c.x,
                            y: c.y + 3
                        }
                    })
                };
                highstock.addSeriesFromDictionary(seriesList, 'line');
                highstock.chartMessage = '';
                callback();

            });
        }
        
        function showLegend(chart) {
            chart.update({
                legend: {
                    enabled: true,
                    backgroundColor: '#f7f7f7',
                    borderColor: '#777',
                    borderWidth: 1,
                    floating: true,
                    layout: 'vertical',
                    squareSymbol: false,
                    itemStyle: {
                        font: '9pt "Open Sans", sans-serif',
                        'font-size':17
                    },
                    align: 'left',
                    verticalAlign: 'top',
                    y: 35,
                    x: 40,
                    shadow: false,
                    //labelFormatter: function () {
                    //    this.legendLine.attr({ 'stroke-width': 0 });
                    //    this.legendItem.css({
                    //        fill: this.legendLine.stroke,
                    //        'font-size':17
                    //    })
                    //    console.log(this);
                    //    return this.name;
                    //}
                }
            });
        }

    }

})(this)
