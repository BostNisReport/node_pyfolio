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
//        var color = '#CC0000',
//            backgroundColor = 'transparent',
//            cursor = 'pointer',
//            buttonWidth = 11;

//        // update annotations after chart redraw
//        Highcharts.addEvent(chart, 'redraw', function () {
//            drawButtons();
//        });
//        Highcharts.addEvent(chart.container, 'mousemove', function (args) {
//            args = chart.pointer.normalize(args);
//            var postions = chart.yAxisRemoveButtonsPostions;
//            if (!postions) return;
//            var isInside = postions.some(function (pos) {
//                var xDiff = args.chartX - pos[0];
//                var yDiff = args.chartY - pos[1];
//                if (xDiff >= -2 && xDiff <= 20 && yDiff >= -1 && yDiff <= 16)
//                    return true;
//            });
//            if (isInside && chart.tooltip) {
//                chart.shouldHideTooltip = true;
//                chart.tooltip.hide();
//            } else chart.shouldHideTooltip = false;

//        });
//        window.drawButtons = function () { drawButtons(); }
//        function drawButtons() {
//            if (chart.yAxisRemoveButtons)
//                chart.yAxisRemoveButtons.forEach(function (elements) {
//                    elements.forEach(function (elm) { elm.destroy(); });

//                });


//            chart.yAxisRemoveButtonsPostions =
//                chart.yAxis.filter(function (yAxis) { return yAxis.options.id != 'navigator-y-axis' }).
//                    map(function (yAxis) {
//                        var x = yAxis.left + yAxis.width - 16,
//                            y = yAxis.pos + 3;
//                        return [x, y, yAxis];
//                    });
//            chart.yAxisRemoveButtons = chart.yAxisRemoveButtonsPostions.map(function (postion) {
//                return drawYAxisButton(postion[0], postion[1], function () {
//                    chart.removeYAxis(postion[2], true);
//                });
//            });
//        }



//        function drawYAxisButton(x, y, onclick) {
//            var backgrounShape = drawBackground(x, y);
//            var elm = drawRemoveButton(x, y);

//            if (onclick) {
//                elm.on('click', onclick);
//                backgrounShape.on('click', onclick);
//            }
//            return [elm, backgrounShape];
//        }
//        function drawBackground(x, y) {
//            var element = chart.renderer.rect(x - 2, y - 2, buttonWidth + 4, buttonWidth + 4)
//                .attr({
//                    'stroke-width': 0,
//                    stroke: color,
//                    fill: backgroundColor,
//                    zIndex: 23
//                })
//                .css({
//                    cursor: cursor
//                })
//                .add();
//            return element;
//        }


//        function drawRemoveButton(x, y) {

//            var element = chart.renderer.path(['M', x, y, 'L', x + buttonWidth, y + buttonWidth, 'M', x + buttonWidth, y, 'L', x, y + buttonWidth])
//                .attr({
//                    'stroke-width': 4,
//                    stroke: color,
//                    zIndex: 23
//                })
//                .css({
//                    cursor: cursor
//                })
//                .add();
//            return element;
//        }
//    });



//})(Highcharts);