(function (root) {

    //this file manages the multi chart tab control

    var ChartTabsManager = root.ChartTabsManager = function () { }
    ChartTabsManager.prototype = new EventManager();

    angular.extend(ChartTabsManager.prototype, {
        /**
         * Initilize the manager
         * 
         * @ param{string} dropDivId - Where can drop chart's tab
         * */
        init: function (dropDivId) {
            var instance = this;
            instance.charts = [];
            //Counter for new tabs
            instance.chartCounter = 0;
            //To supprt dragging the chart into a differnt div
            instance.dropDivId = dropDivId;
        },
        /**
         * Add new chart tab
         * 
         * */
        addNewChartTab: function () {
            var instance = this;
            var newChartTab = new ChartTabItem().init(instance);
            instance.charts.push(newChartTab);
            newChartTab.select();
            instance.emit('newTab', newChartTab);
            return newChartTab;
        },
        /**
         * Get selected tab
         * 
         * */
        getSelectedTab: function () {
            var instance = this;
            //if no charts selected, then select the first one
            var charts = instance.primaryCharts();
            var selected = charts.filter(function (c) {
                return c.isSelected();
            })[0];
            return selected;
        },
        /**
         * Remove chart tab
         * 
         * @param {object} chart: The chart object
         * */
        removeChartTab: function (chart) {
            var instance = this;
            var index = instance.charts.indexOf(chart);
            instance.charts.splice(index, 1);
            //if no charts selected, then select the first one
            var charts = instance.primaryCharts();
            if (charts.length && !instance.getSelectedTab())
                charts[0].select();
        },
        /**
         * Remove chart tab
         * 
         * @param {object} chart: The chart object
         * */
        removeChartTabDialog: function (chart) {
            var instance = this;
            if (chart.highstock.isEmpty())
                return instance.removeChartTab(chart);
            angular.showMessage({
                title: 'Delete Chart',
                body: 'Remove this tab?',
                size: 'sm',
                ok: function (settings, close) {
                    instance.removeChartTab(chart);
                    close();
                }
            });
        },
        /**
         *Show a button to add new tab?
         * 
         * */
        showAddTabButton: function () {
            var instance = this;
            return true;
        },
        /**
         *Show a button to remove the tab?
         * 
         * */
        showRemoveTabButton: function () {
            var instance = this;
            return instance.primaryCharts().length > 0;
        },

        /**
         * Rename chart tab
         * 
         * @param {object} chart: The chart object
         * */
        renameChartTabDialog: function (chart) {
            var instance = this;
            angular.showMessage({
                title: "Chart title:",
                bodyUrl: '/static_files/Templates/chart/rename-chart-title-template.html?lastModified=20160924T2251',
                size: 'sm',
                chartTitle: chart.title,
                ok: function (settings, close) {
                    chart.title = settings.chartTitle;
                    close();
                }
            });
        },
        /**
         *Gets the div that's contains the chart control
         * 
         * */
        getChartDiv: function (chart) {
            var instance = this;
            return chart.highstock.getChartDiv();
        },

        /**
         *Restore the dragged chart to it's default location
         * 
         * */
        dragChart: function (chart, to) {
            var instance = this,
              charts = instance.charts,
              chartDiv = instance.getChartDiv(chart);

            instance.restoreDraggedChart();

            chart.originalParentDiv = chartDiv.parent();
            chart.isPrimaryChart = false;
            chart.highstock.reflow(500);
            $(to).prepend(chartDiv);
            if (!instance.getSelectedTab() && instance.primaryCharts().length > 0)
                instance.primaryCharts()[0].select();
        },
        /**
         *Restore the dragged chart to it's default location
         * 
         * */
        restoreDraggedChart: function (setActiveChart) {
            var instance = this,
              charts = instance.charts;

            charts.forEach(function (c) {
                if (c.originalParentDiv) {
                    var chartDiv = instance.getChartDiv(c);
                    c.originalParentDiv.prepend(chartDiv);
                    c.originalParentDiv = undefined;
                    c.isPrimaryChart = true;
                    c.select();
                }
            });
        },

        /**
         *Check if a chart has dragged to left side
         * 
         * */
        hasDraggedChart: function () {
            var instance = this;
            if (!instance.charts) return false;
            return instance.charts.some(function (c) {
                return !c.isPrimaryChart;
            });
        },
        /**
         *Gets only the primary charts that listed in the Tab control and not dragged
         * 
         * */
        primaryCharts: function () {
            var instance = this;
            if (!instance.charts) return [];
            return instance.charts.filter(function (c) {
                return c.isPrimaryChart;
            });
        }
    });


    //Object for one chart tab item
    var ChartTabItem = root.ChartTabItem = function () { }
    ChartTabItem.prototype = new EventManager();

    angular.extend(ChartTabItem.prototype, {

        /**
         * Initilize the tab item
         * 
         * @ param{ChartTabsManager} manager - The Parent tabs instance
         * */
        init: function (manager) {
            var item = this;

            item.chartTabsManager = manager;
            item.divId = (new Date().valueOf()) + '_Chart_' + manager.chartCounter;
            item.id = manager.chartCounter++;
            item.title = 'Chart ' + manager.chartCounter;
            item.isPrimaryChart = true;

            return item;
        },
        isSelected: function () {
            return this.chartTabsManager.selectedTab == this;
        },
        select: function () {
            return this.chartTabsManager.selectedTab = this;
        },
        /**
         * Load a series to the selected tab from url using the strategyRow, and keep monitoring the series for real-time data
         * 
         * @param {object} strategyRow: The strategy's row
         *                                                                   
         * */
        getHighstock: function (callback) {
            var chartTab = this;
            //if chart not created yet, then wait for it
            if (!chartTab.highstock || !chartTab.highstock.chart) {
                return chartTab.once('afterCreateHighstock', function () {
                    callback(chartTab.highstock);
                });
            }
            else callback(chartTab.highstock);
        }

    });

})(this)
