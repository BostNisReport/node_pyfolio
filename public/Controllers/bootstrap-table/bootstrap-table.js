(function (root) {

    /**
 * Manage all gridTable's functions
 */
    var BootstrapTableWrapper = root.BootstrapTableWrapper = function () {

        /**
         * Invoke a function
         * 
         * 
         * */
        this.fn = function (functionName, params) {
            var table = this;
            return table.element.bootstrapTable(functionName, params);
        };


        /**
         * Init the table
         * 
         * @param {object} newOptions: The new options
         * 
         * */
        this.init = function (newOptions) {
            var table = this;


            //The default options for a column
            table.columnDefaultOptions = {
                align: 'center',
                valign: 'middle',
                sortable: true,
            };


            //The table's options
            table.options = {
                // data: rowsArray,
                responseHandler: function (res) {
                    return res.result || res;
                },
                classes: 'table table-hover table-no-bordered',
                cache: false,
                //height: $('.table-container').height(),
                striped: true,
                pagination: true,
                pageSize: 5,
                pageList: [5, 10, 25, 50, 100, 200],
                search: true,
                advancedSearch: utilities.isMobile(),
                showColumns: true,
                showRefresh: true,
                minimumCountColumns: 2,
                //clickToSelect: true,
                showHeader: true,
                //showFooter: !utilities.isMobile(),
                showPaginationSwitch: false,
                // showToggle: true,
                maintainSelected: true,
                // showExport: true,
                //  exportTypes: ['json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'powerpoint', 'pdf'],
                // showFilter: true,
                cookieExpire: '9y',
                //  showMultiSort:true,
                columns: []
            };

            if (newOptions)
                table.mergeOptions(newOptions);
        }

        /**
         * Merge a new options into the existing options
         * 
         * @param {object} newOptions: The new options
         * 
         * */
        this.mergeOptions = function (newOptions) {
            var table = this;
            angular.merge(table.options, newOptions);
        }


        /**
         * Add new column to the table
         * 
         * @param {object} columnOptions: The column's options
         * @param {boolean} subColumns: Is it a sub column?
         * */
        this.addColumn = function (columnOptions, subColumns) {
            var table = this;
            columnOptions = angular.merge({}, table.columnDefaultOptions, columnOptions);
            if (table.options.columns.length == 0) {
                table.options.columns.push([], []);
            }
            var index = subColumns ? 1 : 0;
            table.options.columns[index].push(columnOptions);

        }
        /**
         * Start drawing the table
         * 
         * @param {DOM} element: The dom element to draw the chart in
         * @param {DOM} containerElement: The dom element that contains the table
         * @param {string} rowsListUrl: The url that returns the rows list
         * 
         * @return {object}: the options of the created table (see Bootstrap table options)
         * */
        this.drawTable = function (element, containerElement, rowsListUrl) {
            var table = this;

            table.options.height = $(containerElement).height();
            table.element = $(element);
            table.options.url = rowsListUrl;
            table.fn(table.options);
            //the div that has a class 'table-container'
            $(containerElement).sizeChanged(function (oldSize, newSize) {
                if (newSize.height < 10) return;
                table.fn('getOptions').height = newSize.height;
                table.fn('resetView');
            });
            table.element.on('reset-view.bs.table', function () {
                if (table.options.hideCheckBoxColumn)
                    table.element.find('.bs-checkbox').hide();
            });
            table.fn('resetView');
            //Gets the actual bootstrab table
            table.bsTable = table.element.data('bootstrap.table')
            table.emit('created', table);
            return table.fn('getOptions');
        };


        /**
         * Toggle column by show/hide
         * 
         * @param {string} field: The column's field
         * 
         * */
        this.toggleColumn = function (field) {
            var bsTable = this.bsTable;
            var column = bsTable.columns.filter(function (col) { return col.field == field; })[0];
            if (!column) return;
            if (!column.visible)
                bsTable.showColumn(field);
            else bsTable.hideColumn(field);
        };
        /**
    
        /**
         * Refresh the table
         * 
         * @param {string} rowsListUrl: The url that returns the rows list
         * 
         * */
        this.refreshTable = function (rowsListUrl, loadCallback) {
            var table = this;
            if (typeof (rowsListUrl) == 'function') {
                loadCallback = rowsListUrl;
                rowsListUrl = undefined;
            }

            if (loadCallback) {
                table.element.one('load-success.bs.table', function (args, rows) {
                    table.element.off('load-error.bs.table');
                    loadCallback(undefined, rows);
                });
                table.element.one('load-error.bs.table', function (args, error) {
                    table.element.off('load-success.bs.table');
                    loadCallback(error);
                });
            }
            if (rowsListUrl) table.rowsListUrl = rowsListUrl;
            table.fn('refresh', { url: table.rowsListUrl });
        };

         /**
         * Refresh the table
         * 
         * @param {string} rowsListUrl: The url that returns the rows list
         * 
         * */
        this.refreshTableKeepState = function (loadCallback) {
            var table = this;
            var selections = table.getSelections();
            var oldRows = table.getRows();
            table.refreshTable(function (err,data) {
                if (!err && selections) {
                    var newRows = table.getRows();
                    selections.forEach(function (row) {
                        var index = oldRows.indexOf(row);
                        if (index < newRows.length)
                            table.bsTable.check(index);
                    });
                }
                if (loadCallback) loadCallback(err, data);
            });
        };
        /**
         * getSelections
         * 
         * 
         * */
        this.getSelections = function () {
            var table = this;
            return table.fn('getSelections');
        };
        /**
     * Gets the rows
     * 
     * 
     * */
        this.getRows = function (useCurrentPage) {
            var table = this;
            return table.fn('getData', { useCurrentPage: useCurrentPage });
        };
        /**
         * Delete the following rows by it's fields values
         * 
         * @Param {string} fieldName : The name of the field
         * @Param {Array} fieldValues : The values of the field
         * */
        this.deleteRows = function (fieldName, fieldValues) {
            var table = this;
            if (!Array.isArray(fieldValues)) fieldValues = [fieldValues];
            table.fn('remove', {
                field: fieldName,
                values: fieldValues
            });
        };

    };

    BootstrapTableWrapper.prototype = new EventManager();

})(this)