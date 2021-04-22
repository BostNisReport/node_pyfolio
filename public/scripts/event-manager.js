(function (root) {

    var EventManager = function () { };

    EventManager.prototype = {
        // public methods
        on: function (eventName, fn) {
            var instance = this;
            if (!instance.listeners) instance.listeners = {};
            if (!instance.listeners[eventName]) {
                instance.listeners[eventName] = [];
            }
            if (fn instanceof Function) {
                instance.listeners[eventName].push(fn);
            }
            return instance;
        },
        once: function (eventName, fn) {
            var instance = this;
            var myFunc = function () {
                fn.apply(instance, arguments);
                instance.removeListener(eventName, myFunc);
            }
            instance.on(eventName, myFunc)
            return instance;
        },
        emit: function () {
            var instance = this;
            if (!instance.listeners) instance.listeners = {};
            var args = [],
              eventName = arguments[0],
              eventHandlers = instance.listeners[eventName] || [];
            for (var i = 1; i < arguments.length; i++)
                args.push(arguments[i]);
            [].concat( eventHandlers).forEach(function (fn) {
                fn.apply(instance, args);
            });

        },
        removeListener: function (eventName, fn) {
            var instance = this;
            if (!instance.listeners) return;
            if (!fn) {
                //remove the whole event
                delete instance.listeners[eventName];
            } else {
                //remove the specific function
                var eventHandlers = instance.listeners[eventName] || [];
                eventHandlers.some(function (fn1, index) {
                    if (fn1 != fn) return false;
                    eventHandlers.splice(index, 1);
                    return true;
                });
            }
        }
    };

    root.EventManager = EventManager;


})(this);

(function ($) {
    $.fn.isBound = function (type, handleFunction) {
        var element = this;

        var bond = $._data(element.get(0), 'events')[type].some(function (e) {
            return e.handler == handleFunction;
        });


        return bond;
    };
}(jQuery));