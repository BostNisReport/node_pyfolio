(function (root) {

    angular.module('ngCookiesModule', ['ngCookies']).controller('UserSettingsController', ['$scope', '$timeout', userSettings_Controller]);
    var settingsTemplate;
    function userSettings_Controller($scope, $timeout) {
        $scope.utilities = utilities;
        

        angular.ready(function () {
            $scope.setLoading();
            angular.requests.get('/static_files/grid-schema/backtestSettings_template.json?lastModified=20160909T1938', {}, function (err, data) {
                if (err) return $scope.setError(err);
                settingsTemplate = data;
                angular.requests.get('/api/user/settings/listUserSettings', {}, function (err, data) {
                    if (err) return $scope.setError(err);
                    $scope.settingsRoots = data.list;
                    $scope.settingsItems = [];
                    data.list.forEach(function (root) {
                        $scope.settingsItems.push(new UserSettingsItem(root.name, 'default', $scope));
                    });
                    $scope.setReady();
                });
            });


        });
        //Opens this root and view it's sub-tree content
        $scope.openSettingsRoot = function (root) {
            $scope.selectedRoot = root;
            $scope.selectedItem = $scope.settingsItems.filter(function (item) {
                return item.rootName == root.name;
            })[0];
            $scope.selectedItem.select();
        }
        $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
            var root = $scope.settingsRoots[0];
            $scope.openSettingsRoot(root);
        });

        window.onbeforeunload = function (event) {
            var hasChanges = $scope.settingsItems.some(function (c) {
                return c.hasChanges();
            });
            if (!hasChanges) return;
            var message = 'Important: Please click on \'Save\' button to leave this page.';
            if (typeof event == 'undefined') {
                event = window.event;
            }
            if (event) {
                event.returnValue = message;
            }
            return message;
        };
    }


    var counter = 0;
    //User settings object
    function UserSettingsItem(rootName,name, $scope) {
        this.name = name;
        this.rootName = rootName;
        this.elementName = 'user_settings_div_' + counter++;
        this.gridBuilder = new GridFromSchema(this.elementName);
        this.$scope = $scope;
    }

    UserSettingsItem.prototype = {
        //Show this item in UI
        select: function () {
            var instance = this,
                $scope = instance.$scope;
            
            $scope.selectedItem = instance;
            if (instance.isLoaded)
                return;
            $scope.setPartLoading();
            instance.isLoaded = true;
            angular.requests.get('/api/user/settings/getUserSettings', {
                path: instance.rootName + '.' + (instance.isNew ? 'default' : instance.name)
            }, function (err, data) {
                if (err) return alert(err);
                instance.setData(settingsTemplate, data.result.settings);
                instance.createGrid();
                $scope.setReady();
            });
        },
        //Sets the  data and append empty rows to the end
        setData: function (settingsTemplate, settingsValues) {
            var instance = this,
                keys = Object.keys(settingsTemplate),
                gridRows = [];

            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                var row = angular.merge({ Setting: k }, settingsTemplate[k], { Value: settingsValues[k] });
                gridRows.push(row);
            }
            instance.template = settingsTemplate;
            instance.values = settingsValues;
            instance.gridRows = gridRows;
        },
        //Gets or Sets whether the settings changed by user
        hasChanges: function () {
            var instance = this;
            if (arguments.length > 0)
                instance.changed = arguments[0];
            else return instance.changed;
        },
        //Check if the value is valid
        validateValue: function (cell, value) {
            var instance = this,
                gridBuilder = instance.gridBuilder,
                row = gridBuilder.rowAt(cell.row),
                template = instance.template[row.Setting],
                validation = template.Validation;

            if (validation == 'number') {
                return {
                    result: value && value.trim() != '' && Number.isFinite(Number(value)),
                    message: 'Please enter valid number'
                };
            }
            if (validation == 'list') {
                return {
                    result: template.AcceptedValues.split(',').indexOf(value) >= 0,
                    message: 'Valid values are ' + template.AcceptedValues
                };
            }
            return true;
        },
        //Create a grid viewer for the settings
        createGrid: function () {
            var instance = this,
              gridBuilder = instance.gridBuilder;
            var schemaURL = '/static_files/grid-schema/backtestSettings_schema.txt?lastModified=20160909T1938';
            gridBuilder.loadDataFromArray(instance.gridRows);
            gridBuilder.gridSource.updaterow = function (rowid, rowdata, commit) {
                var key = rowdata.Setting;
                instance.values[key] = rowdata.Value;
                instance.hasChanges(true);
                setTimeout(function () { instance.save(); }, 100);
                instance.$scope.$applyAsync();
                commit(true);
            }
            gridBuilder.loadSchemaFromURL(schemaURL, function (err) {
                if (err) return alert(err);
                gridBuilder.columnOfField('Value').validation = function (cell, value) { return instance.validateValue(cell, value); }
                gridBuilder.createGrid();

            });
        },
        //Save the settings to server
        save: function () {
            var instance = this,
              name = instance.name,
              $scope = instance.$scope;
            if (!instance.hasChanges())
                return;

            if (instance.isNew) {
                name = prompt("Please enter the name of the new backtesting settings", name);
                if (!name) return;
                instance.name = name;
            }
            $scope.saveStatus = 'progress';
            angular.requests.post('/api/user/settings/setUserSettings', {
                path: instance.rootName+'.'+name,
                settings: instance.values
            }, function (err) {
                $scope.saveStatus = err ? 'error' : 'ok';
                if (!err) {
                    instance.isNew = false;
                    instance.hasChanges(false);
                    setTimeout(function () {
                        $scope.saveStatus = '';
                        $scope.$applyAsync();
                    }, 5000);
                }
                $scope.$applyAsync();
            });
        }
    }


})(this)