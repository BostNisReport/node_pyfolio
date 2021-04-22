
(function (root) {

    angular.module('user-edit-profile-module', []).
        controller('UserEditProfileController', ['$scope', '$http', '$element', userEditProfile_Controller]);

    function userEditProfile_Controller($scope, $http, $element) {

        $scope.showUserEditProfileDialog = function () {

            angular.requests.get('/api/user/getAccount', {}, function (err, data) { editProfileDialog(data.result); });
        }

        function editProfileDialog(account) {
            var accountEmail = account.email;
            var settings = {
                title: 'Account',
                bodyUrl: '/static_files/Templates/user-edit-profile-template.html?lastModified=20170511T2118',
                //size: 'sm',
                account: account,
                okButtonText: 'Save',
                sendPasswordResetEmail: function () {
                    settings.resetPasswordEmailSentMessage = settings.resetPasswordEmailFailMessage = '';
                    sendPasswordResetEmail(function (err) {
                        settings.resetPasswordEmailSentMessage = !err ? 'Please check your email inbox for your reset password link.' : '';
                        settings.resetPasswordEmailFailMessage = err ? err : '';
                        $scope.$applyAsync();
                    });
                },
                ok: function (settings, close) {

                    if (!settings.verifyEmailToekn && accountEmail != account.email) {
                        settings.verifyEmailToekn = true;
                        angular.requests.post('/api/user/sendChangeEmail', { newEmail: account.email }, function (err) {
                            settings.saveAccountFailedMessage = err ? err : '';
                        });
                    }
                    else settings.save(settings, close);
                },
                save: function (settings, close) {
                    saveAccount(settings.account, function (err) {
                        settings.saveAccountFailedMessage = err ? err : '';
                        if (!err) {
                            close();
                            $('#userDisplayName').html(settings.account.firstName + ' ' + settings.account.lastName);
                        }
                    });
                }
            };
            angular.showMessage(settings);
        }

        function sendPasswordResetEmail(callback) {
            angular.requests.post('/api/user/sendPasswordResetEmail', {}, callback);
        }

        function saveAccount(account, callback) {
            angular.requests.post('/api/user/saveAccount', { account: account }, callback);
        }
    }

})(this)