//plugin for supporting the zooming buttons
(function (Highcharts) {

    var H = Highcharts,
        Chart = H.Chart,
        extend = H.extend,
        extendClass = H.extendClass,
        merge = H.merge,
        each = H.each;


    extend(Chart.prototype, {

    });


    /**
     * initialize the plugin
     * 
     * */
    Chart.prototype.callbacks.push(function (chart) {
        var width = 16,
            height = 12,
            color = 'black',
            cursor = 'pointer';

        // Draw buttons after chart redraw
        Highcharts.addEvent(chart, 'redraw', function () {
            drawButtons();
        });
        //Draw the left and right buttons
        function drawButtons() {
            var x = chart.chartWidth * 0.5,
                y = chart.chartHeight - (chart.options.scrollbar.enabled ? 45 : 12);
            if (chart.xAxisPlusButton)
                chart.xAxisPlusButton.destroy();
            if (chart.xAxisMinusButton)
                chart.xAxisMinusButton.destroy();
            chart.xAxisMinusButton = drawZoomButton(x, y, false, function () { forwardDateMask(true); });
            chart.xAxisPlusButton = drawZoomButton(x + width + 10, y, true, function () { forwardDateMask(false); });


        }
        var insideForwardDate = false;
        function forwardDateMask(leftOrRight) {
            if (insideForwardDate) return;
            insideForwardDate = true;
            var showLoading = chart.getLazyLoadingSeries().length;
            if (showLoading) chart.showLoading();
            forwardDate(leftOrRight, function (err) {
                if (showLoading) chart.hideLoading();
                if (err) alert(err);
                insideForwardDate = false;
            });
        }
        function forwardDate(leftOrRight,callback) {
            chart.removeListener('lazyLoadingPointsLoaded');

            var range = chart.getSelectedRange();
            if (!range || !range.count || !range.type) return callback('Please select period before using this button');

            var extremes = chart.xAxis[0].getExtremes(),
                max = extremes.max,
                min = extremes.min,
                dataMax = extremes.dataMax,
                dataMin = extremes.dataMin,
                newMin, newMax;

            if (leftOrRight) {
                newMin = moment.utc(min).add(-range.count, range.type).valueOf();
                if (newMin < dataMin) newMin = dataMin;
                newMax = moment.utc(newMin).add(range.count, range.type).valueOf();
            } else {
                newMax = moment.utc(max).add(range.count, range.type).valueOf();
                if (newMax > dataMax) newMax = dataMax;
                newMin = moment.utc(newMax).add(-range.count, range.type).valueOf();
            }
            if (min == newMin && max == newMax)
                return callback();
            
            chart.xAxis[0].setExtremes(newMin, newMax);
            if (!isEmptyRange(newMin, newMax)) return callback();
            //If the chart has lazyLoading series, then wait till data loaded and check if the data still empty
            if (chart.getLazyLoadingSeries().length) {
                chart.once('lazyLoadingPointsLoaded', function () {
                    if (isEmptyRange(newMin, newMax))
                        forwardDate(leftOrRight, callback);
                    else callback();
                });
            } else forwardDate(leftOrRight, callback);
        }

        function isEmptyRange(startRange, endRange) {
            return chart.series.every(function (series) { return !series.hasValuesInRange(startRange, endRange, 1); });
        }
        function drawZoomButton(x, y, plus, onclick) {
            var src = plus ? 'signia-368.svg' : 'signia-365.svg';
            var elm = drawImage(src, x, y);
            if (onclick) {
                //   elm1.on('click', onclick);
                elm.on('click', onclick);
            }
            return elm;
        }
        function drawImage(src, x, y) {
            var element = chart.renderer.image('/static_files/images/' + src, x, y, width, height)
                .attr({})
                .css({ cursor: cursor })
                .add();
            return element;
        }

    });



})(Highcharts);