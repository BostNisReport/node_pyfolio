
(function (root) {

    angular.module('dashboard-libraries-data-module', []).
        controller('DashboardLibrariesDataController', ['$scope', '$http', '$element', data_Controller]);

    function data_Controller($scope, $http, $element) {

        var input = $scope.input = {
            categories: ['Indicators', 'Machina Functions', 'ML Packages', 'Python Packages', 'Statistical Packages'],
            selectedCategory: '',
            selectCategory: function (category) {
                input.selectedCategory = category;
                filterGrid(category);
            }
        };
        var gridHandler;

        //Inilize the categories grid
        function initGrid() {
            gridHandler = new GridFromSchema($element.find('.sectors-details-grid'));
            gridHandler.loadSchemaFromObject(gridSchema);
            gridHandler.createGrid();

            var initCategory = input.categories[0];
            gridHandler.grid('showloadelement');
            loadData(initCategory, function (err, list) {
                gridHandler.grid('hideloadelement');
                if (err) return angular.showErrorMessage(err);
                gridHandler.loadDataFromArray(list);
                gridHandler.createGrid();
                gridHandler.grid('sortby', 'description', 'asc');
                input.selectCategory(initCategory);
            });
        }

        function loadData(fileName, callback) {
            angular.requests.get('/static_files/Controllers/dashboard/' + fileName + '.json?version=' + moment().valueOf(), {}, function (err, list) {
                if (!err)
                    list.forEach(function (c) { c.Sector = fileName; });
                callback(err, list);
            });
        }

        function filterGrid(sectorName) {

            gridHandler.grid('clearfilters');
            var filtergroup = new $.jqx.filter();
            var filter = filtergroup.createfilter('stringfilter', sectorName, 'equal');
            filtergroup.addfilter(1, filter);

            // add the filters.
            gridHandler.grid('addfilter', 'Sector', filtergroup);
            // apply the filters.
            gridHandler.grid('applyfilters');
        }


        angular.ready(function () {
            initGrid();
        });


    }


    var gridSchema = {
        width: '100%',
        height: '98%',
        enabletooltips: true,
        columnsresize: true,
        selectionmode: 'multiplecellsadvanced',
        sortable: true,
        // autorowheight: true,
        //autoheight: true,
        //rowsheight:50,
        columns: [
            { text: 'Sector', datafield: 'Sector', width: 120, type: 'string', hidden: true },
            { text: 'Description', datafield: 'description', width: 300, type: 'string' },
            { text: 'Name', datafield: 'name', width: 120, type: 'string' },
            { text: 'Param1', datafield: 'param1', width: 100, type: 'string' },
            { text: 'Param2', datafield: 'param2', width: 100, type: 'string' },
            { text: 'Param3', datafield: 'param3', width: 100, type: 'string' },
            { text: 'Usage', datafield: 'usage', type: 'string' },
        ]
    };

})(this);



    //(function (root) {

    //    angular.module('dashboard-libraries-data-module', []).
    //        controller('DashboardLibrariesDataController', ['$scope', '$http', '$element', data_Controller]);

    //    function data_Controller($scope, $http, $element) {

    //        var input = $scope.input = {
    //            categories: [],
    //            selectedCategory: '',
    //            selectCategory: function (category) {
    //                input.selectedCategory = category;
    //                filterGrid(category);
    //            }
    //        };
    //        var gridHandler;

    //        //Inilize the categories grid
    //        function initGrid() {
    //            gridHandler = new GridFromSchema($element.find('.sectors-details-grid'));
    //            gridHandler.loadSchemaFromObject(gridSchema);
    //            gridHandler.createGrid();

    //            gridHandler.grid('showloadelement');
    //            angular.requests.get('/static_files/Controllers/dashboard/gics-simple.json?lastModified=20170511T2118', {}, function (err, list) {
    //                gridHandler.grid('hideloadelement');
    //                if (err) return angular.showErrorMessage(err);
    //                list.forEach(function (l) {
    //                    if (input.categories.indexOf(l.Sector) < 0)
    //                        input.categories.push(l.Sector);
    //                });
    //                gridHandler.loadDataFromArray(list);
    //                gridHandler.createGrid();
    //                input.selectCategory(input.categories[0]);
    //            });
    //        }

    //        function filterGrid(sectorName) {

    //            gridHandler.grid('clearfilters');
    //            var filtergroup = new $.jqx.filter();
    //            var filter = filtergroup.createfilter('stringfilter', sectorName, 'equal');
    //            filtergroup.addfilter(1, filter);

    //            // add the filters.
    //            gridHandler.grid('addfilter', 'Sector', filtergroup);
    //            // apply the filters.
    //            gridHandler.grid('applyfilters');
    //        }


    //        angular.ready(function () {
    //            initGrid();
    //        });


    //    }


    //    var gridSchema = {
    //        width: '100%',
    //        height: '98%',
    //        enabletooltips: true,
    //        columnsresize: true,
    //        // autorowheight: true,
    //        //autoheight: true,
    //        //rowsheight:50,
    //        columns: [
    //            { text: 'Sector Code', datafield: 'Sector Code', width: 90, type: 'number' },
    //            { text: 'Sector', datafield: 'Sector', width: 120, type: 'string' },
    //            { text: 'Industry Group Code', datafield: 'Industry Group Code', width: 90, type: 'number' },
    //            { text: 'Industry Group', datafield: 'Industry Group', width: 120, type: 'string' },
    //            { text: 'Industry Code', datafield: 'Industry Code', width: 90, type: 'number' },
    //            { text: 'Industry', datafield: 'Industry', width: 120, type: 'string' },
    //            { text: 'Sub-Industry Code', datafield: 'Sub-Industry Code', width: 90, type: 'number' },
    //            { text: 'Sub-Industry', datafield: 'Sub-Industry', width: 120, type: 'string' },
    //            { text: 'Description', datafield: 'Description', type: 'string', width: 300 }
    //        ]
    //    };

    //})(this)