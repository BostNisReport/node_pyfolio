(function (root) {



    //This class manage the check for new data operation
    var StrategyChartRealtimeSeriesData = root.StrategyChartRealtimeSeriesData = function () { }

    StrategyChartRealtimeSeriesData.prototype = {

        /**
         * Initilize the manager
         * 
         * @ param{object} strategy - The user's strategy
         * */
        init: function (strategy) {
            var instance = this;
            instance.strategy = strategy;
            instance.list = [];
            return instance;
        },
        /**
         * Add new chart's series to the manager
         * 
         * @param {object} highstock: The chart's control object (see highstock-chart.js file)
         * @param {string} seriesId: The chart's seriesId
         * @param {string} strategyRow: The strategy row input
         * */
        add: function (highstock, seriesId, strategyRow) {
            var instance = this;
            instance.list.push({
                highstock: highstock,
                seriesId: seriesId,
                strategyRow: strategyRow,
                series: function () {
                    return this.highstock.chart.getSeries(this.seriesId);
                },
                lastBarDate: function () {
                    return this.series.xData[this.series.xData.length - 1];
                },
                remove: function () {
                    instance.remove(this.highstock, this.seriesId);
                }
            });
            return instance;
        },
        /**
         * Remove the chart's seriesId from the manager
         * 
         * @param {object} highstock: The chart's control object (see highstock-chart.js file)
         * @param {string} seriesId: The chart's seriesId
         * */
        remove: function (highstock, seriesId) {
            var instance = this;
            var indexes = Highcharts.findIndexs(instance.list, function (l) {
                return l.highstock == highstock && l.seriesId == seriesId;
            });
            indexes.reverse().forEach(function (index) {
                instance.list.splice(index, 1);
            });
            return instance;
        },
        _checkInternal: function (callback) {
            var instance = this,
              list = instance.list;
            //Remove not existing series
            [].concat(list).forEach(function (l) {
                if (!l.series()) l.remove();
            });

            var seriesList = list.map(function (l) {
                return angular.merge({
                    startTime: l.lastBarDate()
                }, l.strategyRow);
            });

            instance.strategy.api.getStrategyRowsData(seriesList, function (err, results) {
                if (!err) {
                    list.forEach(function (l, index) {
                        var points = results[index];
                        var series = l.series();
                        if (!series) return;
                        points.forEach(function (item) {
                            if (item.x <= l.series.startTime) return;
                            series.addPoint(item);
                        });
                        l.highstock.chart.shiftExtremes(1);
                    });

                }
                if (callback) callback(err);
            });
        },
        /**
         * Start the manager timer
         * 
         * */
        start: function () {
            var instance = this;
            if (!instance.strategy.api.socket)
                return instance;
            //Keep updating the series when new data avaiable in server
            var newData, stillInside;
            setInterval(function () {
                if (!newData || stillInside || !instance.list.length) return;
                newData = false;
                stillInside = true;
                instance._checkInternal(function () {
                    stillInside = false;
                });
            }, 1000);
            instance.strategy.api.socket.on('message', function () {
                newData = true;
            });
            return instance;
        }
    }


})(this)
