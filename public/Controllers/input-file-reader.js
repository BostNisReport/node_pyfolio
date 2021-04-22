(function (root) {

    angular.module('input-file-reader', []).
    directive('inputFileReader', [function () {
        var slice = Array.prototype.slice;

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return;
                element.on('fileLoaded', function (event, err, textFiles) {
                    ngModel.$setViewValue(textFiles);
                });
                element.bind('change', utilities.readInputFiles); //change

            } //link
        }; //return
    }]);


})(this)