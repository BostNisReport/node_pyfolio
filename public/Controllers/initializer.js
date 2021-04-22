(function (root) {

    //This file must be invoked before all controllers!

    var requiredModules = [],
        requiredCallbacks = [];

    //Store the registered modules, http://stackoverflow.com/questions/24889783/angularjs-get-list-of-all-registered-modules
    (function (orig) {
        angular.modules = [];
        angular.module = function () {
            if (arguments.length > 1) {
                angular.modules.push(arguments[0]);
            }
            return orig.apply(null, arguments);
        }
    })(angular.module);

    angular.events = new EventManager();

    //Invoked after all modules loaded
    angular.ready = function (callback, requireReady) {
        var allLoaded = requiredModules.every(function (m) { return window[m]; }) &&
            requiredCallbacks.every(function (m) { return m(); }) &&
            (!requireReady || requireReady());
        if (angular.isReady && allLoaded)
            return callback();
        setTimeout(function () { angular.ready(callback, requireReady); }, 100);
    };
    //Make sure the object is set and then invoke the callback
    angular.require = function (objectName) {
        if (requiredModules.indexOf(objectName)>=0) return;
        requiredModules.push(objectName);
    }
    //Make sure the input callback is loaded and then invoke the callback
    angular.requireReady = function (callback) {
        if (requiredCallbacks.indexOf(callback)>=0) return;
        requiredCallbacks.push(callback);
    }
    //bootstrap themodules or ready
    $(document).ready(function () {
        $(document.body).append('<div id="render-finished-div" render-finished></div>');
        angular.bootstrap(document.body, [].concat(angular.modules));
    });


})(this)