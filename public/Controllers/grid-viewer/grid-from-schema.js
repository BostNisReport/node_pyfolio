(function (root) {

    //This file build a grid from xml schema file

    var GridFromSchema = root.GridFromSchema = function (element) {
        this.element = element;
        this.gridSource = {};
        this.tooltipInvoker = utilities.timeout(function (instance, element) {

            var row = instance.rowOfElement(element.parentElement);
            var column = instance.columnOfElement(element);

            if (!column.tooltip || element.alreadyTooltiped)
                return;
            element.alreadyTooltiped = true;

            var text = '';
            if (typeof (column.tooltip) == 'function')
                text = column.tooltip(row, column);
            else text = column.tooltip.toString();
            $(element).jqxTooltip({ position: 'mouse', content: text });
            $(element).jqxTooltip('open');
        }, 300);
    }

    GridFromSchema.prototype = {

        /**
         * Invoke grid function, see jqx grid documentation
         * 
         * */
        grid: function () {
            var instance = this,
                element = instance.element instanceof jQuery ? instance.element : $('#' + instance.element);
            return element.jqxGrid.apply(element, arguments)
        },
        /**
         * Gets the row's data that bounded to this element
         * 
         * */
        rowOfElement: function (rowHtmlElement) {
            var instance = this,
                elm = $(rowHtmlElement);
            //Check if the elemnt is valid row
            if (!elm.find('.jqx-grid-cell').length)
                return;
            var rowIndex = instance.grid('getrowboundindex', elm.index());
            return instance.rowAt(rowIndex);
        },
        /**
        * Gets the row's data that bounded to this index
        * 
        * */
        rowAt: function (rowIndex) {
            var instance = this,
                localdata = instance.gridSource.localdata;
            if (localdata && localdata[rowIndex])
                return localdata[rowIndex];
            else return instance.grid('getrowdata', rowIndex);
        },
        /**
         * Gets the column's data that bounded to this element
         * 
         * */
        columnOfElement: function (cellHtmlElement) {
            var instance = this,
                schema = instance.schema,
                elm = $(cellHtmlElement);
            //Check if the elemnt is valid cell
            if (!elm.hasClass('jqx-grid-cell'))
                return;
            return schema.columns[elm.index()];
        },
        /**
        * Gets the column's data by it's datafield
        * 
        * */
        columnOfField: function (datafield) {
            var instance = this,
                schema = instance.schema;
            return schema.columns.filter(function (column) {
                return column.datafield == datafield;
            })[0];
        },
        /**
         * Parse the json schema
         * 
         * */
        loadSchemaFromObject: function (xmlSchemaObject) {
            var instance = this,
                schema = xmlSchemaObject,
                gridSource = instance.gridSource;

            gridSource.datafields = schema.columns.map(function (column) {
                return { name: column.datafield, type: column.type || 'string' };
            });
            schema.columns.forEach(function (column) {
                if (!column.readonly) return;
                column.cellbeginedit = function () { return false; }
            });
            schema.cellhover = function (cellhtmlElement, x, y) {
                instance.tooltipInvoker.touch(instance, cellhtmlElement);
            }
            instance.schema = schema;
        },
        /**
         * Parse the json schema
         * 
         * */
        loadSchemaFromText: function (xmlSchemaText) {
            return this.loadSchemaFromObject(eval('ttt=' + xmlSchemaText));
        },
        /**
         * Parse the json schema
         * 
         * */
        loadSchemaFromURL: function (url, callback) {
            var instance = this;
            $.get(url, function (data) {

                try {
                    instance.loadSchemaFromText(data);
                    callback();
                }
                catch (err) { callback(err); }

            }).fail(function () { callback('Falied to load ' + url) });
        },
        /**
         * Load the grid's data from json source
         * 
         * */
        loadDataFromURL: function (dataUrl, datatype) {
            var instance = this,
                gridSource = instance.gridSource;
            gridSource.url = dataUrl;
            gridSource.datatype = datatype || 'json';
        },
        /**
        * Load the grid's data from array
        * 
        * */
        loadDataFromArray: function (array) {
            var instance = this,
                gridSource = instance.gridSource;
            gridSource.localdata = array;
            gridSource.datatype = 'array';
        },
        /**
         * Create a grid using the dom element
         * 
         * */
        createGrid: function (callback) {
            var instance = this,
                schema = instance.schema,
                 gridSource = instance.gridSource;
            schema.source = gridSource;
            instance.grid(schema);
        }
    }


})(this)