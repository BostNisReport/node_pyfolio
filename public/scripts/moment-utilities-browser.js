(function (root) {

    var momentUtilities =  {};
    
    /**
     * Group the array into groups by grouping all rows within a range
     *
     * @method
     *
     * @param {Array} array - The points array
     * @param {object} options: Options are:
     *                                       field: The field's name of dateTime value of each row
     *                                       value: The date value
     *                                       type: The data type such as 'day','month' or 'year'
     *                                       startIndex: the array's startIndex
     *                                       endIndex: the array's endIndex
     */
    momentUtilities.groupArray = function (array, options) {
        var indexes = momentUtilities.getSeparatorsIndexes(array, options),
          startIndex = options.startIndex || 0,
          endIndex = options.endIndex || array.length - 1,
          groups;
        //add the last index
        if (indexes[indexes.length - 1] != endIndex)
            indexes.push(endIndex + 1);
        groups = indexes.map(function (index) {
            var bars = array.slice(startIndex, index);
            startIndex = index;
            return bars;
        });

        return groups;
    }


    /**
     * Gets the last rows range
     * 
     * @param {Array} array: The points array
     * @param {object} options: Options are:
     *                                       field: The field's name of dateTime value of each row
     *                                       value: The date value
     *                                       type: The data type such as 'day','month' or 'year'
     *                                       startIndex: the array's startIndex
     *                                       endIndex: the array's endIndex
     * */
    momentUtilities.getLastGroup = function (array, options) {
        var indexes = momentUtilities.getSeparatorsIndexes(array, options),
          endIndex = options.endIndex || array.length - 1,
          lastIndex = indexes[indexes.length - 1];
        var result = array.slice(lastIndex, endIndex + 1);
        return result;
    }


    /**
     * Gets the indexes of each range using the input type
     * 
     * @param {Array} array: The points array
     * @param {object} options: Options are:
     *                                       field: The field's name of dateTime value of each row
     *                                       value: The date value
     *                                       type: The data type such as 'day','month' or 'year'
     *                                       startIndex: the array's startIndex
     *                                       endIndex: the array's endIndex
     * */
    momentUtilities.getSeparatorsIndexes = function (array, options) {
        var result = [],
          dateTime,
          ceilDate,
          field = options.field || 'dateTime',
          startIndex = options.startIndex || 0,
          endIndex = options.endIndex || array.length - 1,
          row;

        for (var i = startIndex; i <= endIndex; i++) {
            row = array[i];
            dateTime = typeof (row) == 'object' ? row[field] : row;
            if (!ceilDate || dateTime > ceilDate) {
                ceilDate = momentUtilities.getCeilDate(dateTime, options.type).add(options.value - 1, options.type).valueOf();
                if (dateTime == ceilDate || i > 0)
                    result.push(i);
            }
        }
        return result;
    }


    /**
     * Gets the first date for the input type
     * 
     * @param {Number} dateTime: The date value
     * @param {String} type: The data type such as 'hours','days','weeks','months' or 'years'
     * */
    momentUtilities.getFloorDate = function (dateTime, type) {
        var m = moment.utc(dateTime);
        if (type == 'hours' || type == 'hour') {
            m.minute(0).second(0).millisecond(0);
        } else if (type == 'days' || type == 'day') {
            m.hour(0).minute(0).second(0).millisecond(0);
        } else if (type == 'weeks' || type == 'week') {
            m.day(0).hour(0).minute(0).second(0).millisecond(0);
        } else if (type == 'months' || type == 'month') {
            m.date(1).hour(0).minute(0).second(0).millisecond(0);
        } else if (type == 'years' || type == 'year') {
            m.month(0).date(1).hour(0).minute(0).second(0).millisecond(0);
        } else throw 'getFloorDate, type is wrong';
        return m;
    }


    /**
     * Gets the last date for the input type
     * 
     * @param {Number} dateTime: The date value
     * @param {String} type: The data type such as 'hours','days','months' or 'years'
     * */
    momentUtilities.getCeilDate = function (dateTime, type) {
        var floorDate = momentUtilities.getFloorDate(dateTime, type);
        floorDate.add(1, type).add(-1, 'millisecond');
        return floorDate;
    }

    root.momentUtilities = momentUtilities;

})(this);
