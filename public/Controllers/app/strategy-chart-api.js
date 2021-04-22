(function (root) {

    //strategy API object
    var StrategyChartAPI = root.StrategyChartAPI = function (strategyName) {
        this.strategyName = strategyName;
    }

    StrategyChartAPI.prototype = {
        /**
         * Gets the strategy's row data
         * 
         * @param {object} rowsArray: Array of rows options, see StrategyRowInput object
         * */
        getStrategyRowsData: function (rowsArray, callback) {
            var instance = this;
            instance.getStrategyRow(rowsArray, true, false, callback);
        },
        /**
         * Gets the strategy's row information
         * 
         * @param {object} rowsArray: Array of rows options, see StrategyRowInput object
         * */
        getStrategyRow: function (rowsArray, includeData, includeFile, callback) {
            var instance = this;
            async.map(rowsArray, function (row, doneOne) {
                //load one series on document ready
                row = StrategyRowInput.of(row, {
                    strategyName: instance.strategyName,
                    includeData: includeData,
                    includeFile: includeFile
                });
                angular.getApiRequest('/api/kafka/GetRow', row, function (err, r) {
                    if (!err) {
                        r.points = strategyUtilities.convertRowToPoints(r.row);
                        //Delete the days to release the memory
                        delete r.row.days;
                        delete r.row.data;
                    }
                    doneOne(err, r);
                });
            }, callback);
        },
        /**
         * Gets the strategy's rows list
         * 
         * */
        getStrategyRowList: function (callback) {
            var instance = this;
            angular.getApiRequest('/api/kafka/GetStrategy', { strategyName: instance.strategyName }, callback);
        },
        /**
         * Export a series from url to CSV file
         * 
         * @param {Object} strategyRow: The strategyRow object
         * */
        exportStrategyRowData: function (strategyRow, callback) {
            var instance = this;
            instance.getStrategyRowsData([{
                rowIndex: strategyRow.rowIndex
            }], function (err, results) {
                if (err) return callback(err);
                var points = results[0].points;
                var newPoints = points.map(function (p) {
                    return {
                        Date: moment.utc(p.x).format('YYYYMMDD HHmm'),
                        Value: p.y
                    };
                });
                var csv = utilities.JsonToCSVConvertor(newPoints, true);
                utilities.downloadText("Algo " + strategyRow.rowIndex + '.csv', csv);
                callback(undefined, points);
            });
        },

        /**
         * Open the realtime socket
         * 
         * @param {function} onMessage: The callback function when a new message arrived
         * */
        openSocket: function (onMessage) {
            return; //Not ready yet
            var instance = this;
            if (instance.socket) return;
            instance.socket = createSocketClient('chartRealtime', onMessage);
        },

        /**
         * Show a dialog that will add a new row text for the strategy
         * 
         * */
        showAddNewRowTextDialog: function (callback) {
            var instance = this;
            angular.showMessage({
                title: "Add new row",
                labelTitle: "Row text",
                value: "@SPY(c)",
                bodyUrl: '/static_files/Templates/input-text-template.html?lastModified=20160909T1938',
                size: 'sm',
                ok: function (settings, close) {
                    settings.isBusy = true;
                    instance.addNewRow(settings.value, function (err, data) {
                        settings.isBusy = false;
                        if (err) return alert(err);
                        close();
                        if (callback) callback(err, data);
                    });
                }
            });
        },

        /**
         * Add new row for the current strategy
         * 
         * */
        addNewRow: function (rowText, callback) {
            var instance = this;
            angular.getApiRequest('/api/kafka/AddRow', {
                row: rowText,
                strategyName: instance.strategyName
            }, function (err, data) {
                if (err) callback(err);
                else callback(err, data.result);
            });

        },

        /**
         * Delete the curent strategy and refresh the page
         * 
         * */
        deleteStrategy: function (rowText, callback) {
            var instance = this;
            angular.showMessage({
                title: 'Delete strategy',
                body: 'This will delete all the algos and backtests you have entered. OK?',
                size: 'sm',
                ok: function (settings, close) {
                    angular.postApiRequest('/api/kafka/ClearStrategy', {
                        strategyName: instance.strategyName
                    }, function (err) {
                        if (err) return alert(err);
                        close();
                        utilities.reloadPage();
                    });

                }
            });

        }

    }


    //strategy row input for the GetRow api
    var StrategyRowInput = root.StrategyRowInput = function (rowIndex) {
        this.rowIndex = rowIndex;
    }

    StrategyRowInput.prototype = {
        /**
         * Sets the range
         * 
         * */
        setRange: function () {
            var instance = this;
            if (arguments.length == 1)
                instance.range = arguments[0];
            else if (arguments.length == 2) {
                instance.startTime = arguments[0];
                instance.endTime = arguments[1];
            } else if (arguments.length == 3) {
                instance.startTime = arguments[0];
                instance.endTime = arguments[1];
                instance.range = arguments[2];
            }
            return instance;
        },
        /**
         * Combine subsets into one point and return the combined sets
         * 
         * */
        limit: function (maxValues, subsampleType) {
            var instance = this;
            instance.maxValues = maxValues;
            if (subsampleType)
                instance.subsampleType = subsampleType;
            return instance;
        }
    }
    /**
    * Read the row information from this input
    * 
    * @param {object} rowInput: The input source
    * @param {object} moreProperties: Add these properties to the result
    * */
    StrategyRowInput.of = function (rowInput, moreProperties) {
        var obj;
        if (typeof (rowInput) == 'object') {
            obj = new StrategyRowInput(rowInput.rowIndex).
                setRange(rowInput.startTime, rowInput.endTime, rowInput.range).
                limit(rowInput.maxValues, rowInput.subsampleType);
            obj.query = rowInput.query;
            //if the query is zero-centeric query then use 'last' for subsampleType
            if (chartSeriesUtilities.isZeroCentricQuery(rowInput.query))
                obj.subsampleType = 'first';
        }
        else if (Number.isFinite(Number(rowInput)))
            obj = new StrategyRowInput(Number(rowInput));
        else throw "RowInput invalid";

        if (typeof (moreProperties) == 'object')
            obj = angular.merge(obj, moreProperties);
        return obj;
    }
    /**
    * Returns array of StrategyRowInput from the input source
    * 
    * @param {object} rowInput: The input source
    * @param {object} moreProperties: Add these properties to the each item
    * */
    StrategyRowInput.ofArray = function (rowInput, moreProperties) {
        if (Array.isArray(rowInput))
            return rowInput.map(function (row) { return StrategyRowInput.of(row, moreProperties); });
        if (typeof (rowInput) == 'object') {
            var rows = rowInput.rows || [];
            if (!Array.isArray(rows))
                rows = [rows];
            return StrategyRowInput.ofArray(rows, rowInput);
        }
    }


})(this)