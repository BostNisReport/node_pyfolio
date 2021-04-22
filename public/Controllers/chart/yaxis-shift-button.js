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
        var cursor = 'pointer';

        // update annotations after chart redraw
        Highcharts.addEvent(chart, 'redraw', function () {
            drawButtons();
        });

        Highcharts.addEvent(chart.container, 'mousemove', function (args) {
            args = chart.pointer.normalize(args);
            var postions = chart.yAxisShiftButtonsPostions;
            if (!postions) return;
            var isInside = postions.some(function (pos) {
                var xDiff = args.chartX - pos[0];
                var yDiff = args.chartY - pos[1];
                if (xDiff >= -2 && xDiff <= 20 && yDiff >= -1 && yDiff <= 16)
                    return true;
            });
            if (isInside && chart.tooltip) {
                chart.shouldHideTooltip = true;
                chart.tooltip.hide();
            } else chart.shouldHideTooltip = false;

        });
        function drawButtons() {

            if (chart.yAxisShiftButtons) {
                chart.yAxisShiftButtons.forEach(function (elm) {
                    elm.destroy();
                });
            }
            chart.yAxisShiftButtons = [];
            var postions = chart.yAxisShiftButtonsPostions = [];
            

            chart.userYAxis().forEach(function (yAxis) {
                var canShiftUp = chart.canShiftYAxisDisplayIndex(yAxis.options.id, -1);
                var canShiftDown = chart.canShiftYAxisDisplayIndex(yAxis.options.id, 1);
                var title = 'Move ' + yAxis.options.title.text + ' ';
                var color = yAxis.series.length ? yAxis.series[0].color : 'black';
                if (canShiftUp) {
                    var x = yAxis.left + yAxis.offset+1,
                        y = yAxis.pos+3;
                    postions.push([x, y, yAxis]);

                    var btn = drawButton(true, title + 'up', color, x, y, function () {
                        chart.shiftYAxisDisplayIndex(yAxis.options.id, -1);
                    });
                    chart.yAxisShiftButtons.push(btn[0], btn[1]);
                }
                if (canShiftDown) {
                    var x = yAxis.left + yAxis.offset+1 ,
                        y = yAxis.pos+3 + (canShiftUp ? 10 : 0);
                    postions.push([x, y, yAxis]);
                    var btn = drawButton(false, title + 'down', color, x, y, function () {
                        chart.shiftYAxisDisplayIndex(yAxis.options.id, 1);
                    });
                    chart.yAxisShiftButtons.push(btn[0], btn[1]);
                }
                
            });

            
        }



 
        function drawButton(upOrDown, tooltip,color, x, y, onclick) {
            var width = 12, height = 5;
            var path = upOrDown ? ['M', x, y + height, 'L', x + width / 2, y, 'L', x + width, y + height]
                                : ['M', x, y, 'L', x + width / 2, y + height , 'L', x + width, y];
            var element =chart.renderer.path(path)
                .attr({
                    'stroke-width': 4,
                    stroke: color,
                    title: tooltip ,
                    zIndex: 23
                })
                .css({cursor: cursor })
                .add();

            var backgroundElement = chart.renderer.rect(x - 2, y - 2, width + 4, height + 4)
                .attr({
                    'stroke-width': 0,
                    fill: 'transparent',
                    title: tooltip,
                    zIndex: 23
                })
                .css({ cursor: cursor })
                .add();

            if (onclick) {
                element.on('click', onclick);
                backgroundElement.on('click', onclick);
            }

            return [element, backgroundElement];
        }

    });



})(Highcharts);