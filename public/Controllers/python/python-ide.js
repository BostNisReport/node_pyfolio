(function (root) {


    var CodeFilesTable = function (scope) {
        var table = this;
        this.init({
            responseHandler: function (res) {
                if (res.error) {
                    table.element.trigger('load-error.bs.table', res.error)
                    return [];
                }
                var files = res.result.files;
                files.forEach(function (f) {
                    f.insertDate = moment(f.insertDate).format('YYYY/MM/DD hh:mm A');
                    f.updateDate = moment(f.updateDate).format('YYYY/MM/DD hh:mm A');
                });
                return files;
            },
            uniqueId: 'fileId',
            showFooter: false,
            pagination: false,
            search: false,
            showRefresh: false,
            showColumns: false,
            hideCheckBoxColumn: true,
            sortable: true,
            clickToSelect: true
        });
        /**
           * Add the default columns
           * 
           * 
           * */
        this.addDefaultsColumn = function () {
            var table = this;
            table.options.columns = [];
            table.addColumn({
                field: 'state',
                valign: 'middle',
                radio: true,
                sortable: false
            });
 
            table.addColumn({
                field: 'fileTitle',
                title: 'Filename',
                class: 'no-left-border',
                align: 'left',
                formatter: function (value, row, index) {
                    return '<a class="open-code-file" href="#file=' + value + '" title="Open file\'s code" >' + value + '</a>';
                },
                events: {
                    'click .open-code-file': function (e, value, row, index) {
                        table.emit('openCodeFile', row, index);
                    }
                }
            });
            table.addColumn({
                field: 'insertDate',
                title: 'Created',
                align: 'center'
            });
            table.addColumn({
                field: 'updateDate',
                title: 'Modified',
                align: 'center'
            });
            table.addColumn({
                field: 'fileSize',
                title: 'Size',
                align: 'center'
            });
            table.addColumn({
                field: 'backtests',
                title: 'Backtests',
                align: 'center'
            });
        }

    };

    CodeFilesTable.prototype = new BootstrapTableWrapper();


    angular.module('PythonIDEModule', []).controller('PythonIDEController', ['$scope', '$element','$compile', PythonIDEController_Controller]);

    function PythonIDEController_Controller($scope, $element, $compile) {
        var codeFilesTable;
        $scope.utilities = utilities;
        var inputs=$scope.inputs = {};
        window.$scope = $scope;
        angular.ready(function () {
            $scope.setReady();
           // $scope.setLoading();
            createDockingLayoutControl();
           // setTimeout(function () { $scope.setReady(); }, 500);
        });

        //send the code to server and gets the result
        $scope.runCode = function () {
            var codeEditor = $('#Document1TextArea').data('aceEditor');
            var code = codeEditor.getValue();
            $scope.showLoading = true;
            if (!codeEditor.file)
                codeEditor.file = { fileTitle: moment().format('YYYYMMDDTHHmmss') };
            angular.requests.post('/api/user/kafka/docker/SaveCode', {
                text: code,
                fileId: codeEditor.file.fileId,
                fileTitle: codeEditor.file.fileTitle,
            }, function (err, data) {
                if (err) return angular.showErrorMessage(err);
                codeEditor.file.fileId = data.result.fileId;
                codeFilesTable.refreshTableKeepState();

                angular.requests.post('/api/user/kafka/docker/RunCode', {
                    text: code,
                    fileId: codeEditor.file.fileId
                }, function (err, data) {
                    var html = err || data.result.text;
                    if (html) {
                        html = html.split('\n').join('<br>');
                    }
                    $('#OutputPanelContent').html(html);
                    $scope.showLoading = false;
                });


            });
        }

        //Show a dialog to add new code file
        $scope.createCodeFileDialog = function (callback) {
            angular.showMessage({
                title: "Add new File",
                labelTitle: "Filename",
                value: moment().format('YYYYMMDDTHHmmss'),
                bodyUrl: '/static_files/Templates/input-text-template.html?lastModified=20160909T1938',
                size: 'sm',
                ok: function (settings, close) {
                    settings.isBusy = true;
                    angular.requests.post('/api/user/kafka/docker/SaveCode', { fileTitle: settings.value,text:'# Python' }, function (err, data) {
                        settings.isBusy = false;
                        if (err) return angular.showErrorMessage(err);
                        close();
                        codeFilesTable.refreshTableKeepState();
                        if (callback) callback(err, data);
                    });
                }
            });
        }

        //Delete the current selected row in code files table
        $scope.deleteSelectedFile = function () {
            var selected = $scope.getSelectedCodeFile();
            selected && deleteFile(selected);
        }

        //Gets the current selected row in code files table
        $scope.getSelectedCodeFile = function () {
            return codeFilesTable&& codeFilesTable.bsTable.getSelections()[0];
        }


        //Creates the ace editor control
        function createCodeEditor(scope, element) {

            var targetElement = element.find('.ace-code-editor-div')[0];
            var codeEditor = ace.edit(targetElement);
            element.data('aceEditor', codeEditor);
            codeEditor.setTheme("ace/theme/merbivore_soft");
            codeEditor.getSession().setUseWrapMode(true);
            codeEditor.setReadOnly(false);
            angular.ace_fixWrapMode(codeEditor);
            codeEditor.getSession().setMode("ace/mode/python");
            $(targetElement).sizeChanged(function () {
                codeEditor.resize();
            });
            return codeEditor;
        }

        //Change the code text in editor
        function setCodeBoxValue(editor, codeText) {

            editor.setValue(codeText);
            editor.navigateFileEnd();
            editor.focus();

        }

        //Creates the IDE like layout
        function createDockingLayoutControl() {

            $('#jqxDockingLayout').jqxLayout({
                width: '100%',
                height: '100%',
                layout: dockingLayoutSchema,
                contextMenu: true
            });
           
            //$('#jqxDockingLayout').on('float', function (event) {
            //    var floatedItem = event.args.item;
            //    floatedItem.widget.jqxWindow({ width: 500,height:300 });
            //    floatedItem.width = 500;
            //});
        }
        //Build the Code Files tree control
        function buildCodeFilesTable() {

            window.CodeFilesTable=  codeFilesTable = new CodeFilesTable($scope);
            codeFilesTable.addDefaultsColumn(true);
            var tableElement = $element.find('#FilesPanelTable');
            codeFilesTable.drawTable(tableElement, tableElement.parent());
            tableElement.data('table', codeFilesTable);
            codeFilesTable.refreshTable('/api/user/kafka/docker/ListCode', function (err, data) {
                err && angular.showErrorMessage(err);
                if (!err && data.length) {
                    //Open the file from url
                    var fileTitle = utilities.urlParameters.file || data[0].fileTitle;
                    var file = data.filter(function (row) { return row.fileTitle == fileTitle })[0];
                    var index = file ? data.indexOf(file) : 0;
                    codeFilesTable.bsTable.check(index);
                    loadFile(data[index]);
                }
            });

            codeFilesTable.on('openCodeFile', function (file) {
                loadFile(file, function (err) {
                    if (err) return;
                    var layout = $('#jqxDockingLayout').jqxLayout('layout');
                    layout[0].items[0].items[0].items[0].selected = true
                    $('#jqxDockingLayout').jqxLayout('render');
                });
            });
            codeFilesTable.element.on('all.bs.table', function () {
                //getSelections
                $scope.$applyAsync()
            })
            $compile($('#FilesPanelArea'))($scope);
        }

        //Loads the file's code into the ace editor
        function loadFile(file, callback) {
            var codeEditor = $('#Document1TextArea').data('aceEditor');
            codeEditor.file = file;
            angular.requests.get('/api/user/kafka/docker/GetCode', { fileId: file.fileId }, function (err, data) {
                if (err) angular.showErrorMessage(err);
                else setCodeBoxValue(codeEditor, data.result.text);
                if (callback) callback(err);
            });
        }

        //delete the current opened file
        function deleteFile(file) {

            angular.showMessage({
                title: 'Delete File', body: '\''+file.fileTitle+ '\' will be deleted, ok?',
                ok: function (settings, closeDialog) {
                    closeDialog();

                    var codeEditor = $('#Document1TextArea').data('aceEditor');
                    angular.requests.post('/api/user/kafka/docker/DeleteCode', file, function (err, result) {
                        if (err) return angular.showErrorMessage(err);
                        setCodeBoxValue(codeEditor, '# Select a file from Files panel');
                        codeFilesTable.refreshTableKeepState();
                       
                    });
                }
            });

            
        }


        // the 'layout' JSON array defines the internal structure of the docking layout
        var dockingLayoutSchema = [{
            type: 'layoutGroup',
            orientation: 'horizontal',
            items: [{
                type: 'layoutGroup',
                orientation: 'vertical',
                width: '80%',
                items: [{
                    type: 'documentGroup',
                    height: '100%',
                    minHeight: '20%',
                    items: [{
                        type: 'documentPanel',
                        title: 'Code',
                        contentContainer: 'Document1Panel',
                        initContent: function () {
                            $compile($('#Document1TextArea'))($scope);
                            var codeEditor = createCodeEditor($scope, $('#Document1TextArea'));
                            setCodeBoxValue(codeEditor, 'print("Hello World!")\n');
                            buildCodeFilesTable();
                        }
                    }, {
                            type: 'documentPanel',
                            title: 'Files',
                            contentContainer: 'FilesPanel',
                            initContent: function () {
                               
                            }
                        }]
                }]
            }, {
                    type: 'tabbedGroup',
                    width: '20%',
                    //minWidth: 200,
                    items: [{
                        type: 'layoutPanel',
                        title: 'Output',
                        contentContainer: 'OutputPanel',
                        
                        initContent: function () {
                        }
                    }]
                }]
        }];

      
    }


})(this)