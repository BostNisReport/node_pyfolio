////This plugin support draging and dropping series from one yAxis to another

//(function (Highcharts) {
    
//    var H = Highcharts,
//        Chart = H.Chart,
//        extend = H.extend,
//        extendClass = H.extendClass,
//        merge = H.merge,
//        each = H.each;
    
//    /**
//     * initialize the plugin
//     * 
//     * */
//    Chart.prototype.callbacks.push(function (chart) {
//        Highcharts.addEvent(chart.container, 'touchstart', drag);
//        Highcharts.addEvent(chart.container, 'touchend', drop);
//        var startPoint,
//            endPoint;
      
//        /**
//         * Drag on touchstart
//         * 
//         * */
//        function drag(e) {
//            startPoint = chart.pixelToPoint(e);
//            Highcharts.addEvent(chart.container, 'touchmove', move);
//            //check after 350 milliseconds, if the y postion is changed then it's touch vertically
//            setTimeout(function () {
//                if (chart.preventDrag) return;
//                var check1 = startPoint && endPoint && startPoint.point && endPoint.point;
//                if (!check1 || Math.abs(startPoint.point.chartY - endPoint.point.chartY) > 30) {
//                    chart.disableDefaultDrag(true);
//                }
//            }, 1000);
//        }        ;
        
        
        
//        /**
//         * drop on touchend
//         * 
//         * */
//        function drop(e) {
//            Highcharts.removeEvent(chart.container, 'touchmove', move);
//            chart.disableDefaultDrag(false);
//        }        ;
        
       
//        /**
//         * drop on touchmove
//         * 
//         * */
//        function move(e) {
//            endPoint = chart.pixelToPoint(e);
//        }        ;
//    });
    


//})(Highcharts);