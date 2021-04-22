(function (root) {

    //This module manage the strategy chart operations
    angular.module('chart-directives', []).
    //The chart control
    directive('highstockControl', [function () {
        return {
            restrict: 'A',
            templateUrl: '/static_files/Templates/chart/chart-control-template.html?lastModified=20170512T0811',
            link: function (scope, element, attr) {
                var chart = scope.chart;
                chart.showChartToolbar = false;

                chart.highstock = new HighstockChart();
                chart.highstock.init(scope);
                if (chart.beforeCreateHighstock) chart.beforeCreateHighstock();
                if (chart.emit)chart.emit('beforeCreateHighstock');
                // chart.highstock.options.rangeSelector.enabled = false;
                chart.highstock.drawChart(element.find('.chart-control-element')[0]);
                if (chart.afterCreateHighstock) chart.afterCreateHighstock();
                if (chart.emit) chart.emit('afterCreateHighstock');
            }
        }
    }]).
    //Show a tab control, each tab has a chart control
    directive('chartTabsControl', function () {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                chartTabsManager: '='
            },
            templateUrl: '/static_files/Templates/chart/chart-tab-control-template.html?lastModified=20160926T1357',
            link: function (scope) {
            }
        }
    }).

    //put as attribute in each chartTab header, make the actual drag&drop process
    directive('dragDropChartToDiv', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var chart = scope.chart,
                    chartTabsManager = chart.chartTabsManager,
                    dropDiv = attr.dragDropChartToDiv;

                if (!$(dropDiv).length) return;
                element.jqxDragDrop({
                    appendTo: 'body',
                    dropAction: 'none',
                    dropTarget: dropDiv,
                    dragZIndex: 1000000
                });

                element.bind('dragStart', function (event) {
                    $(dropDiv).addClass('drop-chart-target-border');
                });
                element.bind('dragEnd', function (event) {
                    $(dropDiv).removeClass('drop-chart-target-border');

                    if (!$(dropDiv).isInside(event)) return;
                    chartTabsManager.dragChart(chart, dropDiv);
                    scope.$applyAsync();
                });
            }
        }
    }).


    //This directive provide the ability to drag any chart tab to a div
    directive('chartDropDiv', function () {
        return {
            restrict: 'A',
            templateUrl: '/static_files/Templates/chart/chart-drop-div-template.html?lastModified=20170512T0811',
            scope: {
                chartTabsManager: '=',
            },
            link: function (scope, element, attr) {
                //element.jqxNavigationBar({ width: '100%', height: '100%', theme: window.jqxTheme, expandMode: 'singleFitHeight', expandedIndexes: [0] });
                // strategy.on('refreshNavigationBar', function () { element.jqxNavigationBar('refresh') });
            }
        }
    });


})(this)