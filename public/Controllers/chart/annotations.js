//plugin for supporting the annotations drawing
(function (Highcharts) {
    
    var H = Highcharts,
        Chart = H.Chart,
        extend = H.extend,
        extendClass = H.extendClass,
        merge = H.merge,
        each = H.each;
    
    
    extend(Chart.prototype, {
        /**
         * Add annotation to the chart
         * 
         * */
        addAnnotation: function (options) {
            var chart = this,
                shapeType = options.type,
                obj = new H[shapeType + 'Annotation'],
                chartOptions = chart.options;
            
            chartOptions.annotations = chartOptions.annotations || [];
            chartOptions.annotations.push(obj);
            
            
            obj.init(chart, options);
            obj.render();
            return obj;
        },
        /**
         * Redraw all annotations
         * 
         * */
        redrawAnnotations: function () {
            var chart = this,
                options = chart.options;
            if (!options.annotations) return;
            options.annotations.forEach(function (ann) {
                ann.render();
            });
        }
    });
    
    /**
     * The Annotation object
     * 
     * */
    var Annotation = H.Annotation = function () { }
    Annotation.prototype = {
        /* 
         * Initialize the annotation
         */
        init: function (chart, options) {
            this.chart = chart;
            this.options = options || {};
            this.options.shapeAttr = this.options.shapeAttr || {};
            this.options.xAxis = this.options.xAxis || 0;
            this.options.yAxis = this.options.yAxis || 0;
            
            merge(true, this.options.shapeAttr, this.chart.options.annotation);
        },
        /* 
         * Render the annotation
         */
        render: function () {
          
            this.recalculate();
            var anno = this,
                chart = anno.chart,
                options = anno.options,
                xAxis = chart.getAxis(options.xAxis, 'x'),
                yAxis = chart.getAxis(options.yAxis, 'y'),
                x1 = options.startPoint.chartX,
                y1 = options.startPoint.chartY,
                x2 = options.endPoint.chartX,
                y2 = options.endPoint.chartY;
            
            y1 = Math.max(yAxis.pos, y1);
            y1 = Math.min(yAxis.pos + yAxis.height, y1);
            y2 = Math.max(yAxis.pos, y2);
            y2 = Math.min(yAxis.pos + yAxis.height, y2);
            
            if (!chart.isInsideChart(x1, y1) && !chart.isInsideChart(x2, y2)) {
                return;
            }
            var center = Highcharts.fn.calculateCenterPoint(x1, y1, x2, y2),
                distance = Highcharts.fn.calculateDistance(x1, y1, x2, y2);
            
            var inputs = {
                xAxis: xAxis,
                yAxis: yAxis,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                center: center,
                distance: distance
            };
            return inputs;
        },
        /* 
         * Recalculate the annotation's points using it's current postion
         */
        recalculate: function () {
            var anno = this,
                options = anno.options;
            return anno._recalculate(options.movableHorizontally, options.movableVertically);
        },
        /* 
         * Recalculate the annotation's points using it's current postion
         */
        _recalculate: function (movableHorizontally, movableVertically) {
            var anno = this,
                chart = anno.chart,
                options = anno.options,
                xAxis = chart.getAxis(options.xAxis, 'x'),
                yAxis = chart.getAxis(options.yAxis, 'y');
            
            if (!movableHorizontally) {
                options.startPoint.xValue = xAxis.toValue(options.startPoint.chartX);
                options.endPoint.xValue = xAxis.toValue(options.endPoint.chartX);
            } else {
                options.startPoint.chartX = xAxis.toPixels(options.startPoint.xValue);
                options.endPoint.chartX = xAxis.toPixels(options.endPoint.xValue);
            }
            if (!movableVertically) {
                options.startPoint.yValue = yAxis.toValue(options.startPoint.chartY);
                options.endPoint.yValue = yAxis.toValue(options.endPoint.chartY);
            } else {
                options.startPoint.chartY = yAxis.toPixels(options.startPoint.yValue);
                options.endPoint.chartY = yAxis.toPixels(options.endPoint.yValue);
            }

        },
        /* 
         * Add the shape to the annotation
         */
        addShape: function () {
            
            var anno = this,
                options = anno.options,
                funtionName = arguments[0],
                renderer = this.chart.renderer,
                attr = this.options.shapeAttr,
                style = attr.style;
            var args = [];
            for (var i = 1; i < arguments.length; i++)
                args.push(arguments[i]);
            
            if (funtionName == 'label' && attr.label) style = merge(style, attr.label.style);
            var newShape= renderer[funtionName].apply(renderer, args)
                .attr(attr)
                .css(style)
                .add();

            if (this.shape) {
                var newAttr = newShape.element.attributes;
                for (var i = 0; i < newAttr.length; i++) {
                    anno.shape.element.setAttribute(newAttr[i].name, newAttr[i].value);
                }
                newShape.destroy();
            } else {
                anno.shape = newShape;
                Object.keys(anno._events).forEach(function (eventName) {
                    anno._events[eventName].forEach(function (eventMethod) {
                        anno.shape.on(eventName, eventMethod);
                    })
                });
                
                anno._setDragDrop();
                if (anno.options.created) anno.options.created(anno);

            }
        },
        _setDragDrop: function (){
            var anno = this,
                options = anno.options;
            anno.dragFunctions = anno.chart.dragMoveDrop(anno.shape.element,

            function (e) {
                anno.startPoint = anno.chart.pixelToPoint(e);
            },

            function (e) {
                var startPoint = anno.startPoint,
                    currentPoint = anno.chart.pixelToPoint(e);
                if (!startPoint || !currentPoint || startPoint.xAxis != currentPoint.xAxis || startPoint.yAxis != currentPoint.yAxis)
                    return;
                var xDiff = currentPoint.point.chartX - startPoint.point.chartX,
                    yDiff = currentPoint.point.chartY - startPoint.point.chartY;
                anno.startPoint = currentPoint;
                if (options.draggableX) {
                    options.startPoint.chartX += xDiff;
                    options.endPoint.chartX += xDiff;
                }
                if (options.draggableY) {
                    options.startPoint.chartY += yDiff;
                    options.endPoint.chartY += yDiff;
                }
                anno._recalculate(false, false);
                anno.render();
                $(anno.shape.element).jqxTooltip({ disabled: true });
            },

            function () { $(anno.shape.element).jqxTooltip({ disabled: false }); }, true);
        },
        _events: {},
        /* 
         * add event handler
         */
        on: function (eventName, eventMethod) {
            var anno = this;
            anno._events[eventName] = anno._events[eventName] || [];
            anno._events[eventName].push(eventMethod);
            if (anno.shape) anno.shape.on(eventName, eventMethod);
        },
        /* 
         * Destroy the annotation
         */
        destroy: function () {
            if (this.shape) {
                this.shape.destroy();
                this.shape = undefined;
            }
            if (this.dragFunctions) {
                this.dragFunctions.cancel();
            }
            var index = this.chart.options.annotations.indexOf(this);
            this.chart.options.annotations.splice(index, 1);
        }
    }
    
    /**
     * The Circle Annotation object
     * 
     * */
    var CircleAnnotation = H.CircleAnnotation = extendClass(Annotation, {
        
        /* 
         * Render the annotation
         */
        render: function () {
            var inputs = Annotation.prototype.render.apply(this);
            if (!inputs) return;
            this.addShape('circle', inputs.center[0], inputs.center[1], inputs.distance / 2);
        }
    });
    
    
    /**
     * The Rectangle Annotation object
     * 
     * */
    var RectangleAnnotation = H.RectangleAnnotation = extendClass(Annotation, {
        /* 
         * Render the annotation
         */
        render: function () {
            var inputs = Annotation.prototype.render.apply(this);
            if (!inputs) return;
            this.addShape('rect', inputs.x1, inputs.y1, inputs.x2 - inputs.x1, inputs.y2 - inputs.y1, this.options.cornerRadius);

        }
    });
    
    /**
     * The Label Annotation object
     * 
     * */
    var LabelAnnotation = H.LabelAnnotation = extendClass(Annotation, {
        /* 
         * Render the annotation
         */
        render: function () {
            var inputs = Annotation.prototype.render.apply(this);
            if (!inputs) return;
            var text = this.options.text || 'sample';
            this.addShape('label', text, inputs.x1, inputs.y1);
        },
        /* 
         * Fix the text updated
         */
        addShape: function () {
            Annotation.prototype.addShape.apply(this, arguments);
            this.shape.textSetter(arguments[1])
        },
    });
    
    /**
     * The Line Annotation object
     * 
     * */
    var LineAnnotation = H.LineAnnotation = extendClass(Annotation, {
        /* 
         * Initialize the annotation
         */
        init: function (chart, options) {
            Annotation.prototype.init.call(this, chart, options);
            
            merge(true, this.options.shapeAttr, this.chart.options.lineAnnotation);
        },
        /* 
         * Render the annotation
         */
        render: function () {
            var inputs = Annotation.prototype.render.apply(this);
            if (!inputs) return;
            this.addShape('path', ['M', inputs.x1, inputs.y1, 'L', inputs.x2, inputs.y2]);
        }
    });
    
    
    /**
     * initialize the plugin
     * 
     * */
    Chart.prototype.callbacks.push(function (chart) {
        
        // update annotations after chart redraw
        Highcharts.addEvent(chart, 'redraw', function () {
            chart.redrawAnnotations();
        });
        
        var startPoint,
            endPoint,
            inputs = {},
            annotationObj;
        
        
        /**
         * Draw Annotation by mouse
         * 
         * @Param {object} options: The Annotation options
         * @Param {function} callback: Called after drawing finished
         * */
        chart.drawAnnotationByHand = function (options, callback) {
            inputs.options = options;
            inputs.callback = callback;
            chart.changeCursor('crosshair');
            chart.dragMoveDrop(chart.container, drag, move, drop);
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
            if (annotationObj) {
                var obj = annotationObj;
                annotationObj = undefined;
                if (inputs.callback) {
                    inputs.callback(obj);
                }
            }
        }        ;
        
        /**
         * drop on mouseup
         * 
         * */
        function move(e) {
            drawAnnotation(e);
        }        ;
        
        /**
         * 
         * 
         * */
        function drawAnnotation(e) {
            if (annotationObj) {
                annotationObj.destroy();
                annotationObj = undefined;
            }
            endPoint = chart.pixelToPoint(e);
            if (!startPoint || !endPoint || startPoint.yAxis != endPoint.yAxis) return;
            
            
            extend(inputs.options, {
                xAxis: startPoint.xAxis,
                yAxis: startPoint.yAxis,
                startPoint: startPoint.point,
                endPoint: endPoint.point,
                movableHorizontally: true,
                draggableX: true,
                draggableY:true
            });
            annotationObj = chart.addAnnotation(inputs.options);
        }
    });



})(Highcharts);