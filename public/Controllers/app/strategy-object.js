(function (root) {

    var StrategyObject = root.StrategyObject = function (strategyName) {
        this.setName(strategyName);
    }

    //Extend EventManager
    StrategyObject.prototype = new EventManager();


    //Add strategy chart functions
    angular.extend(StrategyObject.prototype, {
        /**
         * Sets the strategy's name and re-create api object using that name
         * 
         * @param {String} algorithmText: The strategy's query
         * */
        setName: function (strategyName) {
            var strategy = this;
            strategy.name = strategyName;
            strategy.api = new StrategyObjectAPI(strategyName);
        },
        /**
         * Add new Algorithm row
         * 
         * @param {String} algorithmText: The strategy's query
         * */
        addNewAlgorithm: function (algorithmText, callback) {
            var strategy = this;

            strategy.addNewAlgorithm_busy = true;
            strategy.api.addNewRow(algorithmText, function (err, data) {
                strategy.addNewAlgorithm_busy = false;
                if (err) alert(err);
                else {
                    if (strategy.strategyRowsTable)
                        strategy.strategyRowsTable.refreshStrategyRows();
                }
                if (callback) callback(err, data);
            });
        }
    });



})(this)