//This plugin support resizing yaxis by mouse or touch

(function (Highcharts) {
    
    var H = Highcharts,
        Chart = H.Chart,
        extend = H.extend,
        extendClass = H.extendClass,
        merge = H.merge,
        each = H.each;
    
    /**
     * initialize the plugin
     * 
     * */
    Chart.prototype.callbacks.push(function (chart) {
        
        var dragDropObject,
            twoAxisArray,
            startHeight,
            startPercent;

        Highcharts.addEvent(chart.container, 'mousemove', moveFunction);
        Highcharts.addEvent(chart.container, 'touchmove', moveFunction);
        
        function getTopDownAxis(e) {
            e = chart.pointer.normalize(e);
            //find only user's axis
            var axisArray = chart.userYAxis();
            if (axisArray.length < 2) return;
            //sort from top to down
            axisArray.sort(function (axis1, axis2) { return axis1.top - axis2.top });
            for (var i = 0; i < axisArray.length - 1; i++) {
                var p1 = axisArray[i].top + axisArray[i].height;
                var p2 = axisArray[i + 1].top;
                var y = e.chartY;
                if (p1 < y && p2 > y) {
                    return [axisArray[i], axisArray[i + 1]]
                }
            }
        }
        

        function moveFunction(e) {
            if (chart.mouseIsDown) return;
            var twoAxis = getTopDownAxis(e);
            if (twoAxis) {
                if (dragDropObject) return;
                dragDropObject=chart.dragMoveDrop(chart.container,drag, move, drop);
                chart.changeCursor('s-resize');
                twoAxisArray = twoAxis;
                 if (chart.tooltip) {
                    chart.shouldHideTooltip = true;
                    chart.tooltip.hide();
                }
            } else {
                if (dragDropObject) {
                    dragDropObject.cancel();
                    dragDropObject = undefined;
                }
                chart.changeCursor('default');
                chart.shouldHideTooltip = false;
            }
        }        ;
 

        function drag(e) {
            var axis1 = twoAxisArray[0];
            startHeight = axis1.height;
            startPercent=  axis1.options.height;
            if (typeof (startPercent) == 'string') {
                var l = startPercent.length;
                startPercent = Number(startPercent.substring(0, l - 1));
            }
        }
        function move(e) {
            e = chart.pointer.normalize(e);
            var axis1 = twoAxisArray[0],
                axis2 = twoAxisArray[1],
                userOptions = chart.getUsersOptions(),
                userAxis1 = userOptions.yAxis.filter(function (a) { return a.id == axis1.options.id; })[0],
                userAxis2 = userOptions.yAxis.filter(function (a) { return a.id == axis2.options.id; })[0],
                newHeight1 = e.chartY - axis1.top,
                minHeight = 1,
                maxHeight = axis2.top + axis2.height;
            
            if (!userAxis1 || !userAxis2) return;
            //don't allow zero and negative hights
            if (newHeight1 < minHeight)
                newHeight1 = minHeight;
            //don't allow more than maximum height
            if (axis1.top + newHeight1 >= maxHeight)
                newHeight1 = maxHeight- axis1.top;
            var newRatio = (newHeight1 / startHeight) * startPercent;
            var keepTheSame = userOptions.yAxis.filter(function (a) { return a !== userAxis2; }).
                map(function (a) { return a.id; });
            if (Number.isFinite(newRatio))
                chart.setYAxisSize(axis1.options.id, newRatio, keepTheSame);
            else console.log();
        }
        function drop(e) {
            
        }
    });
    


})(Highcharts);