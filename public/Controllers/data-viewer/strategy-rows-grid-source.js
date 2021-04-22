(function (root) {

    //This class describe a datasource for a virtual grid, the source store each column data as array


    //Column that has strategyRow
    var StrategyRowGridColumn = root.StrategyRowGridColumn = function (row, points) {
        this.row = row;
        this.points = points;

        this.init(row.query, function (rowIndex) {
            return this.getPoint(rowIndex).y;
        });

        this.length = function () {
            return this.points.length;
        }
        this.hasValue = function (rowIndex) {
            var t = typeof (this.getPoint(rowIndex).y);
            return t == 'string' || t == 'number';
        }
        this.getPoint = function (rowIndex) {
            var instance = this,
              array = instance.points;
            if (rowIndex >= array.length)
                instance.getDefaultValue();
            return array[rowIndex];
        }
        //Update the old points with the new input points
        this.updatePoints = function (newPoints, startIndex) {
            var instance = this,
              length = newPoints.length,
              newPoints = utilities.arrayToObject(newPoints, 'x', 'y'),
              points = instance.points;
            for (var i = 0; i < length; i++) {
                var p = points[startIndex + i];
                if (!p || !newPoints.hasOwnProperty(p.x)) continue;
                p.y = newPoints[p.x] || '';
            }
        }

        this.width = 80;
    }
    StrategyRowGridColumn.prototype = new GridColumn();

    //Column that has time values
    var StrategyRowDateTimeGridColumn = root.StrategyRowDateTimeGridColumn = function (columnKey) {
        this.init(columnKey, function (rowIndex) {
            var column = this.grid.getStrategyRowsColumns()[0];
            if (!column) return this.getDefaultValue();
            return moment.utc(column.getPoint(rowIndex).x).format('YYYY/MM/DD HH:mm');
        });
        this.width = 180;
        this.hasValue = function (rowIndex) {
            return true;
        }
    }
    StrategyRowDateTimeGridColumn.prototype = new GridColumn();

    var StrategyRowsGridSource = root.StrategyRowsGridSource = function (strategy, elementId) {
        var instance = this;
        instance.strategy = strategy;
        instance.elementId = elementId;
    }

    //Extend GridColumnsSource
    StrategyRowsGridSource.prototype = new GridColumnsSource();
    //Add strategy chart functions
    angular.extend(StrategyRowsGridSource.prototype, {

        /**
         * Gets the strategy rows columns
         * 
         * */
        getStrategyRowsColumns: function (strategyRowsArray, callback) {
            var instance = this;
            return instance.getColumnsOfType(StrategyRowGridColumn);
        },
        /**
         * Gets the Definition of the JqxGrid columns
         * 
         * */
        addStrategyRows: function (strategyRowsArray, callback) {
            var instance = this,
              api = instance.strategy.api;

            //load the information of each strategyRow without anydata, because the data will be loaded on demand
            api.getStrategyRow(strategyRowsArray, false, true, function (err, rowsData) {
                if (err) return callback(err);
                //Add the Time column
                if (instance.getColumnsOfType(StrategyRowDateTimeGridColumn).length == 0)
                    instance.addColumn(new StrategyRowDateTimeGridColumn('Time'));
                var addedColumns = rowsData.map(function (strategyRowData) {
                    return instance.addColumn(new StrategyRowGridColumn(strategyRowData.row, strategyRowData.points));
                });

                return callback(undefined, addedColumns);
            });
        },
        /**
         * Add the source array or object as columns
         * 
         * */
        addColumnsSource: function (source) {
            var instance = this;
            if (typeof (source) == 'string')
                source = JSON.parse(source);
            if (Array.isArray(source) && source.length) {
                var keys = Object.keys(source[0]);
                keys.forEach(function (key) {
                    instance.addColumn(new ArrayGridColumn(key, source, key));
                });
            } else if (typeof (source) == 'object') {
                var keys = Object.keys(source);
                keys.forEach(function (key) {
                    if (Array.isArray(source[key]))
                        instance.addColumn(new ArrayGridColumn(key, source[key]));
                });
            }
        },
        /**
         * Creates the jqxGrid using the remote args
         * 
         * */
        createGridFromRemoteArgs: function (args, callback) {
            var instance = this;
            instance.addColumn(new IndexGridColumn('#'));
            if (args.strategyName)
                instance.strategy.setName(args.strategyName);
            //strategy rows data
            if (args.rows) {
                instance.addStrategyRows(StrategyRowInput.ofArray(args), function (err) {
                    if (err) return alert(err);
                    instance.createGrid();
                    if (callback) callback();
                });
            }
            else if (args.data) {
                instance.addColumnsSource(args.data);
                if (callback) callback();
                instance.createGrid();
            }
        },
        /**
         * Invoke grid function, see jqx grid documentation
         * 
         * */
        grid: function () {
            var instance = this,
              element = $('#' + instance.elementId);
            return element.jqxGrid.apply(element, arguments)
        },
        /**
         * Creates the jqx grid
         * 
         * */
        createGrid: function () {
            var instance = this;
            instance.grid({
                width: '100%',
                height: '100%',
                source: instance.getGridSourceDefinition(),
                rendergridrows: function (params) {
                    var startIndex = params.startindex,
                      endIndex = params.endindex;
                    return instance.getGridRowsAsync(startIndex, endIndex, function (err, data) {
                        if (err) alert(err);
                        //Force rendergridrows again
                        instance.grid('updatebounddata');
                    });
                },
                virtualmode: true,
                altrows: true,
                enabletooltips: true,
                columnsresize: true,
                columnsreorder: true,
                selectionmode: 'multiplecellsadvanced',
                columns: instance.getGridColumnsDefinition()
            });
        },
        /**
         * Loads the grid rows data
         * 
         * */
        loadStrategyRowsData: function (startIndex, endIndex, callback) {
            var instance = this,
              columns = instance.getStrategyRowsColumns(),
              api = instance.strategy.api;
            //loads only the columns that does not have values
            columns = columns.filter(function (column) {
                return !column.hasValues(startIndex, endIndex);
            });
            //nothing to update
            if (!columns.length)
                return callback(undefined, columns);
            var strategyRows = columns.map(function (column) {
                var last = Math.min(column.length() - 1, endIndex);
                return StrategyRowInput.of(column.row.rowIndex, {
                    startTime: column.getPoint(startIndex).x,
                    endTime: column.getPoint(last).x + 60000
                });
            });
            //load the information of each strategyRow with data
            api.getStrategyRowsData(strategyRows, function (err, rowsData) {
                if (err) return callback(err);
                //fill the data
                columns.forEach(function (column, i) {
                    column.updatePoints(rowsData[i].points, startIndex);
                });
                callback(undefined, columns);
            });

        },
        /**
         * Gets the grid rows data async
         * 
         * */
        getGridRowsAsync: function (startIndex, endIndex, callback) {
            var instance = this,
              rows = instance.getGridRows(startIndex, endIndex, 'loading...');

            instance.loadStrategyRowsData(startIndex, endIndex, function (err, updatedColumns) {
                rows = instance.getGridRows(startIndex, endIndex);
                if (!updatedColumns.length) return;
                callback(err, rows);
            });
            return rows;
        }
    });



})(this)