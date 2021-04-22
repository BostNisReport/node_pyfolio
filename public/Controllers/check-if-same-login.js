(function (root) {

    //This module support api calls
    angular.module('check-if-same-login', []).
        factory('CheckIfSameLogin', [function () {

            /**
             * Check if it's same login
             * 
             * @param {string} username: The username to check with
             * @param {function} callback: The callback function that will handle the error and data
             * */
            function checkIfSameLogin(username, callback) {
                //check if the user is not the same as the passed username
                angular.requests.get('/me', {}, function (err, data) {
                    var account = data.account;
                    if (!username || account.username === username)
                        return callback && callback();
                    angular.showMessage({
                        title: 'Username conflict',
                        body: 'You are logged into <a href="https://charts.machi.na">https://charts.machi.na</a> with a different Machina username, do you want to switch to ' + username + '?',
                        ok: function (settings, closeDialog) {
                            closeDialog();
                            $.post('/logout', function () { utilities.reloadPage(); });
                        },
                        cancel: function () { callback && callback() }
                    });
                });
            }

            angular.checkIfSameLogin = checkIfSameLogin;
            return checkIfSameLogin;
        }]).
    run(['CheckIfSameLogin', function (CheckIfSameLogin) { }]);


})(this)