(function (root) {

    angular.module('AppModule', []).controller('AppController', ['$scope', app_function]);

    function app_function($scope) {

        $scope.collapseNavbar = function (elementId) {
            if (!$('#' + elementId).attr('aria-expanded'))
                return;
            $('#' + elementId).collapse('hide');
        }
        $scope.utilities = utilities;
        $scope.strategies = [new StrategyObject('default')];
        /**
         * Open a strategy, draw it's defualt chart and show it's rows
         * 
         * @param {object} strategy: The strategy object
         * */
        $scope.openStrategy = function (strategy) {

            $scope.currentStrategy = strategy;
            if (strategy.isLoaded) return;
            $scope.setLoading();
            strategy.isLoaded = true;
            var chartsTab = new StrategyChartTabsManager(strategy);
            if (strategy.strategyRowsTable)
                onStrategyRowsTableCreated(strategy);
            else
                strategy.once('strategyRowsTableCreated', function (table) {
                    onStrategyRowsTableCreated(strategy);
                });
        }

        function onStrategyRowsTableCreated(strategy) {
            var table = strategy.strategyRowsTable;
            table.refreshStrategyRows(function (err, rows) {
                if (err) return $scope.setError(err);
                //If user has no rows then add the default spy(c) row
                if (!rows.length) {
                    //This function defined in strategy-directives file
                    strategy.addNewAlgorithm('Spy(c)', function (err, newRow) {
                        table.refreshStrategyRows();
                        table.emit('drawRow', newRow);
                    });
                } else table.emit('drawRow', rows[0]);
                $scope.setReady();
            });
        };

        /**
         * Create a sample table using the element id
         * 
         * @param {function} callback: Invoked after selecting a new strategy
         * */
        function showSelectStrategyDialog(callback) {
            angular.showMessage({
                title: 'Select strategy',
                bodyUrl: '/static_files/Templates/app/select-strategy-template.html?lastModified=20160909T1938',
                //  size: 'lg',
                strategies: $scope.strategies,
                selectStrategy: function (strategy) {
                    $scope.strategies.forEach(function (m) {
                        m.selected = m == strategy;
                    });
                    this.alertMessage = '';
                },
                hideCancelButton: function () {
                    return true
                },
                backdrop: false,
                ok: function (settings, close) {
                    var selectedStrategy = $scope.strategies.filter(function (s) {
                        return s.selected;
                    })[0];
                    if (!selectedStrategy)
                        settings.alertMessage = 'Please select one strategy!';
                    else {
                        close();
                        if (callback) callback(selectedStrategy);
                    }
                }
            });
        }

        //select-strategy-template

        $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
            angular.ready(function () {
                $scope.openStrategy($scope.strategies[0]);
                return;
                var strategyId = utilities.urlParameters.strategy;
                var strategy = $scope.strategies.filter(function (strategy) {
                    return strategy.name == strategyId;
                })[0];
                if (strategyId && strategy)
                    $scope.openStrategy(strategy);
                else showSelectStrategyDialog(function (strategy) {
                    $scope.openStrategy(strategy);
                });
            });
        });

    }

})(this)
