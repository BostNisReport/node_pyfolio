//this is a Jquery plugin to add context menu using jqx widgets
//usage $().contextMenu(function(){})


(function ($) {

    $.fn.contextMenu = function (template, handler, openCondition) {
        var element = this;
        if (element[0] && element[0].on)
            element = element[0];
        var menu = setContextMenu(template, element, openCondition);
        if (handler) handler(menu);
        return element;
    };

    function setContextMenu(template, containerJQuery, openCondition) {
        if (typeof (template) == 'string')
            template = $(template);
        var contextMenu = template.jqxMenu({
            width: '130px',
            autoOpenPopup: false,
            mode: 'popup',
            theme: window.jqxTheme
        });

        contextMenu.open = function (checkRightClick) {
            var rightClick = !checkRightClick || isRightClick(event);
            if (rightClick) {
                var scrollTop = $(window).scrollTop();
                var scrollLeft = $(window).scrollLeft();
                contextMenu.jqxMenu('open', parseInt(event.clientX) + 5 + scrollLeft, parseInt(event.clientY) + 5 + scrollTop);
                return false;
            }
        }
        //show/hide menu item
        contextMenu.showItem = function (itemId, value) {
            if (value)
                contextMenu.find('#' + itemId).show();
            else contextMenu.find('#' + itemId).hide();
        }
        //set menu item text
        contextMenu.itemText = function (itemId, value) {
            contextMenu.find('#' + itemId).html(value);
        }
        // open the context menu when the user presses the mouse right button.
        containerJQuery.on('mousedown', function (event) {
            if (!openCondition || openCondition()) {
                event.stopPropagation();
                contextMenu.open(true);
            }
        });
        // disable the default browser's context menu.
        containerJQuery.on('contextmenu', function (e) {
            return false;
        });
        //Close the context menu when click outside
        containerJQuery.on('click', function (event) {
            contextMenu.jqxMenu('close');
        });
        return contextMenu;
    }

    function isRightClick(event) {
        var rightclick;
        if (!event) var event = window.event;
        if (event.which) rightclick = (event.which == 3);
        else if (event.button) rightclick = (event.button == 2);
        return rightclick; //|| $.jqx.mobile.isTouchDevice();
    }

}(jQuery));
