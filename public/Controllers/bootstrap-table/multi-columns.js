/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * extensions: https://github.com/vitalets/x-editable
 */

!function ($) {
    
    'use strict';
    
    $.extend($.fn.bootstrapTable.defaults, {
        //onEditableInit: function () {
        //    return false;
        //}
    });
    
    $.extend($.fn.bootstrapTable.Constructor.EVENTS, {
        //'editable-init.bs.table': 'onEditableInit'
    });
    
    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initTable = BootstrapTable.prototype.initTable,
        _initBody = BootstrapTable.prototype.initBody;
    
    BootstrapTable.prototype.initTable = function () {
        var that = this;
        _initTable.apply(this, Array.prototype.slice.apply(arguments));
    };
    
    BootstrapTable.prototype.initBody = function () {
        var that = this;
        _initBody.apply(this, Array.prototype.slice.apply(arguments));
        that.resetTable();
    };
    
    BootstrapTable.prototype.resetTable = function () {
        var that = this,
            columns = that.getColumnsChildren(),
            columnsBuffer = that.options.columns[0].map(function (col) { return col; });
        columns.forEach(function (col) {
            if (!col.children.length) return;
            var colspan = 0;
            col.children.forEach(function (child) {
                if (child.visible)
                    colspan++;
            });
            col.parent.colspan = colspan;
            if (!colspan) {
                var index = that.options.columns[0].indexOf(col.parent);
                that.options.columns[0].splice(index, 1);
            }
                
        });
        that.initHeader();
        that.resetView();
        that.options.columns[0] = columnsBuffer;
    };
    //Gets array of columns each one include it's children
    BootstrapTable.prototype.getColumnsChildren = function () {
        var that = this,
            columns = [],
            innerIndex = 0;
        that.options.columns[0].forEach(function (col) {
            var children = [];
            var colspan = col.colspanBuffer || col.colspan;
            if (colspan) {
                col.colspanBuffer = colspan;
                var nextInnerIndex = Number(colspan) + innerIndex;
                
                for (var i = innerIndex; i < nextInnerIndex; i++) {
                    children.push(that.options.columns[1][i]);
                }
                innerIndex = nextInnerIndex;
            }
            columns.push({
                parent: col,
                children: children
            });
        });
        return columns;
    };


}(jQuery);