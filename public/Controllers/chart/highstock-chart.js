(function (root) {

    //store the required variables
    var global = {};

    // Highcharts global options
    Highcharts.setOptions({
        lang: {
            rangeSelectorZoom: '',
            rangeSelectorFrom: '',
            rangeSelectorTo: 'to'
        },
        global: {
            useUTC: true
        },
        colors: ['#00B4CE', '#FFCF46', '#8FC502', '#D48826', '#3487BF', '#902C25', '#8E1140', '#F19A4D', '#f7a35c',
            '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'
        ]
    });


    var chart_contextMenuTemplate = "<div><ul>" +
        "<li id='seriesNameItem'>Name</li>" +
        "<li id='exportItem'>Export</li>" +
        "<li id='deleteItem'>Delete</li>" +
        "<li id='moveToNewPanelItem'>Move to new panel</li>" +
        //"<li id='moveDownItem'>Move down <span class='glyphicon glyphicon-arrow-down'></span></li>" +
        "</ul></div>";
    var anno_contextMenuTemplate = "<div><ul><li id='deleteItem'>Delete</li><li id='editItem'>Edit</li></ul></div>";

    /**
     * Manage all chart's functions
     */
    var HighstockChart = root.HighstockChart = function () {

    };
    HighstockChart.prototype = new EventManager();

    angular.extend(HighstockChart.prototype, {

        /**
         * Init the chart
         * 
         * @param {object} options: The new chart's options
         * */
        init: function (scope, options) {
            var chartManager = this;
            chartManager.scope = scope;
            chartManager.applyUI = function () {
                chartManager.scope.$applyAsync();
            }
            chartManager.fn = {};


            //The vertical lines list
            chartManager.vLinesList = [{
                displayName: 'Every year',
                value: 1,
                type: 'years'
            }, {
                    displayName: 'Every month',
                    value: 1,
                    type: 'months'
                }, {
                    displayName: 'Every week',
                    value: 1,
                    type: 'weeks'
                }, {
                    displayName: 'Every day',
                    value: 1,
                    type: 'days'
                }, {
                    displayName: 'Every hour',
                    value: 1,
                    type: 'hours'
                }];

            //all default values for a chart's options
            chartManager.options = {
                chart: {
                    events: {
                        redraw: function () {
                            var chart = this;
                            chart.hideInternalGridLines();
                            chart.drawYAxisRightBorders();
                        }
                    },
                    panning: false,
                    ignoreHiddenSeries: false
                },
                
                xAxis: [{
                    type: 'datetime',
                    id: 'xAxis_0',
                    //minRange: 30 * 24 * 60 * 60 * 1000, // one month
                    minRange: 3600 * 250, // 0.25 hour
                    events: {
                        afterSetExtremes: function (e) {
                            this.chart.emit('afterSetExtremes', e);
                        },
                        setExtremes: function (e) {
                            this.chart.emit('beforeSetExtremes', e);
                        }
                    },
                    // startOnTick:true
                }],
                yAxis: [],
                navigator: {
                    enabled: false
                },
                scrollbar: {
                    enabled: true,
                },
                legend: {
                    enabled: false,
                }
            };


            //the chart control, assiged when chart started
            chartManager.chart = undefined;


            //invoke the apply function after 300 milliseconds, so the UI keep stable
            chartManager.applyScopeTimeout = utilities.timeout(function () {
                chartManager.applyUI();
            }, 300);

            //sometimes, after clicking or dragging the chart the body cursor switched to 'move'
            var hideMoveCursor = function () {
                document.body.style.cursor = 'default';
                setTimeout(hideMoveCursor, 1000);
            }
            hideMoveCursor();


            chartManager.setOptions(options);

        },


        /**
         * Set the chart's options
         * 
         * @param {object} options: The new chart's options
         * @param {boolean} reset: Reset the chart's options or merge it will old options? (default false)
         * */
        setOptions: function (options, reset) {
            var chartManager = this;
            if (reset) chartManager.options = {};
            angular.merge(chartManager.options, options);
        },


        /**
         * Is loading shown in chart?
         * 
         * */
        isLoadingShown: function () {
            var chartManager = this;
            return chartManager.chart && chartManager.chart.loadingShown;
        },
        /**
         * Start drawing the chart by merging the default options with the thisInstance.options the chart
         * 
         * @param {string or object} element: The dom element id to draw the chart in
         * @param {function} func: The callback function that will be invoked after chart drawing
         * */
        drawChart: function (element, func) {
            if (typeof (element) == 'string')
                element = $('#' + element)[0];

            var chartManager = this;
            var oldChart = chartManager.chart;
            var chartOptions = angular.copy(chartManager.options);
            //set the render to element
            chartOptions.chart.renderTo = element || oldChart.options.chart.renderTo;

            $(element).css('height', '500px');

            window.chart111= chartManager.chart = new Highcharts.StockChart(chartOptions);
            //override the function to return the ral user's options (this used when user updates the options by actions)
            chartManager.chart.getUsersOptions = function () {
                return chartManager.options;
            };
            func = func || chartManager.options.func;
            if (typeof (func) == 'function') func(chartManager.chart);

            $(chartManager.chart.container.parentElement).sizeChanged(function () {
                if (!chartManager.chart) return;
                chartManager.chart.container.style.width = '100%';
                setTimeout(function () {
                    chartManager.chart.resizeOtherYAxis();
                }, 500);
                chartManager.reflow();
            });

            if (oldChart) {
                chartManager.redrawPlotLinesAndPlotBands();
                chartManager.chart.series.forEach(function (series) {
                    series.redraw();
                });
                chartManager.chart.hideInternalGridLines();
            }
            chartManager.chart.on('seriesMoved', function (series) {
                chartManager.removeEmptyYAxis();
                chartManager.applyUI();
            });
            chartManager.chart.on('yAxisResized', function () {
                chartManager.applyScopeTimeout.touch();
            });
            chartManager.chart.on('yAxisRemoved', function (yAxisId, seriesRemoved) {
                chartManager.removeYAxis(yAxisId, seriesRemoved);
                chartManager.applyScopeTimeout.touch();
            });
            chartManager.setChartContextMenu();
            chartManager.chart.redraw();
            //sets the height
            chartManager.setChartHeight('100%');
        },


        /**
         * Destroy the chart
         * 
         * */
        destroyChart: function () {
            var chartManager = this;
            if (!chartManager.chart) return;
            chartManager.chart.destroy();
            chartManager.chart = undefined;
        },
        /**
         * Clear everything in the chart
         * 
         * */
        clearChart: function () {
            var chartManager = this;
            var yAxis = chartManager.options.yAxis;
            chartManager.clearAnnotations();
            chartManager.clearPlotLinesAndPlotBands();
            while (yAxis && yAxis.length)
                chartManager.removeYAxis(yAxis[0].id, true);

        },
        /**
         * Set height to chart's container
         * 
         * */
        setChartHeight: function (height) {
            var chartManager = this;
            if (!chartManager.chart) return;
            chartManager.chartHeight = height;
            $(chartManager.chart.renderTo).css('height', chartManager.chartHeight);
        },
        /**
         * reflow the chart area
         * 
         * */
        reflow: function (waitTime) {
            var chartManager = this;
            if (!waitTime) waitTime = 10;
            setTimeout(function () {
                if (!chartManager.chart) return;
                chartManager.chart.reflow();
            }, waitTime);
        },
        /**
         * Chart context menu
         * 
         * */
        setChartContextMenu: function () {
            var chartManager = this;
            if (!chartManager.chart) return;
            $(chartManager.chart.container).contextMenu(chart_contextMenuTemplate, function (menu) {
                menu.jqxMenu('disable', 'seriesNameItem', true);
                menu.on('shown', function () {
                    var selected = chartManager.chart.getHoverSeries();
                    var name = !selected ? '' : selected.name;
                    menu.itemText('seriesNameItem', name);
                    menu.selected = selected;

                    menu.find('li').each(function (index, item) {
                        menu.showItem(item.id, selected);
                    });

                });
                menu.on('itemclick', function (e) {
                    var id = e.args.id;
                    if (id == 'deleteItem') chartManager.showRemoveSeriesDialog(menu.selected.options.id, true);
                    else if (id == 'exportItem') {
                        chartManager.options.series.forEach(function (s) {
                            s.selected = s.id == menu.selected.options.id
                        });
                        chartManager.showExportSeriesDialog()
                    } else if (id == 'moveToNewPanelItem') {
                        chartManager.moveSeriesToNewPanel(menu.selected.options.id);
                    }
                    chartManager.applyUI();
                });
            });
        },

        /**
         * Add a new series to the chart's options
         * 
         * @Param {object} seriesOptions: The options to create the series (see highstock docs)
         * */
        addSeries: function (seriesOptions) {
            var chartManager = this,
                panelTitle = seriesOptions.panelTitle || seriesOptions.seriesName;

            seriesOptions.name = seriesOptions.name || seriesOptions.seriesName;

            chartManager.seriesCounter = chartManager.seriesCounter || 0;
            if (!seriesOptions.id) seriesOptions.id = 'series_' + seriesOptions.name + '_' + chartManager.seriesCounter++;

            if (!chartManager.options.series) chartManager.options.series = [];
            
            chartManager.emit("beforeAddSeries", seriesOptions);
            if (!seriesOptions.yAxis) {
                var yAxis;
                if (seriesOptions.panelTitle)
                    yAxis = chartManager.getOrAddYAxis(seriesOptions.panelTitle);
                else yAxis = chartManager.options.yAxis[0] || chartManager.addYAxis({});
                seriesOptions.yAxis = yAxis.id;
            }
            chartManager.options.series.push(seriesOptions);
            //check if the chart exists then add the series to the chart control
            if (chartManager.chart) {
                chartManager.chart.addSeries(seriesOptions);
                if (chartManager.vLinesPeriodOptions)
                    chartManager.drawVLinesEvery(chartManager.vLinesPeriodOptions, true);
            }
            chartManager.emit("afterAddSeries", seriesOptions);
            return seriesOptions.id;
        },
         /**
         * Sets new data for this series
         *
         * @Param {string} seriesId: The series id
         * @Param {Array} seriesData: The series data
         * */
        setSeriesData: function (seriesId, seriesData) {
            var chartManager = this;
            var alreadyCreated = chartManager.chart.getSeries(seriesId);
            chartManager.emit("beforeSetSeriesData", seriesId,seriesData);
            alreadyCreated.setData(seriesData);
            chartManager.emit("afterSetSeriesData", seriesId, seriesData);
        },
        /**
         * Add a new series to the chart's options
         * 
         * @Param {object} seriesData: The object that map seriesName to it's actual data array
         * */
        addSeriesFromDictionary: function (seriesData, seriesType,redraw) {
            var chartManager = this;

            var seriesNames = Object.keys(seriesData);
            seriesNames.forEach(function (seriesName, index) {

                if (chartManager.chart.getSeries(seriesName))
                    chartManager.setSeriesData(seriesName,seriesData[seriesName]);
                else {
                    chartManager.addSeries({
                        id: seriesName,
                        type: seriesType || 'line',
                        name: seriesName,
                        panelTitle: seriesName,
                        data: seriesData[seriesName]
                    });
                }

            });
            if (redraw)
                chartManager.chart.resizeYAxis();
        },
        /**
         * Add a new series to the chart's options
         * 
         * @Param {Array} seriesArray: Array of series options
         * */
        addSeriesArray: function (seriesArray,redraw) {
            var chartManager = this;

            seriesArray.forEach(function (series, index) {
                chartManager.addSeries(series);
            });
            if (redraw)
                chartManager.chart.resizeYAxis();
        },
        /**
         * Gets the series's options object by id
         * 
         * @Param {string or number} seriesId: the series id or index
         * */
        getSeries: function (seriesId) {
            var chartManager = this,
                series;
            if (typeof (seriesId) == 'number') {
                series = chartManager.options.series[seriesId];
            } else if (chartManager.options.series) {
                series = chartManager.options.series.filter(function (s) {
                    return s.id == seriesId;
                })[0];
            }
            return series;
        },
        /**
         * Gets the series's options object by name
         * 
         * @Param {string} seriesName: the series name
         * */
        getSeriesByName: function (seriesName) {
            var chartManager = this,
                series;
            if (chartManager.options.series) {
                series = chartManager.options.series.filter(function (s) {
                    return s.name == seriesName;
                })[0];
            }
            return series;
        },
        /**
         * Remove the series from the chart's options
         * 
         * @Param {boolean} removeEmptyYAxis: Should remove the empty yAxis?
         * @Param {string} seriesId: The series id
         * */
        removeSeries: function (seriesId, removeEmptyYAxis) {
            var chartManager = this;
            if (!chartManager.options.series || !seriesId) return;
            var targetSeries = chartManager.getSeries(seriesId);
            if (!targetSeries) return; //series not found
            var seriesIndex = chartManager.options.series.indexOf(targetSeries);
            chartManager.options.series.splice(seriesIndex, 1);
            //check if the chart exists then add the series to the chart control
            if (chartManager.chart) {
                var chartTargetSeries = chartManager.chart.getSeries(seriesId);
                if (chartTargetSeries) chartTargetSeries.remove();
                if (removeEmptyYAxis) chartManager.removeEmptyYAxis();
            }
        },




        /**
         * Add a new yAxis to the chart's options
         * 
         * @Param {object} yAxisOptions : The yAxis Options (see highstock docs)
         * */
        addYAxis: function (yAxisOptions, index) {
            var chartManager = this;
            chartManager.yAxisCounter = chartManager.yAxisCounter || 0;
            if (index == undefined) index = chartManager.options.yAxis.length;
            if (!yAxisOptions.id) yAxisOptions.id = 'yAxis_' + chartManager.options.yAxis.length + '_' + chartManager.yAxisCounter++;
            chartManager.options.yAxis.splice(index, 0, yAxisOptions);
            
            //check if the chart exists then add the yAxis to the chart control
            if (chartManager.chart) {
                // yAxisOptions.title.text = undefined;
                chartManager.chart.addAxis(yAxisOptions);
                chartManager.chart.setYAxisSize(yAxisOptions.id, 100 / chartManager.options.yAxis.length);
            }
            return yAxisOptions;
        },

        /**
         * If the yAxis exists then return it, if not, then Add a new yAxis to the chart's options
         * 
         * @Param {string} yAxisTitle : The yAxis title (see highstock docs)
         * */
        getOrAddYAxis: function (yAxisTitle) {
            var chartManager = this;
            var yAxis = chartManager.options.yAxis.filter(function (yAxis) {
                return yAxis.title && yAxis.title.text == yAxisTitle
            })[0];
            yAxis = yAxis || chartManager.addYAxis({
                title: {
                    text: yAxisTitle
                }
            });
            return yAxis;
        },


        /**
         * Remove the yAxis from the chart's options
         * 
         * @Param {string} yAxisId: The yAxis id (see highstock docs)
         * @Param {boolean} removeSeries: Should remove all sereis
         * */
        removeYAxis: function (yAxisId, removeSeries) {
            var chartManager = this;
            if (!yAxisId) return;
            var targetYAxis = chartManager.options.yAxis.filter(function (yAxis) {
                return yAxis.id == yAxisId;
            })[0];
            if (!targetYAxis) return; //yAxis not found
            if (removeSeries) {
                chartManager.options.series.
                    filter(function (series) {
                        return series.yAxis == yAxisId;
                    }).
                    forEach(function (series) {
                        chartManager.removeSeries(series.id);
                    });
            }
            var yAxisIndex = chartManager.options.yAxis.indexOf(targetYAxis);
            chartManager.options.yAxis.splice(yAxisIndex, 1);
            if (!chartManager.options.yAxis.length)
                chartManager.clearPlotLinesAndPlotBands();
            //check if the chart exists then remove the yAxis from the chart control
            if (chartManager.chart) {
                chartManager.chart.removeYAxis(yAxisId, true);
                chartManager.chart.resizeOtherYAxis();
            }
        },






        /***
         * Move the series a new yAxis
         * 
         * @Param {string} seriesId: The seriesId id
         * */
        moveSeriesToNewPanel: function (seriesId) {
            var chartManager = this;
            var targetSeries = chartManager.getSeries(seriesId);

            var newYAxis = chartManager.addYAxis({
                title: {
                    text: targetSeries.name
                }
            });
            //check if the chart exists then update the series to the chart control
            if (chartManager.chart) {
                chartManager.chart.moveSeries(seriesId, newYAxis.id);
                chartManager.chart.shiftYAxisDisplayIndex(newYAxis.id, -100)
            }
        },
        /**
         * Remove all empty yAxis from the chart's control
         * 
         * */
        removeEmptyYAxis: function () {
            var chartManager = this;
            if (!chartManager.chart) return;
            var emptyYAxis = chartManager.options.yAxis.filter(function (yAxis) {
                return !chartManager.options.series.some(function (s) {
                    return s.yAxis == yAxis.id;
                });
            });
            emptyYAxis.forEach(function (yAxis) {
                chartManager.removeYAxis(yAxis.id);
            });
        },
        /**
         * Check if the chart has no series
         * 
         * */
        isEmpty: function () {
            var chartManager = this;
            return !chartManager.options || !chartManager.options.series || !chartManager.options.series.length;
        },




        /**
         * Gets the axis object by id
         * 
         * @Param {string} axisId: the axis id
         * */
        getAxisById: function (axisId) {
            var chartManager = this;
            return chartManager.options.xAxis.filter(function (axis) {
                return axis.id == axisId
            })[0] || chartManager.options.yAxis.filter(function (axis) {
                return axis.id == axisId
            })[0];
        },


        /**
         * Add a plotline
         * 
         * @Param {string} axisId: the axis id
         * @Param {number} value: The x or y value
         * */
        addPlotLine: function (axisId, plotlineOption) {
            var chartManager = this;
            var axis = chartManager.getAxisById(axisId);
            if (!axis.plotLines) axis.plotLines = [];
            var plotLine = angular.merge({
                id: (axisId + '' + plotlineOption.value),
                axisId: axisId
            }, Highcharts.theme.plotLine, plotlineOption);

            axis.plotLines.push(plotLine);
            //check if the chart exists then add the plotline to the chart control
            if (chartManager.chart) {
                chartManager.chart.getAxis(axisId).addPlotLine(plotLine);
            }
        },

        /**
         * Show a diloag to add the Plotline
         * 
         * */
        addPlotLineDialog: function () {
            var chartManager = this;
            angular.showMessage({
                title: 'Add Plotline',
                bodyUrl: '/static_files/Templates/chart/add-plotLine-template.html?lastModified=20160909T1938',
                size: 'sm',
                options: angular.merge({
                    value: 0
                }, Highcharts.theme.plotLine),
                yAxis: chartManager.options.yAxis,
                selectedYAxis: chartManager.options.yAxis[0].id,
                ok: function (settings, close) {
                    chartManager.addPlotLine(settings.selectedYAxis, settings.options);
                    close();
                }
            });

        },


        /**
         * Draw a plot band using mouse/touch
         * 
         * @Param {object} options: The plotBand options
         * @Param {string} direction: Draw on 'x' or 'y' axis?
         * @Param {function} callback: Called after drawing finished
         * */
        drawPlotBandByHand: function (options, direction, callback) {
            var chartManager = this;
            if (!chartManager.chart) return;
            chartManager.chart.drawPlotBandByHand(options, direction, function (line) {
                var axis = chartManager.getAxisById(line.axis.options.id);
                if (!axis.plotBands) axis.plotBands = [];
                axis.plotBands.push(line.options);
                line.options.events.click = function (e) {
                    if (!chartManager.lastClickedTime || (e.timeStamp - chartManager.lastClickedTime) > 300) chartManager.lastClickedTime = e.timeStamp;
                    else chartManager.showPlotBandEditDialog(this);
                }
                if (callback) callback(line);
                chartManager.showPlotBandEditDialog(line);
                chartManager.applyUI();
                line.created = function () {
                    chartManager.setPlotBandContextMenu(line);
                };
                chartManager.setPlotBandContextMenu(line);
            });
        },
        /**
         * Set a contextMenu plotband
         * 
         * */
        setPlotBandContextMenu: function (plotBand) {
            var chartManager = this;
            if (plotBand.menu) plotBand.menu.jqxMenu('destroy');
            $(plotBand.svgElem.element).contextMenu(anno_contextMenuTemplate, function (menu) {
                plotBand.menu = menu;
                menu.on('itemclick', function (e) {
                    var id = e.args.id;
                    if (id == 'deleteItem') chartManager.removePlotBands(plotBand);
                    else if (id == 'editItem') chartManager.showPlotBandEditDialog(plotBand);
                    chartManager.applyUI();
                });
            });
        },
        /**
         * Show a diloag to edit the plot band
         * 
         * */
        showPlotBandEditDialog: function (plotBand) {
            var chartManager = this;
            angular.showMessage({
                title: 'Edit plotBand',
                bodyUrl: '/static_files/Templates/chart/edit-plotBand-template.html?lastModified=20160909T1938',
                //  size: 'lg',
                options: plotBand.options,
                ok: function (settings, close) {
                    plotBand.update(settings.options);
                    close();
                },
                deletePlotBand: function () {
                    chartManager.removePlotBands(plotBand);
                }
            });

        },



        /**
         * Remove all plotlines and plotbands
         * 
         * */
        removePlotBands: function (plotBand) {
            var chartManager = this;
            var axis = chartManager.getAxisById(plotBand.axis.options.id);
            var index = Highcharts.findIndexs(axis.plotBands, function (a) {
                return a.id == plotBand.options.id
            })[0];
            axis.plotBands.splice(index, 1)
            plotBand.destroy();
        },

        /**
         * Remove all plotlines and plotbands
         * 
         * */
        clearPlotLinesAndPlotBands: function () {
            var chartManager = this;
            [].concat(chartManager.options.xAxis).concat(chartManager.options.yAxis).forEach(function (axis) {
                var chartAxis = chartManager.chart.getAxis(axis.id);
                if (chartAxis) {
                    [].concat(chartAxis.plotLinesAndBands).forEach(function (plotBand) {
                        plotBand.destroy();
                    });
                }
                axis.plotLines = [];
                axis.plotBands = [];
            });
        },


        /**
         * Redraw all plotlines and plotbands
         * 
         * */
        redrawPlotLinesAndPlotBands: function () {
            var chartManager = this;
            [].concat(chartManager.options.xAxis).concat(chartManager.options.yAxis).forEach(function (axis) {
                var chartAxis = chartManager.chart.getAxis(axis.id);
                if (chartAxis) {
                    chartAxis.plotLinesAndBands.forEach(function (plotBand) {
                        var newOptions = plotBand.options.hasOwnProperty('value') ? Highcharts.theme.plotLine : Highcharts.theme.plotBand;
                        plotBand.update(newOptions);
                    });
                }
            });
        },

        /**
         * Is the chart has plotlines or plotbands?
         * 
         * */
        hasPlotLinesOrPlotBands: function () {
            var chartManager = this;
            var result = [].concat(chartManager.options.xAxis).concat(chartManager.options.yAxis).some(function (axis) {
                var chartAxis = chartManager.chart.getAxis(axis.id);
                return chartAxis && chartAxis.plotLinesAndBands.length > 0;
            });
            return result;
        },

        /**
         * Get the first value with it's index every time period
         * 
         * @Param {object} periodOptions: The options to that specify the period value and type such as {value:1,type:'month'}
         * @Param {Number} startIndex: From where it will start? default to 0
         * */
        getPeriodStartEvery: function (periodOptions, startIndex) {
            var chartManager = this,
                series = chartManager.options.series;
            if (!series || !series.length)
                return [];
            var firstSeries = series[0];
            var xData = chartManager.chart.getSeries(firstSeries.id).xData;

            var indexes = momentUtilities.getSeparatorsIndexes(xData, {
                type: periodOptions.type,
                value: periodOptions.value,
                startIndex: startIndex
            });
            var result = indexes.map(function (index) {
                return {
                    index: index,
                    value: xData[index]
                };
            });

            return result;
        },


        /**
         * Draw vertical lines every time period
         * 
         * @Param {object} periodOptions: The options to draw the vertical lines, specify the period value and type such as {value:1,type:'month'}
         * @Param {boolean} dismissDialogs: dismiss all dialogs and draw immediately
         * */
        drawVLinesEvery: function (periodOptions, dismissDialogs) {
            var chartManager = this;
            //Store the periodOptions to redraw it after series draw
            chartManager.vLinesPeriodOptions = periodOptions;
            if (!periodOptions)
                return chartManager.clearPlotLinesAndPlotBands();
            var  startValues = chartManager.getPeriodStartEvery(periodOptions);
            startValues.forEach(function (line) {
                line.axisId = chartManager.options.xAxis[0].id
            });
            if (!startValues || !startValues.length) return;
            // if(startValues.length>)
            if (!dismissDialogs && startValues.length > 500) {
                angular.showMessage({
                    title: 'Too many lines',
                    body: 'You are about to draw ' + startValues.length + ' lines, process anyway?',
                    size: 'sm',
                    ok: function (settings, close) {
                        close();
                        chartManager.drawVLines(startValues);
                    }
                });
            } else chartManager.drawVLines(startValues);
        },

        /**
         * Draw the input vertical lines
         * 
         * @Param {Array} vLinesArray: The vertical lines array, specify the xAxis value in each item
         * */
        drawVLines: function (vLinesArray) {
            var chartManager = this;
            vLinesArray.forEach(function (line) {
                chartManager.addPlotLine(line.axisId, {
                    value: line.value,
                    color:'#E0E0E0'
                });
            });
        },



        /**
         * Show a dialog to draw a series
         * 
         * @Param {object} settings: The init settings
         * @Param {function} callback: Invoked after user click 'OK'
         * */
        showDrawSeriesDialog: function (settings, callback) {
            var chartManager = this;
            var panels = chartManager.options.yAxis;

            angular.showMessage(angular.merge({}, settings, {
                title: 'Draw chart series',
                bodyUrl: '/static_files/Templates/chart/draw-chart-message-body-template.html?lastModified=20160909T1938',
                chartTypes: ['Candlestick', 'OHLC', 'Column', 'Line', 'Area'],
                selectedChartType: 'Line',
                chartPanels: panels,
                selectedChartPanel: 0,
                size: 'sm',
                ok: function (settings, close) {
                    settings.errorText = '';
                    if (!settings.selectedChartType)
                        settings.errorText = 'Chart type missed';
                    else if (!settings.seriesName)
                        settings.errorText = 'Series name missed';
                    else if (chartManager.getSeriesByName(settings.seriesName))
                        settings.errorText = 'Series name already eixts';
                    if (settings.errorText) return;

                    var panel = panels[settings.selectedChartPanel];
                    if (!panel) {
                        panel = chartManager.getOrAddYAxis(settings.newPanelTitle || settings.seriesName);
                    }
                    settings.isBusy = true;
                    callback({
                        chartType: settings.selectedChartType,
                        chartPanel: panel,
                        seriesName: settings.seriesName
                    }, function () {
                        settings.isBusy = false;
                        if (close)
                            close.apply(undefined, arguments);
                    });
                }
            }));
        },




        /**
         * Show a dialog to remove a series
         * 
         * @Param {string} seriesId: The series id
         * @Param {boolean} removeEmptyYAxis: Should remove the empty yAxis?
         * @Param {function} callback: Invoked after user click 'OK'
         * */
        showRemoveSeriesDialog: function (seriesId, removeEmptyYAxis, callback) {
            var chartManager = this;
            if (!chartManager.chart) return;
            var targetSeries = chartManager.getSeries(seriesId);
            angular.showMessage({
                title: 'Remove series',
                body: 'Series "' + targetSeries.name + '" will be removed?',
                size: 'sm',
                ok: function (settings, close) {
                    chartManager.removeSeries(seriesId, removeEmptyYAxis);
                    close();
                    if (callback) callback();
                }
            });
        },

        /**
         * Export the series to CSV
         * 
         * */
        exportSeriesToCSV: function (series) {
            var chartManager = this;
            var xyData = {};
            for (var i = 0; i < series.length; i++) {
                var seriesId = series[i].id;
                var chartTargetSeries = chartManager.chart.getSeries(seriesId);
                chartTargetSeries.xData.forEach(function (x, index) {
                    if (!xyData[x]) xyData[x] = [];
                    xyData[x].push({
                        seriesName: series[i].name,
                        y: chartTargetSeries.yData[index]
                    });
                });
            }
            var list = [];
            Object.keys(xyData).forEach(function (x) {
                var obj = {
                    date: moment.utc(Number(x)).format('YYYYMMDD HHmm')
                };
                xyData[x].forEach(function (item) {
                    var name = item.seriesName,
                        y = item.y;
                    if (y instanceof Array) {
                        obj[name + '_Open'] = y[0];
                        obj[name + '_High'] = y[1];
                        obj[name + '_Low'] = y[2];
                        obj[name + '_Close'] = y[3];
                    } else if (y != undefined) obj[name] = y;
                });
                //Only add the row if it has data
                if (Object.keys(obj).length > 1)
                    list.push(obj);
            });
            var csv = utilities.JsonToCSVConvertor(list, true);
            var title = series.map(function (s) {
                return s.name
            }).join('_');
            utilities.downloadText(title + '.csv', csv);

        },

        /**
         * Show a diloag to export the series to CSV
         * 
         * */
        showExportSeriesDialog: function () {
            var chartManager = this;
            angular.showMessage({
                title: 'Export series (CSV)',
                bodyUrl: '/static_files/Templates/chart/export-chart-series-template.html?lastModified=20160909T1938',
                //  size: 'lg',
                series: chartManager.options.series,
                ok: function (settings, close) {
                    var selectedSeries = settings.series.filter(function (s) {
                        return s.selected;
                    });
                    if (selectedSeries.length == 0) settings.alertMessage = 'Please select at least one series!';
                    else {
                        chartManager.exportSeriesToCSV(selectedSeries);
                        close();
                    }
                }
            });
        },

        /**
         * Show a diloag to import the series from CSV
         * 
         * */
        showImportSeriesDialog: function (callback) {
            var chartManager = this,
                dialog;
            var settings = {
                events:new EventManager(),
                title: 'Import series (CSV)',
                bodyUrl: '/static_files/Templates/chart/import-series-file-template.html?lastModified=20170512T0811',
                //  size: 'lg',
                hideOkButton: function () { return true; },
                okButtonText: 'Chart file!',
                filesChanged: function () {
                    settings.events.emit('filesChanged', settings.textFiles);
                    if (!settings.validateSelectedFiles()) return;
                    settings.events.emit('filesValidated', settings.textFiles);
                    //Allow the UI refreshing before start processing the data
                    setTimeout(function () {
                        if (!settings.convertFilesData()) return;
                        settings.events.emit('filesLoaded', settings.seriesArray);
                    }, 100);
                },
                //Draw the csv content after user selects a file
                drawAfterFilesSelected: function () {
                    settings.events.once('filesLoaded', function () { settings.drawSelectedFiles(); });
                },
                //Draw the csv content after user selects a file
                drawSelectedFiles: function () {
                    settings.seriesArray.forEach(function (seriesData) {
                        chartManager.addSeriesFromDictionary(seriesData, 'line');
                    });
                    chartManager.chart.resizeYAxis();
                    dialog.dismiss();
                },
                //Make sure the csv files looks right
                validateSelectedFiles: function () {
                    var textFiles = settings.textFiles;
                    var error = undefined;
                    if (!textFiles || !textFiles.length)
                        error = 'Please select a file';
                    else {
                        var csvFiles = textFiles.filter(function (file) { return file.name.toLowerCase().endsWith('.csv') });
                        if (csvFiles.length != textFiles.length)
                            error= 'File must be ".csv" or ".CSV" extension to be uploaded (for security)';
                    }
                    settings.setError(error);
                    return !error;
                },
                //Read the selected files and convert them to JSON object
                convertFilesData: function () {
                    try {
                        settings.setError('');
                        var textFiles = settings.textFiles;
                        //Map each file to it's series
                        var seriesArray = settings.seriesArray = [];
                        textFiles.forEach(function (file) {

                            var seriesData = chartSeriesUtilities.parseSereisFromCsv(file.content);
                            var seriesName = file.name.replace('.csv', '');
                            var keys = Object.keys(seriesData);
                            //If only one series exists in the csv file then consider the file.name as a series name
                            if (keys.length == 1) {
                                var data = seriesData[keys[0]];
                                seriesData = {};
                                seriesData[seriesName] = data;
                            }
                            seriesArray.push(seriesData);
                        });
                        return true;
                    } catch (err) {
                        settings.setStatus('');
                        settings.setError('Could not load your data to a chart, please check your file to be sure the data is in the correct format.');
                        return false;
                    }
                },
                setError: function (error) {
                    settings.errorText = error;
                    chartManager.applyUI();
                },
                setStatus: function (status) {
                    settings.statusText = status;
                    chartManager.applyUI();
                },
                cancel: function () { settings.events.emit('dismiss'); }
            };
            dialog = angular.showMessage(settings);
            return settings;
        },
        /**
         * Draw drawAnnotationsByHand 
         * 
         * */
        drawAnnotationByHand: function (options, callback) {
            var chartManager = this;
            options.created = function (anno) {
                if (anno.menu) anno.menu.jqxMenu('destroy');
                $(anno.shape.element).contextMenu(anno_contextMenuTemplate, function (menu) {
                    anno.menu = menu;
                    menu.on('itemclick', function (e) {
                        var id = e.args.id;
                        if (id == 'deleteItem') anno.destroy();
                        else if (id == 'editItem') chartManager.showAnnotationEditDialog(anno);
                        chartManager.applyUI();
                    });
                });

                $(anno.shape.element).jqxTooltip({
                    content: 'Double click to edit the annotation',
                    position: 'mouse',
                    name: 'movieTooltip'
                });

            }
            chartManager.chart.drawAnnotationByHand(options, function (anno) {
                anno.on('click', function (e) {
                    if (!chartManager.lastClickedTime || (e.timeStamp - chartManager.lastClickedTime) > 300) chartManager.lastClickedTime = e.timeStamp;
                    else chartManager.showAnnotationEditDialog(anno);
                });
                chartManager.applyUI();
                if (callback) callback(anno);
            });
        },


        /**
         * Show a diloag to edit the Annotation
         * 
         * */
        showAnnotationEditDialog: function (anno) {
            var chartManager = this;
            angular.showMessage({
                title: 'Edit Annotation',
                bodyUrl: '/static_files/Templates/chart/edit-annotation-template.html?lastModified=20160909T1938',
                //  size: 'lg',
                options: anno.options,
                movableHorizontally: anno.options.movableHorizontally,
                movableVertically: anno.options.movableVertically,
                draggableX: anno.options.draggableX,
                draggableY: anno.options.draggableY,
                ok: function (settings, close) {
                    anno.options.movableHorizontally = settings.movableHorizontally;
                    anno.options.movableVertically = settings.movableVertically;
                    anno.options.draggableX = settings.draggableX;
                    anno.options.draggableY = settings.draggableY;
                    anno.render();
                    close();
                },
                deleteAnnotation: function () {
                    anno.destroy();
                }
            });

        },


        /**
         * Clear Annotations 
         * 
         * */
        clearAnnotations: function () {
            var chartManager = this;
            var array = [].concat(chartManager.chart.options.annotations || []);
            array.forEach(function (a) {
                a.destroy();
            });
        },

        /**
         * Clear Annotations 
         * 
         * */
        clearAnnotationsDialog: function () {
            var chartManager = this;
            angular.showMessage({
                title: 'Clear Annotations',
                body: 'All Annotations will be remove, ok?',
                ok: function (settings, close) {
                    chartManager.clearAnnotations();
                    close();
                }
            });
        },
        /**
         * Gets the div that's contains the chart control
         * 
         * */
        getChartDiv: function () {
            var chartManager = this,
                container = $(chartManager.chart.container);
            while (!container.hasClass('chart-div'))
                container = container.parent();
            return container;
        },
        /**
         * Make the chart full screen
         * 
         * */
        fullScreen: function () {
            var chartManager = this,
                chartDiv = chartManager.getChartDiv();
            chartManager.exitFullScreen();
            chartManager.originalParentDiv_fullScreen = chartDiv.parent();
            chartManager.isFullScreen = true;
            chartManager.reflow(500);
            $('body').prepend(chartDiv);
            chartDiv.addClass('all-content-container top-most');
        },
        /**
         * Exit the chart full screen
         * 
         * */
        exitFullScreen: function () {
            var chartManager = this;
            if (!chartManager.isFullScreen) return;

            var chartDiv = chartManager.getChartDiv();
            chartManager.originalParentDiv_fullScreen.prepend(chartDiv);
            chartManager.originalParentDiv_fullScreen = undefined;
            chartManager.isFullScreen = false;
            chartDiv.removeClass('all-content-container top-most');
        },
        /**
         * Show a loading flag to the chart
         * 
         * */
        showLoading: function () {
           this.chart.showLoading();
        },
        /**
         * Hide the loading flag from the chart
         * 
         * */
        hideLoading: function () {
            this.chart.hideLoading();
        }
    });


})(this)
