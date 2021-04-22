(function (root) {

    /**
* Manage all gridTable's functions
*/
    var BacktestStatsTable = root.BacktestStatsTable = function (scope) {

        this.init({
            responseHandler: function (res) {
                return res.result.rows;
            },
            cookie: true,
            cookieIdTable: 'BacktestStatsTableV1',
            pagination: false,
            search: false,
            showColumns: false,
            showRefresh: false,
            advancedSearch: false,
            showFooter: false,
            showHeader: true,
            striped: true,
            sortable: false,
            classes: 'table table-no-border table-no-bordered'
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
                field: 'stats',
                title: 'Stats',
                align: 'left'
            });
            var names = ['threeMonths', 'sixMonths', 'oneYear'];
            var titles = ['3 mo', '6 mo', '1 y'];
            for (var i = 0; i < names.length; i++) {
                table.addColumn({
                    field: names[i],
                    title: titles[i],
                    align: 'left'
                });
            }

        }
        function percentFormatter(value, row, index) {
            if (!value || !Number.isFinite(value))
                return value;
            return (Math.round(Number(value) * 1000000) / 10000) + '%';
        }

    };

    BacktestStatsTable.prototype = new BootstrapTableWrapper();

})(this)