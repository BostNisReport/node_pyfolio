(function (root) {

    //this moudle assume you have the jqx-splitter control files and JQuery 

    angular.module('jqx-splitter-module', ['ngCookies'])
        .directive('mySplitter', ['$interpolate', '$cookies', splitter_function]);


    function splitter_function($interpolate, $cookies) {

        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                function eval(val) {
                    if (val) {
                        val = $interpolate(val)(scope);
                        if (val == "false") return false;
                        if (angular.isNumber(val))
                            val = Number(val);
                    }
                    return val;
                }
                window.scope = scope;
                var orientation = attr.orientation || 'horizontal',
                    showSplitBar = attr.showSplitBar || 'true',
                    saveCookieName = attr.saveCookieName,
                    panelsElements = element.children(),
                    panels = [];


                panelsElements.each(function (index, elm) {
                    var collapsible = eval($(elm).attr('collapsible')),
                        collapsed = eval($(elm).attr('collapsed')),
                        size = eval($(elm).attr('size')),
                        min = eval($(elm).attr('min')||'3');

                    panels.push({
                        collapsible: collapsible,
                        collapsed: collapsed,
                        size: size,
                        min: min
                    });
                });
                var options = {
                    theme: window.jqxTheme,
                    width: '100%',
                    height: '100%',
                    orientation: orientation,
                    showSplitBar: eval(showSplitBar),
                    panels: ((saveCookieName && $cookies.getObject(saveCookieName)) || panels)
                };
                var splitter = element.jqxSplitter(options);

                splitter.on('resize expanded collapsed', function (e) {
                    if (e.target != element[0]) return;
                    var sizeSum = 0, anyCollopsed = e.args.panels.some(function (p) { return p.collapsed; });
                    for (var i = 0; i < options.panels.length; i++)
                        sizeSum += e.args.panels[i].size;
                    for (var i = 0; i < options.panels.length; i++) {
                        options.panels[i].collapsed = e.args.panels[i].collapsed;
                        if (!anyCollopsed)
                            options.panels[i].size = (100 * e.args.panels[i].size / sizeSum) + '%';
                    }
                    if (saveCookieName)
                        $cookies.putObject(saveCookieName, options.panels);
                });
            }
        }
    }
    //    .directive('myJqxSplitter',['$timeout',function ($timeout) {

    //    function resetSplitter(element, value) {
    //        if (!value||!element || !element.length) return;
    //        var settings = angular.copy(value);
    //        var events = settings.events || {};
    //        delete settings.events;
    //        if (!settings.theme)
    //            delete settings.theme;
    //        element.jqxSplitter(settings);
    //        Object.keys(events).forEach(function (e) {
    //            element.on(e, events[e]);
    //        });
    //    }

    //    return {
    //        restrict: 'A',
    //        scope: {
    //            jqxSettings:'=jqxSettings'
    //        },
    //        link: function (scope, element, attr) {

    //            var resetSplitter_timeout = utilities.timeout(function (value) {
    //                if (element.lastHTMLLength != document.body.innerHTML.length) {
    //                    element.lastHTMLLength = document.body.innerHTML.length
    //                    resetSplitter_timeout.touch(value);
    //                }
    //                if (!element.jqxSplitter('panels'))
    //                    resetSplitter(element, value);
    //                element.jqxSplitter('refresh');
    //            }, 1000);

    //            scope.$watch('jqxSettings', function (value) {
    //                resetSplitter_timeout.touch(value);
    //            });
    //            resetSplitter_timeout.touch(scope.jqxSettings);
    //        }
    //    }
    //}])

})(this)