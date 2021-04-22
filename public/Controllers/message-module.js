(function (root) {

    /**
     * Define an angualjs module called 'message-module' which used to show popups dialogs.
     * Usage: Attach the service 'MessageService' into your controller and then call angular.showMessage(settings)
     *
     */
    angular.module('message-module', ['ui.bootstrap', 'ngSanitize']).
        controller('MessageInstanceController', ['$scope', '$uibModalInstance', 'settings', function ($scope, $uibModalInstance, settings) {
            $scope.settings = settings
            $scope.ok = function () {
                if (settings.ok) {
                    settings.ok($scope.settings, function () {
                        $uibModalInstance.close();
                    });
                }
                else $uibModalInstance.close();
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
                if (settings.cancel) settings.cancel();
            };
        }])

    .factory('MessageService', ['$uibModal', function ($uibModal) {
        //Show a popup dialog using the settings param
        //@param settings will be assigned into the popup template's scope also it contains some informtion about the popus as:
        //      templateUrl: the template html url in case you wish to use custom template
        //      size:   the size of the popup, 'sm' for small popup and 'lg' for large popup and empty for normal popup
        angular.showMessage = function (settings) {
            settings = settings || {};
            if (!settings.templateUrl)
                settings.templateUrl = '/static_files/Templates/message-template.html?lastModified=20161029T2048';
            var modal = $uibModal.open({
                templateUrl: settings.templateUrl,
                controller: 'MessageInstanceController',
                size: settings.size,
                keyboard: settings.keyboard,
                backdrop: settings.backdrop,
                resolve: {
                    settings: function () {
                        return settings;
                    }
                }
            });
            modal.settings = settings;
            return modal;
        }
        return angular.showMessage;

    }]).
    run(['MessageService', function (MessageService) { }]);


})(this)