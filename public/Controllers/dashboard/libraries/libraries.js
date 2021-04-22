
(function (root) {

    angular.module('dashboard-libraries-libraries-module', []).
        controller('DashboardLibrariesLibrariesController', ['$scope', '$http', '$element', libraries_Controller]);

    function libraries_Controller($scope, $http, $element) {

        var librariesData = [];
        var part1Grid;
        //Inilize the part1 grid
        function initPart1Grid() {
            part1Grid = new GridFromSchema($element.find('.libraries-methods-table'));
            part1Grid.loadSchemaFromObject(part1GridSchema);
            part1Grid.createGrid(); 

            part1Grid.element.on("cellclick", function (event) {
                var isDetailsButton = $(event.args.originalEvent.target).hasClass('library-item-details-button');
                if (!isDetailsButton) return;
                var libraryRow = librariesData[event.args.rowindex];
                showLibraryDetailsDialog(libraryRow);
            });
        }

        //Show the existing details of this library row
        function showLibraryDetailsDialog(libraryRow) {
            angular.showMessage({
                title: libraryRow.title,
                bodyUrl: '/static_files/Templates/dashboard/libraries/articles/article-details-template.html?lastModified=20170511T2118',
                size: 'lg',
                row: libraryRow,
                hideCancelButton: function () {
                    return true
                },
                backdrop: true,
                ok: function (settings, close) {
                    close();
                }
            });

        }

        angular.ready(function () {

            initPart1Grid();
            part1Grid.grid('showloadelement');
            angular.requests.get('/static_files/files/machine_learning_library_10_16.json?lastModified=20161019T1931', {}, function (err, data) {
                librariesData = data.entries.filter(function (r) { return r.Fields }).map(function (r) {
                    r.Fields.key = r.EntryKey;
                    return r.Fields
                });
                var rows = librariesData.map(function (fields, index) {
                    return {
                        index: index,
                        author: fields.author,
                        title: fields.title,
                        year: fields.year,
                        publisher: fields.publisher,
                        url: fields.url
                    };
                });
                part1Grid.loadDataFromArray(rows);
                part1Grid.createGrid();

              

            });
            
        });
    }



    var part1GridSchema = {
        width: '99%',
        height:'100%',
        columnsresize: true,
       // rowsheight: 60,
        //autorowheight: true,
        //autoheight: true,
        filterable: true,
        sortable:true,
        autoshowfiltericon: true,
        columns: [
            { text: 'Authors', datafield: 'author', align: "center", cellsalign: 'left', type: 'string', width: '200px', cellclassname: rowCellClass },
            { text: 'Title', datafield: 'title', align: "center", cellsalign: 'left', type: 'string', cellclassname: rowCellClass },
            { text: 'Year', datafield: 'year', align: "center", cellsalign: 'center', type: 'number', width: '50px', cellclassname: rowCellClass, filtertype:'list' },
            { text: 'Published In', datafield: 'publisher', align: "center", cellsalign: 'center', type: 'string', width: '120px', cellclassname: rowCellClass, filtertype: 'list' },
            { text: 'Abstract', datafield: 'url', align: "center", type: 'string', width: '90px', cellsrenderer: abstractRenderer, cellclassname: rowCellClass }
        ]
    };


    function abstractRenderer(row, column, value) {
        //if (!value) return '';
        return "<button class='btn btn-default btn-xs centered library-item-details-button'>Details</button>";
    }

    function rowCellClass(row, columnfield, value) {
        
    }



})(this)