(function (root) {

    //This class describe a datasource for a virtual grid, the source store each column data as array

    var GridColumnsSource = root.GridColumnsSource = function () {
        //Store columns
        this.columns = [];
    }

    GridColumnsSource.prototype = {

        /**
         * Adds or update column data
         * 
         * @param {GridColumn} column: Must be instanceof GridColumn
         * */
        addColumn: function (column) {
            var instance = this,
              columns = instance.columns;

            if (!(column instanceof GridColumn))
                throw "Must be instance of GridColumn object";
            var columnIndex = instance.getColumnIndex(column.key);
            column.grid = instance;
            if (columnIndex < 0)
                columns.push(column);
            else columns[columnIndex] = column;
            return column;
        },
        /**
         * Removes column from source
         * 
         * @param {string} columnKey: The data field of the source data
         * */
        removeColumn: function (columnKey) {
            var instance = this,
                columns = instance.columns,
                index = instance.getColumnIndex(columnKey);
            columns.splice(index, 1);
        },
        /**
         * Removes column from source
         * 
         * @param {string} columnKey: The data field of the source data
         * */
        getColumn: function (columnKey) {
            var instance = this,
                columns = instance.columns;
            return columns.filter(function (column) { return column.key == columnKey; })[0];
        },
        /**
        * Clear the source
        * 
        * */
        clear: function () {
            var instance = this;
            instance.columns = [];

        },
        /**
         * Removes column from source
         * 
         * @param {string} columnKey: The data field of the source data
         * */
        getColumnIndex: function (columnKey) {
            var instance = this,
                columns = instance.columns,
                column = instance.getColumn(columnKey);
            if (!column) return -1;
            return columns.indexOf(column);
        },
        /**
         * Gets the columns of type
         * 
         * */
        getColumnsOfType: function (columnType) {
            var instance = this,
                columns = instance.columns;
            return columns.filter(function (column) { return column instanceof columnType; });
        },
        /**
         * Gets the total rows count within this source
         * 
         * */
        getTotalRowsCount: function () {
            var instance = this,
                columns = instance.columns;
            count = 0;
            instance.columns.forEach(function (column) {
                count = Math.max(count, column.length());
            });
            return count;
        },
        /**
         * Format the value to text
         * 
         * */
        formatValue: function (value) {
            if (!value) return value;
            if (value instanceof Date)
                return value.toLocaleString();
            return value;
        },
        /**
         * Gets the grid's object at this rowIndex
         * 
         * @param {number} rowIndex: The 0-based rowIndex
         * @param {any} defaultValue: The default value of the column in case it's null
         * */
        getGridRow: function (rowIndex, defaultValue) {
            var instance = this,
                columns = instance.columns,
                row = {},
                key,
                value;
            columns.forEach(function (column) {
                key = column.key;
                value = column.getValue(rowIndex);
                if (value == undefined || value == null)
                    value = defaultValue;
                row[key] = instance.formatValue(value);
            });
            return row;
        },
        /**
         * Gets the grid's rows between start and end rowIndex
         * 
         * @param {number} startIndex: The 0-based rowIndex
         * @param {number} endIndex: The 0-based rowIndex
         * @param {any} defaultValue: The default value of the column in case it's null
         * */
        getGridRows: function (startIndex, endIndex, defaultValue) {
            var instance = this,
                rowsCount = instance.getTotalRowsCount(),
                rows = [];
            for (var i = startIndex; i < endIndex ; i++) {
                if (i >= rowsCount) break;
                rows.push(instance.getGridRow(i, defaultValue));
            }
            return rows;
        },
        /**
         * Gets the Definition of the JqxGrid source
         * 
         * */
        getGridSourceDefinition: function () {
            var instance = this;
            return {
                totalrecords: instance.getTotalRowsCount()
            }
        },
        /**
         * Gets the Definition of the JqxGrid columns
         * 
         * */
        getGridColumnsDefinition: function () {
            var instance = this;
            return instance.columns.map(function (c, i) {
                var obj = {
                    text: c.key,
                    datafield: c.key,
                    align: 'center',
                    pinned: i == 0
                }
                if (c.width) obj.width = c.width;
                return obj;
            })
        }
    }

    //Column object for the grid
    var GridColumn=root.GridColumn=function (columnKey, valueGetter) {
        this.init(columnKey, valueGetter);
    }

    GridColumn.prototype = {
        /**
         * Initial the column object
         * 
         * @param {string} columnKey: The column's key
         * */
        init: function (columnKey, valueGetter) {
            var instance = this;
            instance.key = columnKey;
            instance.valueGetter = valueGetter;
        },
        /**
         * Gets the column's value at this rowIndex
         * 
         * @param {number} rowIndex: The 0-based rowIndex
         * */
        getValue: function (rowIndex) {
            var instance = this;
            if (instance.valueGetter)
                return instance.valueGetter(rowIndex);
            return instance.getDefaultValue(rowIndex);
        },
        /**
         * Checks if the column has value at this rowIndex
         * 
         * @param {number} rowIndex: The 0-based rowIndex
         * */
        hasValue: function (rowIndex) {
            return false;
        },
        /**
        * Check if the rows has been loaded
        * 
        * */
        hasValues: function (startIndex, endIndex) {
            var instance = this;
            endIndex = Math.min(instance.length() - 1, endIndex)
            for (var i = startIndex; i < endIndex; i++) {
                if (!instance.hasValue(i)) return false;
            }
            return true;
        },
        /**
         * Gets the column's default value at this rowIndex
         * 
         * @param {number} rowIndex: The 0-based rowIndex
         * */
        getDefaultValue: function (rowIndex) {
            return null;
        },
        /**
         * Gets how many records are in this column
         * 
         * */
        length: function () {
            return 0;
        }
    }
    //Column object for index column
    var IndexGridColumn=root.IndexGridColumn=function (columnKey) {
        this.init(columnKey, function (rowIndex) { return rowIndex; });
        this.hasValue = function (rowIndex) { return true; }
        this.width = 50;
    }
    IndexGridColumn.prototype = new GridColumn();

    //Column that has data as array of values
    var ArrayGridColumn=root.ArrayGridColumn= function (columnKey, array, fieldName) {
        this.init(columnKey, function (rowIndex) {
            var instance = this;
            if (rowIndex >= array.length)
                instance.getDefaultValue();
            var value = array[rowIndex];
            return fieldName ? value[fieldName] : value;
        });

        this.length = function () {
            return array.length;
        }
        this.hasValue = function (rowIndex) { return rowIndex < array.length; }

        this.width = 80;
    }
    ArrayGridColumn.prototype = new GridColumn();



})(this)