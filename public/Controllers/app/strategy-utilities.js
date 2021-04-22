(function (root) {

    var strategyUtilities = root.strategyUtilities = {};


    /**
     * Convert the strategy's row days array to x,y points
     *
     * */
    strategyUtilities.convertRowDaysToPoints = function (strategyRowDaysData) {

        var array = [];
        strategyRowDaysData.forEach(function (day) {
            var startTime = utilities.parseDateTime(day.startTime),
                data = day.data || [],
                length = day.length || data.length;
            for (var i = 0; i < length; i++) {
               array.push({ x: startTime, y: utilities.parseNumber(data[i]) });
                startTime += 60000;
            }
        });
        return array;
    }

     /**
     * Convert the strategy's row data array to x,y points
     *
     * */
    strategyUtilities.convertRowDataToPoints = function (strategyRowData) {

        return strategyRowData.map(function (d) {
            if (Array.isArray(d)) {
                return {
                    x: utilities.parseDateTime( d[0]),
                    y: utilities.parseNumber(d[1])
                };
            }
            //This is the output used by mw when maxValues set (for more informtion see MW document)
            else if (d.datum) {
                return {
                    x: utilities.parseDateTime(d.time),
                    y: utilities.parseNumber(d.datum)
                };
            } else {
                return {
                    x: utilities.parseDateTime(d.dateTime || d.time || d.x),
                    y: utilities.parseNumber(d.value || d.y)
                };
            }
        });
    }

    /**
     * Finds the data inside the StrategyRow and convert it to x,y points
     * 
     * */
    strategyUtilities.convertRowToPoints = function (input) {

        if (input.days)
            return strategyUtilities.convertRowDaysToPoints(input.days);
        if (input.data)
            return strategyUtilities.convertRowDataToPoints(input.data);
        //Checks if the input is 'days' or 'data'
        if (Array.isArray(input)) {
            if (!input.length) return [];
            else if (input[0].startTime)
                return strategyUtilities.convertRowDaysToPoints(input);
            else return strategyUtilities.convertRowDataToPoints(input);
        }
        return [];
    }


})(this)