(function (root) {

    angular.module('loading-error-blocks', [])
    .directive('loadingErrorBlocks', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '/static_files/Templates/loading-error-blocks.html?lastModified=20160909T1938',
            link: function (scope) {
                scope.setError = function (error) {
                    scope.status = 'error';
                    scope.error = error;
                    scope.$applyAsync();
                }
                scope.setLoading = function (status) {
                    scope.status = 'loading';
                    scope.statusText = status;
                    scope.$applyAsync();
                }
                scope.setPartLoading = function (status) {
                    scope.status = 'partLoading';
                    scope.partLoadingStatusText = status;
                    scope.$applyAsync();
                }
                scope.setReady = function () {
                    scope.status = 'ready';
                    scope.$applyAsync();
                }

                scope.setReadOrError = function (error) {
                    if (error) scope.setError(error);
                    else scope.setReady();
                }

                setTimeout(function () { angular.isReady = true; }, 100);
            }
        };
    });
    //Show user fridnly error message
    angular.showErrorMessage = function (error) {
        if (typeof (error) == 'object')
            return angular.showErrorMessage(JSON.stringify(error));
        alert(error);
    }

})(this)