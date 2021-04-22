
(function (root) {

    angular.module('configManager-module', ["message-module"]).
    controller('ConfigController', ['$scope', '$http', function ($scope, $http) {
        $scope.$watch('fieldsValues', function () { $scope.isChanged = !angular.equals(originalFieldsValues, $scope.fieldsValues); }, true);

        //holds the original values from server
        var originalFieldsValues;
        function setFieldsValues(fieldsValues) {
            originalFieldsValues = utilities.clone(fieldsValues);
            $scope.fieldsValues = fieldsValues;
            jsoneditor.setValue(fieldsValues);
            $scope.isChanged = false;
            //for unknown reason the saveChange set to true
            setTimeout(function () { $scope.isChanged = false; $scope.$applyAsync(); }, 500);
            // When the value of the editor changes, update the JSON output and validation message
            jsoneditor.on('change', function () {
                //array of validate errors
                var validation_errors = jsoneditor.validate();
                if (validation_errors && validation_errors.length > 0)
                    return;
                $scope.fieldsValues = jsoneditor.getValue();
                $scope.isChanged = !angular.equals(originalFieldsValues, $scope.fieldsValues);
                $scope.$applyAsync();
            });
        }





        //reset the config file to it's default values
        $scope.resetConfig = function () {
            angular.showMessage({
                title: 'Reset config', body: 'Config file will be reset to default values, ok?',
                ok: function (settings, closeDialog) {
                    closeDialog();
                    $scope.message = 'Done';
                    $scope.loadConfig();
                    $http.post('/api/admin/resetConfig').success(function (result) {
                        if (result.error)
                            return $scope.message = result.error;
                        $scope.message = '';
                        setFieldsValues(result.result);
                    }).error(function (err) { $scope.message = err; });
                }
            });
        }

        //Restart server
        $scope.restartServer = function () {
            angular.showMessage({
                title: 'Restart server', body: 'Server will be restarted, ok?',
                ok: function (settings, closeDialog) {
                    $http.post('/api/admin/restartServer').success(function (result) {
                        closeDialog();
                        $scope.message = 'Done';
                    }).error(function (err) { $scope.message = err; closeDialog(); });
                }
            });
        }
        //load the config file from server
        $scope.loadConfig = function () {
            $scope.message = 'loading...';
            $http.get('/api/admin/websiteConfig').success(function (result) {
                if (result.error)
                    return $scope.message = result.error;
                $scope.message = '';
                setFieldsValues(result.result);
            }).error(function (err) { $scope.message = err; });
        }


        //Save the config file to server
        $scope.saveChanges = function () {
            $scope.message = 'Saving...';
            $http.post('/api/admin/websiteConfig', { fieldsValues: $scope.fieldsValues }).success(function (result) {
                if (result.error)
                    return $scope.message = result.error;
                $scope.message = '';
                setFieldsValues($scope.fieldsValues);
            }).error(function (err) { $scope.message = err; });
        }


        $scope.makeLabel = function (name) {
            if (!name || name.length < 2) return name;
            name = name[0].toUpperCase() + name.substring(1);
            return name.match(/[A-Z][a-z]+/g).join(' ');
        }



        angular.ready(function () {
            $scope.loadConfig();
        });

        $(window).bind('beforeunload', function (e) {
            if ($scope.isChanged)
                return "Changes not saved!";
        });
    }]);

})(this)
