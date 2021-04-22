(function (root) {

    angular.module('Dashboard_LibrariesModule', []).
        directive('dashboardLibraries', ['$http', '$compile', function ($http, $compile) {
            return {
                restrict: 'A',
                templateUrl: '/static_files/Templates/dashboard/libraries-template.html?lastModified=20170512T0811',
                replace: false,
                //This must be passed in the invoker place
                scope: {},
                link: function (scope, element, attr) {
                    libraries_Controller(scope, $http, $compile, element);
                }
            }
        }]);

    function libraries_Controller($scope, $http, $compile, element) {
        var tabs=$scope.tabs = {
            selectedView: 0,
            views: [
                //{ title: 'Library', url: '/static_files/Templates/dashboard/libraries/articles/library.html?lastModified=20170511T2118',active:true },
                //{ title: 'Tools', url: '/static_files/Templates/dashboard/libraries/tools.html?lastModified=20170511T2118' },
                { title: 'Backtests', url: '/static_files/Templates/dashboard/libraries/backtests.html?lastModified=20170512T0811', active: true },
                { title: 'Data', url: '/static_files/Templates/dashboard/libraries/data.html?lastModified=20170511T2118', active: true },
                { title: 'Settings', url: '/static_files/Templates/dashboard/libraries/settings.html?lastModified=20170511T2118' },
                { title: 'Downloads', url: '/static_files/Templates/dashboard/libraries/downloads.html?lastModified=20170511T2118', active: true}
            ],
            getSelectedView: function () { return this.views[this.selectedView]; },
            //Select this tab and loads it's content
            selectTab: function (viewIndex) {
                var tabs = this;
                if (tabs.isLoading) return;
                tabs.selectedView = viewIndex;
                var view = tabs.getSelectedView();
                //If the view already loaded then return
                if (view.uiControl) return;
                tabs.isLoading = true;
                angular.requests.get(view.url, {}, function (error, data) {
                    if (!error) {
                        var newHtml = $compile('<div class="fill-height" ng-show="tabs.selectedView==' + viewIndex + '">' + data + '</div>')($scope);
                        element.find('.content-div').append(newHtml);
                        view.uiControl = 1;
                    }
                    tabs.isLoading = false;
                    $scope.$applyAsync();
                })
                $scope.$applyAsync();
            }
        }

        angular.ready(function () {
            var selectedTab = utilities.urlParameters.tab || tabs.views[0].title;
            var viewIndex = tabs.views.findIndex(function (c) { return c.title == selectedTab });
            $scope.tabs.selectTab(viewIndex);
        });

    }


})(this)
