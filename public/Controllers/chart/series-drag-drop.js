//This plugin support draging and dropping series from one yAxis to another

(function (Highcharts) {
    
    var H = Highcharts,
        Chart = H.Chart,
        extend = H.extend,
        extendClass = H.extendClass,
        merge = H.merge,
        each = H.each;
    
    var movableDivTemplate = '<h5 class="moveAble" style="position: fixed;">' +
                             //'   <div class="info">' +
                             //'      <img src="/static_files/images/move-series.png?lastModified=20160909T1938" alt="info" />' +
                             //'   </div>' +
                             '</h5>';
    
    /**
     * initialize the plugin
     * 
     * */
    Chart.prototype.callbacks.push(function (chart) {
       // return;
        Highcharts.addEvent(chart.container, 'mousedown', drag);
        Highcharts.addEvent(chart.container, 'touchstart', drag);
        Highcharts.addEvent(chart.container, 'mouseup', drop);
        Highcharts.addEvent(chart.container, 'touchend', drop);

        var hoverSeries,
            cancelTimeout,
            startPoint,
            isDragging,
            movableDiv = $(movableDivTemplate).appendTo($(chart.container));
        movableDiv.hide();
        /**
         * Drag on mousedown
         * 
         * */
        function drag(e) {
            if (chart.getSortedYAxis().length < 2) return;
            startPoint = chart.pixelToPoint(e);
            if (!startPoint) return;
            cancelTimeout = setTimeout(function () {
                hoverSeries = chart.getHoverSeries();
                if (!hoverSeries) return;
                chart.changeCursor('pointer');
                chart.disableDefaultDrag(true);
                isDragging = true;
                move(e);
            }, 400);   
            Highcharts.addEvent(chart.container, 'mousemove', move);
            Highcharts.addEvent(chart.container, 'touchmove', move);         
        }        ;
        
        
        
        /**
         * drop on mouseup
         * 
         * */
        function drop(e) {
            clearTimeout(cancelTimeout);
            if (!hoverSeries) return;
            Highcharts.removeEvent(chart.container, 'mousemove', move);
            Highcharts.removeEvent(chart.container, 'touchmove', move);
            chart.changeCursor('default');
            chart.disableDefaultDrag(false);
            isDragging = false;
            movableDiv.hide();
            var point = chart.pixelToPoint(e);
            if (point && point.yAxis && hoverSeries.yAxis !== point.yAxis) {
                chart.moveSeries(hoverSeries, point.yAxis);
            }
            hoverSeries = undefined;
        }        ;
        
        /**
         * drop on mouseup
         * 
         * */
        function move(e) {
            var point = chart.pixelToPoint(e);
            if (!isDragging ||!startPoint || !point || !point.yAxis)
                return clearTimeout(cancelTimeout);
            
            if (isDragging) {
                e = chart.pointer.normalize(e);
                var displayIndex1 = chart.getYAxisDisplayIndex(hoverSeries.yAxis.options.id),
                    displayIndex2 = chart.getYAxisDisplayIndex(point.yAxis.options.id);
                //if same panel then tell user to drop to another panel
                if (hoverSeries.yAxis == point.yAxis || displayIndex1 == displayIndex2)
                    movableDiv.html('Move series to another panel');
                else movableDiv.html('Drag here to move the series');
                movableDiv.show();
                movableDiv.css({ 'top': e.pageY- movableDiv.height()-chart.plotTop, 'left': e.pageX- movableDiv.width() })    ;
            }
        }        ;
        

    });
    


})(Highcharts);