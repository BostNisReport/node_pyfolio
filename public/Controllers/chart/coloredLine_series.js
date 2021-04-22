(function (H) {
    //return;
    var each = H.each,
        seriesTypes = H.seriesTypes,
        NORMAL_STATE = '',
        extend = H.extend,
        M = 'M',
        L = 'L';

    var seriesDestroy = H.Series.prototype.destroy;
    var seriesRedraw = H.Series.prototype.redraw;
    var seriesSetState = H.Series.prototype.setState;


    /**
 * Gets the series points
 * */
    H.Series.prototype.multiColor = function () {
        var series = this,
            chart = series && series.chart;
        return chart && chart.isUserSeries(series) && (series.type == 'line' || series.type == 'area');
    }


    /**
     * Gets the color for the line (for lines charts) or for the area (for area charts) that will connect this point to the next point
     * */
    H.Series.prototype.getPointColor = function (allPoints, index) {
        return allPoints[index].color;
    }
    /**
     * Gets the series points
     * */
    H.Series.prototype.getSeriesPoints = function () {
        return this.points;
    }

    /**
     * Get an array of segments objects, each segment contains array of points and it's color
     * */
    H.Series.prototype.getColoredSegments = function () {
        var series = this,
            chart = series.chart,
            points = series.getSeriesPoints(),
            pointsLength = points.length,
            //store the similar points in the same array
            segments = [],
            //one segment
            singleSegment = [],
            startNewSegment = false,
            lastColor = undefined;
        //series.mapGroupedPointsToItsColor();
        //draw the multi colors
        for (var i = 0; i < pointsLength; i++) {
            var p = points[i],
                pointColor = series.getPointColor(points, i);
            if (p.y == null || !pointColor)
                startNewSegment = true;
            else {
                if (!lastColor) lastColor = pointColor;
                singleSegment.push(p);
                if (lastColor != pointColor)
                    startNewSegment = true;
            }
            if (i == pointsLength - 1) startNewSegment = true;
            if (startNewSegment && singleSegment.length > 0) {
                segments.push({
                    points: singleSegment,
                    color: lastColor
                });
                singleSegment = [];
                lastColor = undefined;
                startNewSegment = false;
                if (i < pointsLength - 1)
                    i--;
            }
        }
        return segments;
    }

    /**
     * Destroy the colored segments paths
     * */
    H.Series.prototype.destroyColoredSegments = function () {
        var series = this;
        if (series.coloredSegmentsPaths)
            series.coloredSegmentsPaths.forEach(function (path) {
                path.destroy();
            });
        series.coloredSegmentsPaths = [];
    }

    /**
     * Draw an array of segments objects, each segment contains array of points and it's color
     * */
    function drawPath(series, points, color) {
        var attr = {
            'stroke-width': series.options.lineWidth,
            zIndex: 1
        };

        series.areaPath = [];
        var linePath = series.getSegmentPath(points);
        var path = series.chart.renderer.path(linePath).attr(extend({
            stroke: color
        }, attr)).add(series.group);
        series.coloredSegmentsPaths.push(path);
        if (series.type == 'area') {
            path = series.chart.renderer.path(series.areaPath).attr(extend({
                fill: color
            }, attr)).add(series.group);
            series.coloredSegmentsPaths.push(path);
        }
    }


    ///**
    // * In case the data grouped, then highstock remove the user options for each point, this method try to find the closest color for each grouped point
    // * */
    //H.Series.prototype.mapGroupedPointsToItsColor = function () {
    //    var series = this;
    //    //if there is no groups then return
    //    if (!series.hasGroupedData || !series.points.length) return;
    //    //if the points are not in the object format then no need to check the color stuff
    //    if (typeof (series.options.data[0]) !== 'object')
    //        return;
    //    var points = series.points,
    //        xStart = points[0].x,
    //        xEnd = points[points.length - 1].x,
    //        xData = series.xData,
    //        options = series.options,
    //        data = options.data,
    //        xDataLength = xData.length,
    //        startIndex = undefined,
    //        endIndex = undefined,
    //        stepFactor = undefined;

    //    for (var i = 0; i < xDataLength; i++) {
    //        if (xData[i] < xStart) continue;
    //        startIndex = i;
    //        break;
    //    }
    //    for (var i = startIndex; i < xDataLength; i++) {
    //        if (xData[i] < xEnd) continue;
    //        endIndex = i;
    //        break;
    //    }
    //    stepFactor = Math.ceil((endIndex - startIndex) / points.length);
    //    for (var i = 0; i < points.length; i++) {
    //        var p = data[startIndex + i * stepFactor] || data[data.length - 1];
    //        points[i].color = p.color;
    //        points[i].color = p.color;
    //    }
    //}

    /**
     * Return the graph path of a segment - compatibility with 4.2.3+
     */
    H.Series.prototype.getSegmentPath = function (segment) {
        var series = this,
            segmentPath = [],
            step = series.options.step;

        // build the segment line
        each(segment, function (point, i) {
            var plotX = point.plotX,
                plotY = point.plotY,
                lastPoint;

            if (series.getPointSpline) {
                // generate the spline as defined in the SplineSeries object
                segmentPath.push.apply(segmentPath, series.getPointSpline(segment, point, i));
            } else {
                // moveTo or lineTo
                segmentPath.push(i ? L : M);

                // step line?
                if (step && i) {
                    lastPoint = segment[i - 1];
                    if (step === 'right') {
                        segmentPath.push(
                            lastPoint.plotX,
                            plotY,
                            L
                        );
                    } else if (step === 'center') {
                        segmentPath.push(
                            (lastPoint.plotX + plotX) / 2,
                            lastPoint.plotY,
                            L,
                            (lastPoint.plotX + plotX) / 2,
                            plotY,
                            L
                        );
                    } else {
                        segmentPath.push(
                            plotX,
                            lastPoint.plotY,
                            L
                        );
                    }
                }

                // normal line to next point
                segmentPath.push(
                    plotX,
                    plotY
                );
            }
        });

        return segmentPath;
    };



    seriesTypes.line.prototype.destroy =
        seriesTypes.area.prototype.destroy = function () {
            //Only for multi colors series
            if (!this.multiColor())
                return seriesDestroy.call(this);
            this.destroyColoredSegments();
            seriesDestroy.call(this);
        }

    seriesTypes.line.prototype.redraw =
        seriesTypes.area.prototype.redraw = function () {
            //Only for multi colors series
            if (!this.multiColor())
                return seriesRedraw.call(this);
            var series = this,
                lineWidth = series.options.lineWidth;
            series.options.lineWidth = undefined;
            //draw the default drawing
            seriesRedraw.call(series);
            series.options.lineWidth = lineWidth;

            var segments = series.getColoredSegments();
            series.destroyColoredSegments();
            segments.forEach(function (segment) {
                drawPath(series, segment.points, segment.color);
            });
        }


    /**
     * Hide the hover draw state
     * */
    H.seriesTypes.line.prototype.setState = function (state) {
        //Only for multi colors series
        if (!this.multiColor())
            return seriesSetState.call(this);
        var series = this,
            options = series.options,
            graph = series.graph,
            graphNeg = series.graphNeg,
            stateOptions = options.states,
            lineWidth = options.lineWidth,
            attribs;

        state = state || NORMAL_STATE;

        if (series.state !== state) {
            series.state = state;

            if (stateOptions[state] && stateOptions[state].enabled === false) {
                return;
            }

            if (state) {
                lineWidth = stateOptions[state].lineWidth || lineWidth + 1;
            }

            if (graph && !graph.dashstyle) { // hover is turned off for dashed lines in VML
                attribs = {
                    'stroke-width': lineWidth
                };
                // use attr because animate will cause any other animation on the graph to stop
                each(graph, function (seg, i) {
                    seg.attr(attribs);
                });
            }
        }
    }


})(Highcharts);
