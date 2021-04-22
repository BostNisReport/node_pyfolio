
(function (root) {

    angular.module('errorLog-module', ["message-module"]).
    controller('errorLogController', ['$scope', '$http', function ($scope, $http) {

        /*
         *load logs data 
         *
         */
        $scope.loadLogs = function () {
            $scope.message = 'loading...';
            $http.post('/api/admin/getErrorLogs').success(function (data) {
                if (data.error) return $scope.message = data.error;
                $scope.logsData = data.result || 'No logs';
                $scope.message = '';
                $scope.$applyAsync();
            }).error(function (err) { $scope.message = err; });
        }

        /*
         *clear logs data 
         *
         */
        $scope.clearLogs = function () {
            $scope.message = 'Removing logs...';
            $http.post('/api/admin/clearErrorLogs').success(function (data) {
                if (data.error) return $scope.message = data.error;
                $scope.logsData = 'Logs removed';
                $scope.message = '';
                $scope.$applyAsync();
            }).error(function (err) { $scope.message = err; });
        }


        $scope.loadLogs();

    }]);

})(this)