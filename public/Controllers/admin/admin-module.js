(function (root) {

    angular.module('admin-module', [])
    .controller('AdminController', ['$scope', '$http', '$compile', function ($scope, $http, $compile) {
        var tabs = $scope.tabs = {
            selectedTabIndex: 1,
            titles: ['Config', 'Logs', 'Kafka', 'Online Sockets'],
            views: ['configManager.html', 'errorLog.html', 'kafka.html', 'socketsViewer.html']
        }


        //store the already loaded controls
        var addedControls = {};

        $scope.selectSection = function (selectedTabIndex) {
            if (tabs.isLoading) return;
            tabs.selectedTabIndex = selectedTabIndex;
            //if control already opened then show it and return
            if (addedControls[selectedTabIndex])
                return;
            var divId = tabs.titles[selectedTabIndex].replace(' ', '');
            var url = '/view?viewName=admin/' + tabs.views[selectedTabIndex];
            tabs.isLoading = true;
            $.get(url, function (data) {
                var newHtml = $compile('<div style="height:inherit" ng-show="tabs.selectedTabIndex==' + selectedTabIndex + '">' + data + '</div>')($scope);
                $('#contentDiv').append(newHtml);
                addedControls[selectedTabIndex] = 1;
                tabs.isLoading = false;
                $scope.$applyAsync();
            })
            $scope.$applyAsync();
        }
        var page = tabs.views.indexOf(document.URL.split('#')[1]);
        if (page < 0) page = 0;
        $scope.selectSection(page);
        angular.ready(function () { $scope.setReady(); });
    }]);


})(this)