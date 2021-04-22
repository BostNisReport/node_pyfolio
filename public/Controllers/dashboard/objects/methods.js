
(function (root) {

    angular.module('libraries-methods-module', []).
    controller('MethodsController', ['$scope', '$http', '$element', methods_Controller]);

    function methods_Controller($scope, $http, $element) {

        //Inilize the part1 grid
        function initPart1Grid() {
            var part1Grid = new GridFromSchema($element.find('.methods-part1-grid'));
            part1Grid.loadSchemaFromObject(part1GridSchema);
            part1Grid.loadDataFromArray(part1GridData);
            part1Grid.createGrid();
        }

        angular.ready(function () {

            initPart1Grid();
        });
    }


    var part1GridSchema = {
        width: '99%',
        //height:'100%',
        columnsresize: true,
       // rowsheight: 110,
        autorowheight: true,
        autoheight: true,
        columns: [
            { text: 'Description', datafield: 'description', type: 'string', width: '120px', cellclassname: headerRowsCellClass},
            { text: 'Link (link to external info)', datafield: 'link', type: 'string', width: '200px', cellsrenderer: linkrenderer, cellclassname: headerRowsCellClass },
            { text: 'Usage', datafield: 'usage', type: 'string', width: '120px', cellclassname: headerRowsCellClass },
            { text: 'Example', datafield: 'example', type: 'array', cellsrenderer: exampleListRenderer, cellclassname: headerRowsCellClass },
            { text: 'Explanation', datafield: 'explanation', type: 'string', cellclassname: headerRowsCellClass },
        ]
    };

    var part1GridData = [
        {
            description: 'Relative Strength Index',
            link: 'http://investopedia\\rsi',
            usage: 'rsi(barsBack)',
            example: ['pf.techs = techStocks', 'techs.rsiValue =  techs -> rsi(10d)', 'pf.techs = techStocks'],
            explanation: 'For each security in the portfolio techStocks, create a value named rsiValue by calculating the rsi with a barsBack value of 10 days.'
        },
        {
            description: 'Bla Bla Bla',
            link: '',
            usage: '',
            example: ['pf.oneLargeCap = ibm'],
            explanation: 'For the portfolio  oneLargeCap, containing only ibm , create a value named rsiValue by calculating the rsi with a barsBack value of 20 minute bars.'
        },
        {
            description: 'Sub header',
            subHeader: true
        }
    ];
    for (var i = 0; i < 50; i++) {
        part1GridData.push(part1GridData[0]);
        part1GridData.push(part1GridData[1]);
        part1GridData.push(part1GridData[2]);
    }

    function exampleListRenderer(row, column, value) {
        if (part1GridData[row].subHeader) return;
        var html = '<ul class="list-group">';
        value.forEach(function (em) { html += '<li class="list-group-item"  style="background-color:transparent!important">' + em + '</li>'; });
        html += '</ul>';
        return html;
    }

    function linkrenderer(row, column, value) {
        if (part1GridData[row].subHeader) return;
        return "<div style='text-align:center;margin-top:50px'><a href='" + value + "' target='_blank'>" + value+"</a></div>";
    }
    function headerRowsCellClass(row, columnfield, value) {
        if (part1GridData[row].subHeader) return 'sub-header-cell';
    }

})(this)