//plugin for extending the highstock by add useful methods
(function (Highcharts) {
    
    var H = Highcharts,
        Chart = H.Chart,
        extend = H.extend,
        merge = H.merge,
        each = H.each;
    
    
    // when drawing annotation, don't zoom/select place
    H.wrap(H.Pointer.prototype, 'drag', function (c, e) {
        if (!this.chart.preventDrag) {
            c.call(this, e);
        }
    });
    
    
    // deselect active annotation
    H.wrap(H.Pointer.prototype, 'onContainerMouseDown', function (c, e) {
        c.call(this, e);

    });
    
    
    //Over-ride the corss-hair hide function, to keep cross-hair always visible
    //Highcharts.Axis.prototype.hideCrosshair = function () { }
    //Over-ride the tooltip hide function, to keep tooltip always visible
    //Highcharts.Tooltip.prototype.hide = function () { };
    //Over-ride the tooltip hide function, to keep tooltip always visible
    Chart.prototype.showResetZoom = function () { };
    //override this method to prevent the error after destroying the copy chart variable
    Chart.prototype.getSVG = function () {
        return this.sanitizeSVG(this.container.innerHTML);
    };
    //Add support for update method
    Highcharts.PlotLineOrBand.prototype.update = function (newOptions) {
        var plotBand = this;
        Highcharts.merge(true, plotBand.options, newOptions);
        if (plotBand.svgElem) {
            plotBand.svgElem.destroy();
            plotBand.svgElem = undefined;
            plotBand.render();
        }
        if (plotBand.label) {
            plotBand.label.destroy();
            plotBand.label = undefined;
            plotBand.render();
        }
        if (plotBand.created) plotBand.created();
    }
    
    /**
     * Find the indexes in an array using the filterFunction
     * 
     * @Param {Array} array: The input array
     * @param {function} filterFunction: The filter function that will be called for each item, should return True/False
     * 
     * */
    Highcharts.findIndexs = function (array,filterFunction) {
        var indexes = [];
        array.filter(function (item, index) {
            if (filterFunction(item, index)) indexes.push(index);
        });
        return indexes;
    };

    //Store the refrence to functions
    var showLoading = Highcharts.Chart.prototype.showLoading;
    var hideLoading = Highcharts.Chart.prototype.hideLoading;

    //add on and emit functions to Chart objects
    extend(Chart.prototype, new EventManager());
    extend(Chart.prototype, {
        /**
         * Gets the user options object
         * 
         * */
        getUsersOptions: function () {
            var chart = this;
            return chart.userOptions;
        },
        /**
         * Gets the axis that contain this postion
         * 
         * */
        getAxisInPostion: function (axisType, yPostion) {
            var chart = this;
            var axisList = axisType == 'x' ? chart.xAxis : chart.yAxis;
            return axisList.filter(function (axis) {
                return axis.visible&& axis.pos <= yPostion && (axis.pos + axis.height) >= yPostion;
            })[0];
        },
        /**
         * Change the cursor of the chart's container
         * 
         * */
        changeCursor: function (newCursor) {
            var chart = this;
            chart.container.style.cursor = newCursor;
        },
        /**
         * Find the xAxis,yAxis and the xy values in a specific pixel
         * 
         * */
        pixelToPoint: function (e) {
            var chart = this;
            e = chart.pointer.normalize(e);
            
            if (!chart.isInsideChart(e.chartX, e.chartY)) {
                return;
            }
            
            var xAxis = chart.getAxisInPostion('x', e.chartY),
                yAxis = chart.getAxisInPostion('y', e.chartY);
            if (!xAxis || !yAxis ) return;
            var point = {
                xValue: xAxis.toValue(e.chartX),
                yValue: yAxis.toValue(e.chartY),
                chartX: e.chartX,
                chartY: e.chartY
            };
            return {
                yAxis: yAxis,
                xAxis: xAxis,
                point: point
            };
        },
        /**
         * Find the pixel coordinate using xValue
         * 
         * */
        xValueToPixels: function (seriesId, xValue, paneCoordinates) {
            var chart = this,
                series = chart.getSeries(seriesId),
                xAxis = series.xAxis;

            return xAxis.toPixels(xValue, paneCoordinates);
        },
        /**
         * Find the pixel coordinate using  yValue
         * 
         * */
        yValueToPixels: function (seriesId, yValue, paneCoordinates) {
            var chart = this,
                series = chart.getSeries(seriesId),
                yAxis = series.yAxis;

            return yAxis.toPixels(yValue, paneCoordinates);
        },
        //Calculate the selected range (type and count)
        getSelectedRange: function () {
            var chart = this;
            var selectedIndex = chart.rangeSelector.selected,
                selectedButton = chart.rangeSelector.buttonOptions[selectedIndex];
            if (selectedButton) {
                chart.lastSelectedRange = {
                    type: selectedButton.type,
                    count: selectedButton.count
                }
            }
            return chart.lastSelectedRange;
        },
        //Sets the selected range by clicking the button
        setSelectedRange: function (rangeButtonIndex) {
            var chart = this;
            chart.rangeSelector.clickButton(rangeButtonIndex, true)
        },
        /**
         * Disable/Enable the default drag
         * 
         * */
        disableDefaultDrag: function (value) {
            var chart = this;
            chart.preventDrag = value;
            chart.disableTooltip = value;
            if (!chart._disableDefaultDrag_options) {
                chart._disableDefaultDrag_options = {
                    panning: chart.options.chart.panning,
                    pinchHor: chart.pointer.pinchHor,
                    pinchVert: chart.pointer.pinchVert
                };
            }
            if (value) {
                chart.options.chart.panning = chart.pointer.pinchHor = chart.pointer.pinchVert = false;
                if (chart.tooltip) chart.tooltip.hide();
            } else {
                chart.options.chart.panning = chart._disableDefaultDrag_options.panning;
                chart.pointer.pinchHor = chart._disableDefaultDrag_options.pinchHor;
                chart.pointer.pinchVert = chart._disableDefaultDrag_options.pinchVert;
            }
        },
        /**
         * Add a drag and move and drop events
         * 
         * @Param {function} dragFunction: Invoked when drag started (by mousedown or touchstart)
         * @Param {function} moveFunction: Invoked after drag and on move event (by mousemove or touchmove)
         * @Param {function} dropFunction: Invoked after drag and move events (by mouseup or touchend)
         * @Param {boolean} keepDraggingAfterMouseUp: Should keep dragging after mouse up event?
         * */
        dragMoveDrop: function (element, dragFunction, moveFunction, dropFunction, keepDraggingAfterMouseUp) {
            var chart = this;
            return createDragMoveDropFunctions(element, chart, dragFunction, moveFunction, dropFunction, keepDraggingAfterMouseUp);
        },
        /**
         * Gets the chart axis object by id
         * 
         * @Param {string or number} axisId: the axis id or index
         * @Param {string} type: the axis type, x or y
         * */
        getAxis: function (axisId, type) {
            var axis;
            if (axisId instanceof Highcharts.Axis) {
                if (!type) axis = axisId;
                else if (type == 'x' && axisId.isXAxis) axis = axisId;
                else if (type == 'y' && !axisId.isXAxis) axis = axisId;
            } else {
                if (!type || type == 'x') axis = this.xAxis[axisId] || findAxisById(this.xAxis, axisId);
                if (!type || type == 'y') axis = axis || this.yAxis[axisId] || findAxisById(this.yAxis, axisId);
            }
            return axis;
        },
        /**
         * Gets the chart axis options by id
         * 
         * @Param {string } yAxisId: the yaxis id
         * */
        getYAxisOptions: function (yAxisId) {
            var chart = this,
                userOptions = chart.getUsersOptions(),
                targetYAxis = userOptions.yAxis.filter(function (yAxis) {
                    return yAxis.id == yAxisId;
                })[0];
            return targetYAxis;
        },
        /**
         * Gets the chart series object by id
         * 
         * @Param {string or number} seriesId: the series id or index
         * */
        getSeries: function (seriesId) {
            var chart = this,
                series;
            if (typeof (seriesId) == 'number') {
                series = chart.series[seriesId];
            }
            else if (seriesId instanceof Highcharts.Series) {
                series = seriesId;
            } else {
                series = chart.series.filter(function (s) {
                    return s.options.id == seriesId;
                })[0];
            }
            return series;
        },
        /**
         * Check if the point inside the chart
         * 
         * */
        isInsideChart: function (x, y) {
            return this.isInsidePlot(x - this.plotLeft, y - this.plotTop);
        },
        /**
         * Gets the series of state = 'hover'
         * 
         * */
        getHoverSeries: function () {
            return this.series.filter(function (s) {
                return s.state == 'hover';
            })[0];
        },
        /**
         * Draw a right border for all yAxis
         * 
         * */
        drawYAxisRightBorders: function () {
            var chart = this;
            if (chart.rightBorders) {
                chart.rightBorders.forEach(function (border) {
                    border.destroy();
                });
            }
            chart.rightBorders = [];
            H.each(chart.yAxis, function (yAxis, i) {
                var x = yAxis.left + yAxis.width;
                var y = yAxis.top;
                var height = y + yAxis.height;
                
                var border = chart.renderer.path(['M', x, y, 'L', x, height])
                    .attr({
                    'stroke-width': H.theme.yAxis.lineWidth,
                    stroke: H.theme.yAxis.lineColor
                }).add();
                chart.rightBorders.push(border);
            });

        },
        /**
         * Move the series to a new yAxis
         * 
         * */
        moveSeries: function (series, newYAxis) {
            var chart = this,
                userOptions = chart.getUsersOptions(),
                series = chart.getSeries(series),
                seriesId = series.options.id,
                newYAxis = chart.getAxis(newYAxis,'y');
            series.update({
                yAxis: newYAxis.options.id
            });
            var seriesFromOptions=userOptions.series.filter(function (s) { return s.id == seriesId; })[0];
            seriesFromOptions.yAxis = series.options.yAxis;
            
            
            chart.emit('seriesMoved', series);
        },        
        
        /**
         * Gets the added by user axis
         * 
         * */
        userYAxis: function () {
            var chart = this;
            //find only user's axis
            var axisArray = chart.yAxis.filter(function (axis) {
                return axis.options.id !== 'navigator-y-axis' && axis.options.id !== 'empty-y-axis';
            });
            return axisArray;
        },
        /**
         *Checks if this series name is a user defiend series
         * 
         * */
        isUserSeries: function (series) {
            var id = '';
            if (series instanceof Highcharts.Series)
                id = series.options.id;
            else if (typeof (series) == 'object')
                id = series.id;
            else id = series;
            return id !== 'highcharts-navigator-series';
        },
        /**
         * Group the yaxis according to display index, return array of yaxis
         * 
         * */
        getSortedYAxis: function (keebKeys) {
            var chart = this,
                userOptions = chart.getUsersOptions(),
                list = chart.userYAxis(),
                temp = {},
                result = [];
            list.forEach(function (x) {
                var yAxisOptions = chart.getYAxisOptions(x.options.id),
                    displayIndex = chart.getYAxisDisplayIndex(x.options.id);

                if (!temp[displayIndex])
                    temp[displayIndex] = [];
                temp[displayIndex].push(yAxisOptions);
            });
            if (keebKeys) return temp;
            Object.keys(temp).sort().
                forEach(function (x) { result.push(temp[x]); });
            return result;
        },
        /**
         * Updates the yAxis from the chart's options
         * 
         * @Param {string} yAxisId: The yAxis id (see highstock docs)
         * @Param {boolean} redraw: Redraw the chart ?
         * */
        refreshYAxis: function (yAxisId, redraw) {
            var chart = this,
                chartAxis = chart.getAxis(yAxisId, 'y');
            if (!chartAxis) return;
            yAxisOptions = chart.getYAxisOptions(chartAxis.options.id);
            if (chartAxis && yAxisOptions) {
                chartAxis.update(yAxisOptions, redraw);
            }
        },
        /**
         * Remove the yAxis from the chart with all it's series
         * 
         * @Param {string} yAxisId: The yAxis id (see highstock docs)
         * @Param {boolean} removeSeries: Should remove all sereis
         * */
        removeYAxis: function (yAxisId,removeSeries) {
            var chart = this,
                userOptions = chart.getUsersOptions(),
                chartAxis = chart.getAxis(yAxisId, 'y');
            if (!chartAxis) return;
            yAxisId = chartAxis.options.id;
            //clear plotlines and plotbands before remove last panel
            if (chart.yAxis.length == 1)
                chart.clearPlotLinesAndPlotBands();
            chartAxis.series.forEach(function (series) { series.remove(); });
            chartAxis.remove();
            chart.emit('yAxisRemoved', yAxisId,true);
        },
        /**
         * Remove all plotlines and plotbands
         * 
         * */
        clearPlotLinesAndPlotBands: function () {
            var chart = this;
            [].concat(chart.xAxis).concat(chart.yAxis).forEach(function (chartAxis) {
                if (chartAxis.plotLinesAndBands) {
                    [].concat(chartAxis.plotLinesAndBands).forEach(function (plotBand) {
                        plotBand.destroy();
                    });
                }
            });
        },

        /**
         * Fix the yAxis size after add/remove new axis and return the new ratios
         * 
         * @param {string} fixedYAxisId: The yAxis id that will not changed, other axis will changed to fill the remain area
         * */
        fixYAxisSize: function (fixedYAxisId) {
            if (fixedYAxisId !== 0 && !fixedYAxisId)
                fixedYAxisId = [];
            if (!Array.isArray(fixedYAxisId))
                fixedYAxisId = [fixedYAxisId];

            var chart = this,
                sortedYAxis = chart.getSortedYAxis();
            
            var ratios = sortedYAxis.map(function (yAxis) {
                return yAxis[0].sizeRatio;
            });
            var fixedYAxisIndex = Highcharts.findIndexs(sortedYAxis, function (yAxis) {
                return yAxis.some(function (x) { return fixedYAxisId.indexOf(x.id) >= 0; });
            });
            var newRatios = Highcharts.fn.fixRatiosPercent(ratios, fixedYAxisIndex);
            sortedYAxis.forEach(function (yAxis, index) {
                yAxis.forEach(function (x) { x.sizeRatio = newRatios[index]; });
            });
            return newRatios;
        },
        /**
         * Resize all other yAxis using the percent ratios
         * 
         * @param {string} fixedYAxisId: The yAxis id that will not change, other axis will changed to fill the remain area
         * */
        resizeOtherYAxis: function (fixedYAxisId) {
            var chart = this;
           return chart.resizeYAxis(chart.fixYAxisSize(fixedYAxisId));
        },
         /**
         * Change the size of the axis
         * 
         * @param {string} yAxisId: The yAxis id that will change, other axis will change to fill the remain area
         * @param {number} sizeRatio: The new ratio of the axis
         * @param {string} fixedYAxisId: The yAxis id that will not change, other axis will changed to fill the remain area
         * */
        setYAxisSize: function (yAxisId, sizeRatio, fixedYAxisId) {
            var chart = this,
                sortedYAxis = chart.getSortedYAxis();

            sortedYAxis.forEach(function (yAxis) {
                var t = yAxis.some(function (x) { return x.id == yAxisId; });
                if (!t) return;
                yAxis.forEach(function (x) { x.sizeRatio = sizeRatio; });
            });
            fixedYAxisId = fixedYAxisId || [];
            if (fixedYAxisId.indexOf(yAxisId) == -1) fixedYAxisId.push(yAxisId);
            chart.resizeOtherYAxis(fixedYAxisId);
        },
        /**
         * Resize all yAxis using the percent ratios
         * 
         * @Param {array} ratios: The ratios array, example: [20,50,30]
         * */
        resizeYAxis: function (ratios) {
            var chart = this,
                sortedYAxis = chart.getSortedYAxis(),
                userOptions = chart.getUsersOptions(),
                //how much should leave between axis
                spaceBetweenAxis = (12 / chart.containerHeight) * 100;
            
            ratios = ratios || [];
            spaceBetweenAxis = spaceBetweenAxis || 3;
            //store the ratio in axis
            sortedYAxis.forEach(function (yAxis, index) {
                yAxis.forEach(function (x) { x.sizeRatio = ratios[index]; });
            });
            ratios = chart.fixYAxisSize();
            
            var tops = [0],
                heights = ratios.map(function (h) {
                    return h - (spaceBetweenAxis / 2);
                });
            //subtract the spaceBetweenAxis from ratios array
            for (var i = 1; i < ratios.length; i++) {
                tops.push(tops[i - 1] + heights[i - 1] + spaceBetweenAxis);
            }
            //try to fill the entire top space
            heights[0] += (15 / chart.containerHeight) * 100;
            for (var i = 0; i < ratios.length; i++) {
                tops[i] = tops[i] + '%';
                heights[i] = heights[i] + '%';
            }
            tops[0] = 35;
           
            //strat updating the axis
            for (var i = 0; i < ratios.length; i++) {
                sortedYAxis[i].forEach(function (x, index) {
                    x.top = tops[i];
                    x.height = heights[i];
                    x.offset = 50 * index;
                });
            }
            //refresh the UI
            userOptions.yAxis.forEach(function (yAxis) {
                chart.refreshYAxis(yAxis.id, false);
            });
            chart.redraw();
            chart.emit('yAxisResized');
        },
        /***
        * Gets the displayIndex of the yAxis
        * 
        * @Param {string} yAxisId: The yAxis id (see highstock docs)
        * */
        getYAxisDisplayIndex: function (yAxisId) {
            var chart = this,
                userOptions = chart.getUsersOptions(),
                targetYAxis = chart.getYAxisOptions(yAxisId);

            var displayIndex = targetYAxis.displayIndex;

            if (!Number.isFinite(displayIndex))
                displayIndex = userOptions.yAxis.indexOf(targetYAxis);

            return displayIndex;
        },
        /***
        * Reset the displayIndex of the yAxis
        * 
        * */
        applyYAxisDisplayIndex: function (redraw) {
            var chart = this;

            //Reset displayIndex
            chart.getSortedYAxis().forEach(function (yAxis, i) {
                yAxis.forEach(function (y) { y.displayIndex = i; });
            });
            if (redraw) chart.resizeOtherYAxis();
        },
         /***
        * Gets the displayIndex of the yAxis
        * 
        * @Param {string} yAxisId: The yAxis id (see highstock docs)
        * @Param {number} shiftValue: +1 to shift up, -1 to shift down
        * */
        shiftYAxisDisplayIndex: function (yAxisId, shiftValue) {
            if (!this.canShiftYAxisDisplayIndex(yAxisId, shiftValue))
                return false;

            var chart = this,
                targetYAxis = chart.getYAxisOptions(yAxisId);
                
            targetYAxis.displayIndex = chart.getYAxisDisplayIndex(yAxisId) + shiftValue;
            chart.applyYAxisDisplayIndex(true);
            return true;
        },
        /***
        * Check if the yAxis can be shifted
        * 
        * @Param {string} yAxisId: The yAxis id (see highstock docs)
        * @Param {number} shiftValue: +1 to shift up, -1 to shift down
        * */
        canShiftYAxisDisplayIndex: function (yAxisId, shiftValue) {
            this.applyYAxisDisplayIndex();
            var chart = this,
                targetYAxis = chart.getYAxisOptions(yAxisId),
                displayIndex = chart.getYAxisDisplayIndex(yAxisId);

            var sortedAxis1 = chart.getSortedYAxis();//store the sort before
            targetYAxis.displayIndex = displayIndex + shiftValue;
            var sortedAxis2 = chart.getSortedYAxis();

            //reset the displayIndex
            targetYAxis.displayIndex = displayIndex;

            //If nothing changed then return false
            return !angular.equals(sortedAxis1, sortedAxis2);
        },
        /**
         *hide the internal grid lines for the first and last panels
         *Make the internal grid line for panel 1 fit
         */
        hideInternalGridLines: function () {
            var chart = this,
                chartAxis = chart.yAxis;
            for (var i = 0; i < chartAxis.length; i++) {
                $.each(chartAxis[i].ticks, function (index, line) {
                    if (!line || !line.gridLine || !line.gridLine.element || !line.gridLine.element.style) return;
                    var isBorder = line.isFirst || line.isLast;
                    if (chartAxis[i].options.hideGridLines && !isBorder && line.pos != 0)
                        line.gridLine.hide();
                    //makes the inner line about 40% wider
                    else line.gridLine.element.style['stroke-width'] = Highcharts.theme.yAxis.gridLineWidth * (isBorder ? 1 : 0.4);
                    
                    if (line.label && line.label.xy && line.label.xy.y < chartAxis[i].pos)
                        line.label.element.style.display = 'none'
                });
            }
        },
        /**
         *Sets the xAxis extremes
         */
        setExtremes: function (newMin, newMax) {
            var chart = this,
                xAxis = chart.xAxis[0];
            xAxis.setExtremes(newMin, newMax);
        },
        /**
         *Shift the xAxis extremes
         */
        shiftExtremes: function (pointsCount) {
            var chart = this,
                firstSeries = chart.series[0];
            //In case no series then return
            if (!firstSeries) return;
            var xData = firstSeries.xData;
            if (!xData || !xData.length) return;
            var xAxis = chart.xAxis[0],
                extrems = xAxis.getExtremes(),
                min = extrems.min,
                max = extrems.max,
                dataMin = extrems.dataMin,
                dataMax = extrems.dataMax,
                closestPointRange = xAxis.closestPointRange,
                newMin = min + pointsCount * closestPointRange,
                newMax = max + pointsCount * closestPointRange;
            if (newMin >= dataMin && newMax <= dataMax)
                xAxis.setExtremes(newMin, newMax);
        },
        /**
         * Gets the first visible time
         * 
         * */
        getStartTime: function () {
            return this.xAxis[0].getExtremes().min
        },
        /**
         * Gets the last visible time
         * 
         * */
        getEndTime: function () {
            return this.xAxis[0].getExtremes().max
        },
        /**
         * Gets the current range
         * 
         * */
        getRange: function () {
            return this.xAxis[0].range
        },
        /**
         * Check if the wlement has highchart event
         * 
         * */
        hasEvent: function (element,eventType,fn) {
            if (!element.hcEvents|| !element.hcEvents[eventType])
                return;
            return element.hcEvents[eventType].some(function (a) { return a == fn }).length > 0;
        },
        /**
         * Show a loading flag to the chart
         * 
         * */
        showLoading: function () {
            var chart = this;
            showLoading.call(chart);
            if (chart.xAxis[0].oldMax)
                chart.xAxis[0].update({ labels: { enabled: false } });
            if (!chart.showLoadingCount)
                chart.showLoadingCount = 1;
            else chart.showLoadingCount++;
        },
        /**
         * Hide the loading flag from the chart
         * 
         * */
        hideLoading: function () {
            var chart = this;
            if (!chart.showLoadingCount)
                chart.showLoadingCount = 0;
            else chart.showLoadingCount--;
            if (chart.showLoadingCount <= 0) {
                hideLoading.call(chart);
                chart.xAxis[0].update({ labels: { enabled: true } });
            }
        },
        /**
         * Gets the series that use lazy loading for it's data
         * 
         * */
        getLazyLoadingSeries: function () {
            var chart = this;
            var series = chart.series.filter(function (series) { return series.lazyLoading; });
            return series;
        }
        
    });
    
    
    
    //extend the fn utilties
    Highcharts.fn = {
        /**
         * Fix the input ratios array by returning a new array that distribute the 100% ratios
         * 
         * @Param {Array} ratios: The ratios array, for example [10,20,30,30]
         * @param {number} fixedRatioIndex: The fixed ratio that will not changed, other ratios will changed to fill the remain area
         * @param {number} ratiosItemsCount: How many ratios count should be returned, leave null 
         * 
         * @Example: if the ratios = [10,20,30,30] and the fixedRatioIndex = 2, then the output will be [13.3,23.3,30,33.3]
         *           Because the '30' is fixed, we distribute the remain '10%' to the remain three ratios, each one add 3.3%
         * */
        fixRatiosPercent: function (ratios, fixedRatioIndex, ratiosItemsCount) {
            if (Number.isFinite(ratiosItemsCount)) {
                ratios.length = ratiosItemsCount;
            }
            if (fixedRatioIndex !== 0 && !fixedRatioIndex)
                fixedRatioIndex = [];
            if (!Array.isArray(fixedRatioIndex))
                fixedRatioIndex = [fixedRatioIndex];
            //Make sure all ratios are numbers
            for (var i = 0; i < ratios.length; i++) {
                if (!ratios[i]) ratios[i] = 0;
                ratios[i] = Number(ratios[i]);
                if (!Number.isFinite(ratios[i])) ratios[i] = 0;
            }
            
            var effectedItemsCount = ratios.length - fixedRatioIndex.length;
            if (effectedItemsCount > 0) {
                var totalPercent = 0;
                for (var i = 0; i < ratios.length; i++) {
                    totalPercent += ratios[i];
                }
                var shouldAdded = (100 - totalPercent) / effectedItemsCount;
                for (var i = 0; i < ratios.length; i++) {
                    if (fixedRatioIndex.indexOf(i)<0) ratios[i] += shouldAdded;
                }
            }
            return ratios;

        },
        /**
         * find the center point between two points
         * 
         * */
        calculateCenterPoint: function (x1, y1, x2, y2) {
            var x = (x1 + x2) / 2;
            var y = (y1 + y2) / 2;
            return [x, y];
        },
        /**
         * find the distance point between two points
         * 
         * */
        calculateDistance: function (x1, y1, x2, y2) {
            var part1 = Math.pow(x2 - x1, 2);
            var part2 = Math.pow(y2 - y1, 2);
            var distance = Math.sqrt(part1 + part2);
            return distance;
        }
    }

    extend(Highcharts.Series.prototype, {
        /**
         * Checks if the points has a not null values
         * 
         * */
        hasValuesInRange: function (startDate, endDate,valuesCount) {
            var points = this.options.data,
                length = points.length;
            for (var i = 0; i < length; i++) {
                if (points[i].x <= startDate) continue;
                if (points[i].x >= endDate) break;
                if (Number.isFinite(points[i].y))
                    valuesCount--;
                if (valuesCount <= 0)
                    break;
            }
            return valuesCount <= 0;
        }
    });
    
    function findAxisById(array, id) {
        return array.filter(function (axis) {
            return axis.options.id == id
        })[0];
    }
    
    function createDragMoveDropFunctions(element, chart, dragFunction, moveFunction, dropFunction, keepDraggingAfterMouseUp) {
        
        Highcharts.addEvent(element, 'mousedown', drag);
        Highcharts.addEvent(element, 'touchstart', drag);
        
        
        
        /**
         * Drag on mousedown
         * 
         * */
        function drag(e) {
            e.stopPropagation();
            if (e.button) return;
            chart.isDragging = true;
            chart.disableDefaultDrag(true);
            Highcharts.addEvent(document, 'mouseup', drop);
            Highcharts.addEvent(document, 'touchend', drop);
          //  setTimeout(function () {
                Highcharts.addEvent(document, 'mousemove', move);
                Highcharts.addEvent(document, 'touchmove', move);
          //  }, 1);
            if (dragFunction) dragFunction(e);
        }        ;
        
        
        
        /**
         * drop on mouseup
         * 
         * */
        function drop(e) {
            e.stopPropagation();
            chart.isDragging = false;
            chart.disableDefaultDrag(false);
            Highcharts.removeEvent(document, 'mousemove', move);
            Highcharts.removeEvent(document, 'touchmove', move);
            Highcharts.removeEvent(document, 'mouseup', drop);
            Highcharts.removeEvent(document, 'touchend', drop);
            
            if (!keepDraggingAfterMouseUp) {
                Highcharts.removeEvent(element, 'mousedown', drag);
                Highcharts.removeEvent(element, 'touchstart', drag);
            }
            if (dropFunction) dropFunction(e);
        }        ;
        
        /**
         * drop on mouseup
         * 
         * */
        function move(e) {
            e.stopPropagation();
            //in case the mouse up unbinded then cancel the mouse move
            //if (!chart.hasEvent(document, 'mouseup', drop) || !chart.hasEvent(document, 'touchend', drop)) {
            //   return drop(e);
            //}
            if (moveFunction) moveFunction(e);
        }
        
        return {
            cancel: function () {
                Highcharts.removeEvent(element, 'mousedown', drag);
                Highcharts.removeEvent(element, 'touchstart', drag);
                Highcharts.removeEvent(document, 'mousemove', move);
                Highcharts.removeEvent(document, 'touchmove', move);
                Highcharts.removeEvent(document, 'mouseup', drop);
                Highcharts.removeEvent(document, 'touchend', drop);
            }
        }

    }
    
    
    
    /**
     * initialize the plugin
     * 
     * */
    Chart.prototype.callbacks.push(function (chart) {
        var toolTipMoveFuncion = Highcharts.Tooltip.prototype.move;
        Highcharts.Tooltip.prototype.move = function () {
            if (chart.disableTooltip || chart.shouldHideTooltip)
                return chart.tooltip.hide();
            var args = [];
            for (var i = 0; i < arguments.length; i++)
                args.push(arguments[i]);
            toolTipMoveFuncion.apply(this, args)
        }
        //Add this axis to make sure the chart will have at least one yAxis
        chart.addAxis({ id: 'empty-y-axis', visible: false,height:0,top:-150 });
    });

})(Highcharts);