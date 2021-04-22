////plugin for supporting the zooming buttons
//(function (Highcharts) {
    
//    var H = Highcharts,
//        Chart = H.Chart,
//        extend = H.extend,
//        extendClass = H.extendClass,
//        merge = H.merge,
//        each = H.each;
    
    
//    extend(Chart.prototype, {

//    });
    
    
//    /**
//     * initialize the plugin
//     * 
//     * */
//    Chart.prototype.callbacks.push(function (chart) {
//        var radius = 10,
//            space = 3,
//            spaceBetweenButtons=10,
//            color = 'gray',
//            cursor = 'pointer';
        
//        // update annotations after chart redraw
//        Highcharts.addEvent(chart, 'redraw', function () {
//            drawButtons();
//        });
        
//        function drawButtons() {
//            var x = chart.chartWidth * 0.5,
//                y = chart.chartHeight - (chart.options.scrollbar.enabled?45:12);
//            if (chart.xAxisPlusButton)
//                chart.xAxisPlusButton.forEach(function (elm) {elm.destroy(); });
//            if (chart.xAxisMinusButton)
//                chart.xAxisMinusButton.forEach(function (elm) { elm.destroy(); });
//            chart.xAxisMinusButton = drawZoomButton(x - radius - spaceBetweenButtons, y, false, function () { increase_xAxis_Extremes(true); });
//            chart.xAxisPlusButton = drawZoomButton(x + radius + spaceBetweenButtons, y, true, function () { increase_xAxis_Extremes(false); });


//        }
        
//        function increase_xAxis_Extremes(value){
//            var extremes = chart.xAxis[0].getExtremes(),
//                max = extremes.max,
//                min = extremes.min,
//                dataMax = extremes.dataMax,
//                dataMin = extremes.dataMin,
//                diff = (max - min) * 0.1,
//                newMax = Math.min(dataMax, value?max + diff:max - diff),
//                newMin = Math.max(dataMin, value?min - diff:min + diff);
//            if (newMax >= dataMax && newMin <= dataMin)
//                return;
//            chart.xAxis[0].setExtremes(newMin, newMax)
//        }
        
//        function drawZoomButton(x,y,plus,onclick) {
//            var elm1 = drawCircle(x, y);
//            var elm2 = plus? drawPlus(x, y):drawMinus(x, y);
//            if (onclick) {
//                elm1.on('click', onclick);
//                elm2.on('click', onclick);
//            }
//            return [elm1,elm2];
//        }
//        function drawPlus(x,y) {
//            var element = chart.renderer.path(['M', x - radius + space, y, 'H', x + radius - space, 'M', x, y - radius + space, 'V', y + radius - space])
//                .attr({
//                'stroke-width': 4,
//                stroke: color
//            })
//                .css({
//                cursor: cursor
//            })
//                .add();
//            return element;
//        }
//        function drawMinus(x,y) {
//            var element = chart.renderer.path(['M', x - radius + space, y, 'H', x + radius - space])
//                .attr({
//                'stroke-width': 4,
//                stroke: color
//            })
//                .css({
//                cursor: cursor
//            })
//                .add();
            
//            return element;
//        }
//        function drawCircle(x,y) {
//            var element = chart.renderer.circle(x, y, radius)
//                .attr({
//                'stroke-width': 2,
//                stroke: color,
//                fill:'transparent'
//            })
//                .css({
//                cursor: cursor
//            })
//                .add();
//            return element;
//        }
//    });



//})(Highcharts);