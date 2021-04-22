(function (root) {

    var chartSeriesUtilities = root.chartSeriesUtilities = {};

    /**
     * Return array of series data from array of objects
     * 
     * Example:
     *    Input: var rows=     [
     *                           {dateTime: '2014..09:31', spy:50,goog:100},
     *                           {dateTime: '2014..09:32', spy:51,goog:105},
     *                           {dateTime: '2014..09:33', spy:52,goog:103},
     *                         ]
     *    Output: var result = {
     *                           spy: [{x: '2014..09:31',y: 50 },{x: '2014..09:32',y: 51 },{x: '2014..09:33',y: 52 }],
     *                          goog: [{x: '2014..09:31',y: 100 },{x: '2014..09:32',y: 105 },{x: '2014..09:33',y: 103 }]
     *                         }
     *
     * */
    chartSeriesUtilities.getSeriesFromRows = function (rows) {

        //Find the object keys and set them as series names
        var keysNames = Object.keys(rows[0]);
        var obj = {};
        var dateTimeField = expectDateTimeField(keysNames);
        keysNames.splice(keysNames.indexOf(dateTimeField), 1)
        var result = {};
        keysNames.forEach(function (series, index) {
            var seriesData = rows.map(function (row) {
                obj = {
                    x: utilities.parseDateTime(row[dateTimeField],true),
                    y: utilities.parseNumber(row[series])
                };
                return obj;
            });
            result[series] = seriesData;
        });
        return result;
    }

    /**
     * Parse Series object from CSV text format
     * 
     * Sample:
     * Date,symbol1,symbol2,...
     * 2014/10/21 09:31, 10,25
     * 2014/10/21 09:32, 11,24
     * 2014/10/21 09:33, 10.5,26
     *
     * */
    chartSeriesUtilities.parseSereisFromCsv = function (csvText) {
        
        
        var rows = utilities.CSVToJsonConvertor(csvText);
        //if no header, then add default header
        if (rows && rows.length) {
            var keys = Object.keys(rows[0]);
            var test = utilities.parseDateTime(keys[0]);
            if (Number.isFinite(test)) {
                csvText = 'Date,Value\n' + csvText;
                rows = utilities.CSVToJsonConvertor(csvText);
            }
        }
        var series = chartSeriesUtilities.getSeriesFromRows(rows);
        return series;
    }


    /**
     * Checks if the points has negative values
     * 
     * */
    chartSeriesUtilities.hasNegativeValues = function (points) {
        return points.some(function (p, index) {
            return p.y < 0
        });
    }

    /**
     * if it's zero centric then add color green for >0 and red < 0
     * 
     * */
    chartSeriesUtilities.isZeroCentricQuery = function (query) {
        return query && query.indexOf('tern') > 0
    }



    function expectDateTimeField(keysNames, stop) {
        var expectedNames = ['x', 'datetime','date'];
        var dateTimeName = keysNames.filter(function (name) {
            var n = name.replace(/ /g, '').toLowerCase();
            if (expectedNames.indexOf(n) >= 0)
                return name;
        })[0];
        return dateTimeName || keysNames[0];
    }

})(this)
