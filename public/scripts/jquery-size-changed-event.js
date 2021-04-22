//this is a Jquery plugin function that fire an event when the size of an element changed
//usage $().sizeChanged(function(){})


(function ($) {
    
    $.fn.sizeChanged = function (handleFunction) {
        var element = this;
        element.sizeChangedMonitored = true;
        var lastWidth = element.width();
        var lastHeight = element.height();
        
        setInterval(function () {
            if (lastWidth === element.width()&&lastHeight === element.height())
                return;
            if (typeof (handleFunction) == 'function') {
                handleFunction({ width: lastWidth, height: lastHeight },
                               { width: element.width(), height: element.height() });
                lastWidth = element.width();
                lastHeight = element.height();
            }
        }, 100);
        

        return element;
    };
 
}(jQuery));



//this is a Jquery plugin function that check if an element is ina postion
//usage $().isInside(event)


(function ($) {
    
    $.fn.isInside = function (event) {
        var element = this;
        
        event = jQuery.event.fix(event || window.event);
        var args = event.args.originalEvent || event.args;
        
        var offset = element.offset(),
            left = offset.left,
            top = offset.top,
            width = element.outerWidth(),
            height = element.outerHeight(),
            mouseLeft = args.pageX,
            mouseTop = args.pageY,
            isAfterLeft = mouseLeft > left,
            isBeforeRight = mouseLeft < left + width,
            isAfterTop = mouseTop > top,
            isBeforeBottom = mouseTop < top + height,
            isInsideDropTarget = isAfterLeft && isBeforeRight && isAfterTop && isBeforeBottom;
        
        
        return isInsideDropTarget;
    };
 
}(jQuery));