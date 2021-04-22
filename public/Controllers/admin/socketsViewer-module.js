(function (root) {
    //store the required variables
    var global = {};

    /**
     * Manage all gridTable's functions
     */
    var SocketsViewerTable=root.SocketsViewerTable = function (scope) {

        this.init({
            responseHandler: function (res) {
                return res.result;
            },

            cookie: true,
            cookieIdTable: 'SocketsViewerTableV1',
            pagination: false,
            //advancedSearch: false,
            //showFooter: false,
            //showHeader: true,
            //striped: true,
            //classes: 'table '
            clickToSelect: true,
            //hideCheckBoxColumn: true,
            height: 50,

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
                checkbox: true,
                sortable:false
                //align: 'left'
            });


            table.addColumn({
                field: 'namespace',
                title: 'Namespace',
                align: 'left'
            });


            table.addColumn({
                field: 'user.username',
                title: 'Username',
                formatter: function (value, row, index) {
                    return '<span class="label label-success" title="User Agent:\n\t' + row['user-agent'].replace(/"/g,'') + '">' + value + '</span>';
                },
                align: 'left'
            });

            table.addColumn({
                field: 'user.fullName',
                title: 'Full Name',
                align: 'left'
            });
            table.addColumn({
                field: 'dateTime',
                title: 'Duration',
                align: 'left',
                formatter: function (value, row, index) {
                    var time=moment.utc(value,'YYYYMMDDTHHmm').local().valueOf();
                   return $.timeago(time)
                }
            });

        }
        

    };

    SocketsViewerTable.prototype = new BootstrapTableWrapper();


    angular.module('SocketsViewer-module', ["message-module"]).
        controller('SocketsViewerController',['$scope', function ($scope) {
            var table = $scope.table = new SocketsViewerTable($scope);
            table.addDefaultsColumn();
            setTimeout(function () {
                table.on('created', function () { table.refreshTable();  });
                table.drawTable('#table_socketsViewer', '#table_socketsViewer_container', '/api/admin/sockets/getOnlineSockets');
               
                $('#table_socketsViewer').on('all.bs.table', function (e, name, args) {
                    $scope.$applyAsync();
                })

            }, 100)
            
            
        }]);


})(this);

