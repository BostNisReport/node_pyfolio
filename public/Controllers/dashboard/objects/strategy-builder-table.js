(function (root) {

    /**
         * Show the created strategies in a table
         */
    var StrategyBuilderTable = root.StrategyBuilderTable = function (scope) {
        var table = this;
        this.init({
            uniqueId: 'rowId',
            cookieIdTable: 'strategyBuilderRowsTableV1',
            cookie: true,
            clickToSelect: true,
            showFooter: false,
            pagination: false,
            search: false,
            showRefresh: false,
            showColumns: false,
            hideCheckBoxColumn: true,
            sortName: 'rowIndex',
            sortOrder: 'desc'
        });
        /**
           * Add the default columns
           * 
           * 
           * */
        this.addDefaultsColumn = function () {
            var table = this;
            table.options.columns = [];
            table.addColumn({
                field: 'state',
                valign: 'middle',
                checkbox: true,
                sortable: false
            });

            table.addColumn({
                field: 'strategyName',
                title: 'Strategy Name',
                titleTooltip: 'The strategy name',
                class: 'no-left-border',
                align: 'left'
            });

            table.addColumn({
                field: 'gainLoss',
                title: 'Gain/Loss',
                align: 'center',
                formatter: function (value, row, index) {
                    return value+'%';
                }
            });

            table.addColumn({
                field: 'sharpe',
                title: 'Sharpe',
                align: 'center'
            });

            table.addColumn({
                field: 'sortino',
                title: 'Sortino',
                align: 'center'
            });

            table.addColumn({
                field: 'factors',
                title: 'Factors',
                align: 'left'
            });


        }
        
    };

    StrategyBuilderTable.prototype = new BootstrapTableWrapper();


})(this)