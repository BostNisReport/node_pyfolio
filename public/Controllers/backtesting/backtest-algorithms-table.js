(function (root) {

    /**
  * Manage all gridTable's functions
  */
    var BacktestAlgorithmsTable = root.BacktestAlgorithmsTable = function (scope) {

        this.init({
            responseHandler: function (res) {
                if (!res.result) return [];
                return res.result.rows;
            },
            uniqueId: 'rowId',
            clickToSelect: true,
            cookieIdTable: 'BacktestAlgorithmsTableV2',
            cookie: true,
            pagination: false,
            search: true,
            showColumns: true,
            showRefresh: true,
            advancedSearch: false,
            showFooter: false,
            showHeader: true,
            striped: true,
            sortable: true,
            classes: 'table table-border',
            hideCheckBoxColumn: true
            // height:400
        });

        this.getRowById = function (rowId) {
            return this.fn('getRowByUniqueId', rowId);
        }
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
                radio: true,
                sortable: false,
                rowspan: utilities.isMobile() ? 1 : 2,
            });


            table.addColumn({
                field: 'rowIndex',
                title: 'Backtest',
                align: 'left',
                class: 'no-left-border',
                rowspan: utilities.isMobile() ? 1 : 2,
                formatter: function (value, row, index) {
                    return '<a class="openBacktest" href="javascript:void(0)" style="margin-right:3px;text-decoration: none;font-size:large" title="Open this backtest" >' + value + '</a>';
                },
                events: {
                    'click .openBacktest': function (e, value, row, index) {
                        table.emit('openBacktest', row, index);
                    }
                }
            });

            table.addColumn({
                field: 'export',
                title: 'Export',
                titleTooltip: 'Export the time series to CSV file',
                clickToSelect: false,
                width: 50,
                searchable: false,
                sortable: false,
                rowspan: utilities.isMobile() ? 1 : 2,
                formatter: function (value, row, index) {
                    var imageUrl = row.loadingExport ? 'loading.gif' : 'export16.png';
                    var imageClass = row.loadingExport ? '' : 'exportRow';
                    return '<a class="' + imageClass + '" href="javascript:void(0)" style="margin-right:3px" title="Export the time series to CSV file" ><img style="width:16px" src="/static_files/images/' + imageUrl + '"/></a>';
                },
                events: {
                    'click .exportRow': function (e, value, row, index) {
                        if (table.fn('getData').some(function (row) { return row.loadingExport; }))
                            return alert('Sorry, we only allow one download at a time. Thanks for your patience!');
                        table.emit('exportRow', row, index);
                    }

                }
            });



            if (utilities.isMobile()) {
                var names = ['profitLoss_oneYear', 'sharpe_oneYear', 'tradesDay_oneYear', 'winLoss_oneYear'];
                var titles = ['Return', 'Sharpe', 'Trades/Day', 'Win/Los'];
                var formatters = [utilities.percentFormatter, utilities.numberFormatter, utilities.numberFormatter];
                for (var i = 0; i < names.length; i++) {
                    table.addColumn({
                        field: 'stats.' + names[i],
                        title: titles[i],
                        align: 'center',
                        formatter: formatters[i]
                    });
                }
            } else {
                var names = ['profitLoss_', 'sharpe_', 'tradesDay_', 'winLoss_'];
                var titles = ['Return', 'Sharpe', 'Trades/Day', 'Win/Los'];
                var typesNames = ['threeMonths', 'sixMonths', 'oneYear'];
                var typesTitles = ['3 mo', '6 mo', '1 y'];
                var formatters = [utilities.percentFormatter, utilities.numberFormatter, utilities.numberFormatter];
                for (var i = 0; i < names.length; i++) {
                    table.addColumn({
                        title: titles[i],
                        align: 'center',
                        colspan: 3,
                        sortable: false
                    });
                    for (var j = 0; j < typesNames.length; j++) {
                        table.addColumn({
                            field: 'stats.' + names[i] + typesNames[j],
                            title: typesTitles[j],
                            align: 'center',
                            formatter: formatters[i]
                        }, true);
                    }
                }

            }

        }
    };

    BacktestAlgorithmsTable.prototype = new BootstrapTableWrapper();

})(this)