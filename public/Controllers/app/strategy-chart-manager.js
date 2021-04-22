(function (root) {


    var StrategyChartTabsManager = root.StrategyChartTabsManager = function (strategy) {
        this.init(strategy);
    }
    //Extend ChartTabsManager
    StrategyChartTabsManager.prototype = new ChartTabsManager();
    //Add strategy chart functions
    angular.extend(StrategyChartTabsManager.prototype, {

        /**
         * Initilize the manager
         * 
         * @ param{object} strategy - The user's strategy
         * */
        init: function (strategy) {
            ChartTabsManager.prototype.init.apply(this, ['drop_chart_div_' + strategy.name]);

            var instance = this;
            instance.strategy = strategy;
            strategy.chartTabsManager = instance;
            instance.on('newTab', function (chartTab) {
                chartTab.strategy = strategy;
                chartTab.getHighstock(function (highstock) {
                    seriesRedGreenMark(highstock);
                });
            });
            return instance;
        },
        /**
         * Initilize the realtime manager
         * 
         * @ param{object} strategy - The user's strategy
         * */
        openRealtimeSocket: function () {
            var instance = this;
            strategy.api.openSocket();
            instance.realtimeManager = (new StrategyChartRealtimeSeriesData()).init(strategy).start();
            return instance;
        },

        /**
         * Load a series to the selected tab from url using the strategyRow, and keep monitoring the series for real-time data
         * 
         * @param {object} strategyRow: The strategy's row
         *                                                                   
         * */
        drawRowInTab: function (chartTab, strategyRow, callback) {
            var instance = this,
                chartTab = chartTab || instance.getSelectedTab(),
                highstock = chartTab.highstock;
            //if chart not created yet, then wait for it
            if (!highstock || !highstock.chart) {
                return chartTab.getHighstock(function (highstock) {
                    instance.drawRowInTab(chartTab, strategyRow, callback)
                });
            }
            else {
                highstock.chartMessage = 'Loading...';
                if (!Array.isArray(strategyRow))
                    strategyRow = [strategyRow];
                var rows = StrategyRowInput.ofArray(strategyRow);
                //row.setRange('20140601T0931', '20140701T0931');
                instance.loadSeriesFromStrategyRows(highstock, rows, function (err) {
                    highstock.chartMessage = err;
                    if (callback) callback(err);
                });
            }
        },
        /**
        *Create a default templete (properties) for a chart series
        * */
        _seriesCreator: function (highstock, row) {
            var instance = this;
            var id = row.rowIndex || row.rowId || row.query;
            if (!id) throw 'Not valid strategyRow';
            var seriesId = "series_" + id;
            var seriesName = row.query || ('ALGO ' + id);
            var series = {
                id: seriesId,
                type: 'line',
                name: seriesName,
                panelTitle: row.panelTitle || seriesName
            };
            return series;
        },
        /**
         * Load a series to the highstock from url using the strategyRow, and keep monitoring the series for real-time data
         * 
         * @param {object} strategyRow: The strategy's row input
         *                                                                   
         * */
        loadSeriesFromStrategyRow: function (highstock, strategyRow, callback) {
            var instance = this,
                chart = highstock.chart,
                row = StrategyRowInput.of(strategyRow).setRange(chart.getStartTime(), chart.getEndTime() || strategyRow.endTime, chart.getRange()).limit(300),
                seriesProperties = instance._seriesCreator(highstock, row),
                seriesId = seriesProperties.id,
                series = chart.getSeries(seriesId),
                api = instance.strategy.api;

            seriesProperties.row = strategyRow;

            if (series) series.hide();
            api.getStrategyRowsData([row], function (err, r) {
                if (err) return callback && callback(err);
                var points = instance._expandPoints(r[0], strategyRow, row);
                if (series) {
                    highstock.setSeriesData(seriesId, points);
                    series.show();
                }
                else {
                    seriesProperties.data = points;
                    highstock.addSeries(seriesProperties);
                    chart.getSeries(seriesId).lazyLoading = true;
                    //Make all panels the same size
                    chart.resizeYAxis();
                    //Add the new charts to the check manager
                    if (instance.realtimeManager) {
                        instance.realtimeManager.add(highstock, seriesId, strategyRow);
                    }
                    //Handle the lazy loading of highstock
                    instance._onExtremesChanaged(highstock);
                }
                if (callback) callback(err, seriesProperties);
            });

        },
        //This will force highstock to expand the scrollbar
        _expandPoints: function (result, strategyRow, inputRow) {
            var points = result.points,
                startTime = strategyRow.startTime || moment.utc(result.row.firstAvailableTime, 'YYYYMMDDTHHmm').valueOf(),
                endTime = strategyRow.endTime || moment.utc(result.row.lastAvailableTime, 'YYYYMMDDTHHmm').valueOf(),
                leftPoints = [],
                rightPoints = [],
                displayRange = inputRow.range || (inputRow.endTime - inputRow.startTime) || 604800000,
                l = points.length,
                minRange = inputRow.startTime || (l && points[0].x),
                maxRange = inputRow.endTime || (l && points[l - 1].x),
                temp;

            //add empty points before the startPoint to support dragging the chart to left side
            if (minRange) {
                temp = minRange;
                while (true) {
                    temp -= displayRange;
                    if (temp <= startTime) break;
                    leftPoints.push({ x: temp });
                }
                leftPoints.push({ x: startTime });
                leftPoints.reverse();
            }
            //add empty points after the endPoint to support dragging the chart to right side
            if (maxRange) {
                temp = maxRange;
                while (true) {
                    temp += displayRange;
                    if (temp >= endTime) break;
                    rightPoints.push({ x: temp });
                }
            }
            rightPoints.push({ x: endTime });
            return [].concat(leftPoints).concat(points).concat(rightPoints);
        },
        //Load the data when the highstock's extemes changed, It's called lazy loading
        _onExtremesChanaged: function (highstock) {
            var instance = this;
            if (highstock.lazyLoadingFn) return;
            highstock.lazyLoadingFn = {
                beforeSetExtremes: function () {
                    //highstock.chart.xAxis[0].visible = false;
                },
                afterSetExtremes: function (e) {
                    if (utilities.isUserAgentMobile())
                        highstock.lazyLoadingFn.reloader.touch(e);
                    else highstock.lazyLoadingFn.reloader.invoke(e);
                },
                //Make sure the funtion does not invoked many times
                reloader: utilities.timeout(function (e) {

                    var rows = highstock.options.series.map(function (series) {
                        return series.row;
                    });
                    rows = rows.filter(function (r) { return r; });
                    if (rows.length) {
                        instance.loadSeriesFromStrategyRows(highstock, rows, function (err) {
                            //highstock.chart.xAxis[0].visible = true;
                            if (err) return alert(err);
                            highstock.chart.resizeYAxis();
                            highstock.chart.emit('lazyLoadingPointsLoaded', rows);
                        });
                    }

                }, 100)
            };
            highstock.chart.on('beforeSetExtremes', highstock.lazyLoadingFn.beforeSetExtremes);
            highstock.chart.on('afterSetExtremes', highstock.lazyLoadingFn.afterSetExtremes);

        },
        /**
         * Load a array of rows 
         * 
         *                                                                   
         * */
        loadSeriesFromStrategyRows: function (highstock, strategyRowArray, callback) {
            var instance = this;
            highstock.showLoading();
            async.eachSeries(strategyRowArray, function (row, oneDone) {
                if (!row) return;
                instance.loadSeriesFromStrategyRow(highstock, row, oneDone);
            }, function (err) {
                //if(err)highstock.chartMessage = err;
                highstock.hideLoading();
                if (callback) callback(err);
            });
        },
        /**
         * Read the args from remoteChart or python console 
         * 
         *                                                                   
         * */
        loadSeriesFromRemoteArgs: function (highstock, args) {
            var instance = this;
            highstock = highstock || instance.getSelectedTab().highstock;
            var data = args.seriesData || args.data || args.series || args.points;
            if (data) {
                //If input is JSON text, then parse it first
                if (typeof (data) == 'string')
                    data = JSON.parse(data);
                var chartSeries = {};
                if (Array.isArray(data))
                    chartSeries.series = strategyUtilities.convertRowToPoints(data);
                else if (typeof (data) == 'object') {
                    //It's dictionary of name/data series
                    Object.keys(data).forEach(function (key) {
                        chartSeries[key] = strategyUtilities.convertRowToPoints(data[key]);
                    });
                }
                highstock.addSeriesFromDictionary(chartSeries, 'line', true);
                highstock.chartMessage = '';
            }
            if (args.rows) {
                instance.strategy.setName(args.strategyName);
                instance.loadSeriesFromStrategyRows(highstock, StrategyRowInput.ofArray(args));
                highstock.chartMessage = '';
            }
        },
        /**
         * Save all charts (the charts of strategy row) to cookies
         * 
         *                                                                   
         * */
        saveChartSession: function () {
            var instance = this;
            var saveObject = {
                id: 1,
                version: root.utilities.getCookie('version'),
                chartTabs: [],
                selectedIndex: instance.charts.indexOf(instance.getSelectedTab())
            };
            instance.charts.forEach(function (chart) {
                var highstock = chart.highstock;
                var series = highstock.options.series || [];
                var charted_lines = [];
                series.forEach(function (s) {
                    var yAxis = highstock.getAxisById(s.yAxis);
                    charted_lines.push({
                        rowIndex: s.row ? s.row.rowIndex : undefined,
                        panelDisplayIndex: yAxis.displayIndex,
                        panelTitle: yAxis.title.text,
                        seriesName: s.seriesName,
                        data: s.row ? undefined : s.data
                    });
                });
                if (charted_lines.length)
                    saveObject.chartTabs.push({
                        charts: charted_lines,
                        selectedRangeType: highstock.chart.rangeSelector.selected,
                        scrollStart: highstock.chart.getStartTime(),
                        scrollEnd: highstock.chart.getEndTime()
                    });
            });
            root.chart_files_db.addItem(saveObject);
        },
        /**
         * loads all charts (the charts of strategy row) from cookies
         * 
         *                                                                   
         * */
        loadChartSession: function (callback) {
            var instance = this;
            root.chart_files_db.getItem(1, function (err, savedObject) {
                if (err || !savedObject || !savedObject.chartTabs) return callback && callback(err, savedObject);
                if (Number(savedObject.version) != Number(root.utilities.getCookie('version')))
                    return callback && callback();
                while (instance.charts.length < savedObject.chartTabs.length)
                    instance.addNewChartTab();
                var selectedTab = instance.charts[savedObject.selectedIndex];
                if (selectedTab) selectedTab.select();

                savedObject.chartTabs.forEach(function (tab, index) {
                    var chartTab = instance.charts[index];
                    var chartsWithRowIndex = tab.charts.filter(function (c) { return Number.isFinite(c.rowIndex); });
                    var chartsWithoutRowIndex = tab.charts.filter(function (c) { return !Number.isFinite(c.rowIndex); });

                    async.series([
                        function (callback) {
                            instance.drawRowInTab(chartTab, chartsWithRowIndex, callback);
                        },
                        function (callback) {
                            chartTab.highstock.addSeriesArray(chartsWithoutRowIndex);
                            callback();
                        }
                    ], function () {
                        //Sets the displayIndex of each panel
                        chartTab.highstock.options.yAxis.forEach(function (yAxis) {
                            var temp = tab.charts.filter(function (x) { return x.panelTitle == yAxis.title.text; })[0];
                            if (temp && Number.isFinite(temp.panelDisplayIndex))
                                yAxis.displayIndex = temp.panelDisplayIndex;
                        });
                        chartTab.highstock.chart.applyYAxisDisplayIndex();
                        if (Number.isFinite(tab.selectedRangeType))
                            chartTab.highstock.chart.setSelectedRange(tab.selectedRangeType);
                        chartTab.highstock.chart.setExtremes(tab.scrollStart, tab.scrollEnd);
                    });
                });
                if (callback) callback(err, savedObject);
            });

        }
    });




    //Mark series by red/green colors
    function seriesRedGreenMark(highstock) {

        function updateSeriesColors(seriesId, data) {
            var series = highstock.chart.getSeries(seriesId);
            var negativeSeries = chartSeriesUtilities.hasNegativeValues(data);
            if (!negativeSeries) {
                series.getSeriesPoints = Highcharts.Series.prototype.getSeriesPoints;
                series.getPointColor = Highcharts.Series.prototype.getPointColor;
                return;
            }

            highstock.addPlotLine(series.options.yAxis, {
                value: 0
            });
           
            //Override this function to enable adding extra points when series change it's signal (+ to - or - to +)
            series.getSeriesPoints = function () {
                var points = [],
                    series = this,
                    seriesId = series.options.id,
                    chart = series.chart,
                    s_points = series.points,
                    length = s_points.length,
                    p1, p2;
                for (var i = 0; i < length; i++) {
                    points.push(s_points[i]);
                    if (i == length - 1) continue;
                    p1 = s_points[i];
                    p2 = s_points[i + 1];
                    //If the condition is correct then add point between the two points
                    if (Number.isFinite(p1.y) && Number.isFinite(p2.y) && p1.y != 0 && Math.sign(p1.y) != Math.sign(p2.y)) {
                        var p = {
                            x: (p1.x + p2.x) / 2,
                            y: 0
                        }
                        p.plotX = chart.xValueToPixels(seriesId, p.x, true);
                        p.plotY = chart.yValueToPixels(seriesId, p.y, true);
                        points.push(p);
                    }

                }

                return points;
            }

            series.getPointColor = function (allPoints, index) {
                var p = allPoints[index],
                    n = allPoints[index + 1];
                //If no value, then return no color
                if (!Number.isFinite(p.y)) p.color = undefined;
                else if (p.y > 0) p.color = '#67981A'; //green
                else if (p.y < 0) p.color = '#D01C3F'; //red
                else if (p.y == 0) {
                    if (!n) p.color = undefined;
                    else if (n.y > 0) p.color = '#67981A'; //green
                    else if (n.y < 0) p.color = '#D01C3F'; //red
                    else if (n.y == 0) p.color = 'white';
                }
                return p.color;
            }

        }
        highstock.on('afterSetSeriesData', updateSeriesColors);
        highstock.on('afterAddSeries', function (seriesOptions) {
            updateSeriesColors(seriesOptions.id, seriesOptions.data);
        });
    }

})(this)
