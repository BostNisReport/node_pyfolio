(function (root) {

    angular.module('LocalChartModule', []).controller('LocalChartController', ['$scope', localChart_Controller]);

    function localChart_Controller($scope) {
        $scope.utilities = utilities;
        var chartTabsManager = $scope.chartTabsManager = new ChartTabsManager();
        chartTabsManager.init();
        chartTabsManager.addNewChartTab();


        /**
       * Draw data in the chart
       * 
       * */
        function drawChartSeries(seriesData) {
            var highstock = chartTabsManager.getSelectedTab().highstock;
            highstock.clearChart();
            var seriesNames = Object.keys(seriesData);
            seriesNames.forEach(function (series, index) {
                highstock.addSeries({
                    type: 'line',
                    name: series,
                    yAxis: highstock.getOrAddYAxis(series).id,
                    data: seriesData[series]
                });
            });
            highstock.chart.resizeYAxis();
        }

        angular.ready(function () {
            var element = $('#fileinput');
            element.on('change', utilities.readInputFiles);
            element.on('fileLoaded', function (event, err, textFiles) {
                if (err) return alert(err);
                drawChartSeries(chartSeriesUtilities.parseSereisFromCsv(textFiles[0]));
            });
            $scope.setReady();
        });

    }


})(this)