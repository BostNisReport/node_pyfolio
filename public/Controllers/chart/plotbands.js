//plugin for supporting the plotbands drawing
(function (Highcharts) {
    
    var H = Highcharts,
        Chart = H.Chart,
        extend = H.extend,
        merge = H.merge,
        each = H.each;
    
    /**
     * initialize the plugin
     * 
     * */
    Chart.prototype.callbacks.push(function (chart) {
        
        var isVertical;
        var startPoint, endPoint;
        var plotBandObject, plotBandCallback, plotBandOptions;
        
        
        /**
         * Draw plotband by mouse
         * 
         * @Param {object} options: The plotBand options
         * @Param {string} direction: Draw on 'x' or 'y' axis?
         * @Param {function} callback: Called after drawing finished
         * */
        chart.drawPlotBandByHand = function (options, direction, callback) {
            isVertical = direction == 'y';
            plotBandCallback = callback;
            plotBandOptions = options;
            chart.changeCursor('crosshair');
            chart.dragMoveDrop(chart.container,drag, move, drop);
        }
        
        /**
         * Drag on mousedown
         * 
         * */
        function drag(e) {
            startPoint = chart.pixelToPoint(e);
        }        ;
        
        
        
        /**
         * drop on mouseup
         * 
         * */
        function drop(e) {
            
            chart.changeCursor('default');
            if (plotBandObject) {
                var obj = plotBandObject;
                plotBandObject = undefined;
                if (plotBandCallback) {
                    plotBandCallback(obj);
                }
            }
        }        ;
        
        /**
         * drop on mouseup
         * 
         * */
        function move(e) {
            drawPlotBand(e);
        }        ;
        
        
        /**
         * drop on mouseup
         * 
         * */
        function drawPlotBand(e) {
            if (plotBandObject) {
                plotBandObject.destroy();
                plotBandObject = undefined;
            }
            endPoint = chart.pixelToPoint(e);
            if (!startPoint || !endPoint || startPoint.yAxis != endPoint.yAxis) return;
            
            var axis = isVertical ? startPoint.yAxis : startPoint.xAxis;
            
            var options = Highcharts.merge({
                events: plotBandEvents
            }, chart.options.plotBand);
            
            if (isVertical) Highcharts.merge(true, options, {
                from: startPoint.point.yValue,
                to: endPoint.point.yValue
            });
            else Highcharts.merge(true, options, {
                from: startPoint.point.xValue,
                to: endPoint.point.xValue
            });
            Highcharts.merge(true, options, plotBandOptions);
            plotBandObject = axis.addPlotBand(options);
        }        ;
        
        
        
        var plotBandEvents = {
            click: function () {
                var plotBand = this;

            },
            mouseover: function () {
                this.axis.chart.changeCursor('pointer');
            },
            mouseout: function () {
                this.axis.chart.changeCursor('default');
            }
        };



    });

})(Highcharts);