(function (root) {
    
    angular.module('Dashboard_CodeBoxModule', []).
        directive('dashboardCodeBox', ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                templateUrl: '/static_files/Templates/dashboard/code-box/code-box-template.html?lastModified=20170512T0811',
                replace: false,
                scope: {
                    chartAreaId: '@'
                },
                link: function (scope, element, attr) {

                    angular.ready(function () {
                        createCodeEditor(scope, element);
                        dashboardCodeBox_AfterReady(scope, element);
                    });
                    
                }
            }
        }]);

    var defaultStrategy = new StrategyObject('default');
    //Creates the ace editor control
    function createCodeEditor(scope, element) {

        var targetElement = element.find('.strategy-builder-code-editor')[0];
        var codeEditor = ace.edit(targetElement);
        element.data('codeBox', codeEditor);
        codeEditor.setTheme("ace/theme/chrome");
        codeEditor.getSession().setUseWrapMode(true);
        codeEditor.setReadOnly(true);
        fixWrapMode(codeEditor);
        //codeEditor.getSession().setMode("ace/mode/javascript");
        $(targetElement).sizeChanged(function () {
            codeEditor.resize();
        });

        codeEditor.setStrategyRows = function (rows) {
            var lines = rows.map(function (row) {
                return row.query;
            });
            setCodeBoxValue(codeEditor, lines.join('\n') + "\n");
        }

        //setReadOnlyExceptLastLine(codeEditor);
        //handleEnterEvent(scope, codeEditor);


    }


    function dashboardCodeBox_AfterReady(scope, element) {
        var chartTabsManager = $('#' + scope.chartAreaId).data('chart');
        var codeEditor = element.data('codeBox');

        //Opens a .csv file and draw it as a new trendline
        scope.importCsvFile = function () {
        }

        function uploadDataToSW() {
        }

        scope.removeStrategy = function () {
            defaultStrategy.api.deleteStrategyDialog(true);
        }
        //Charts the selected line
        scope.chartSelectedLine = function () {
            var range = codeEditor.getSelectionRange();
            var lastLineIndex = codeEditor.session.getLength() - 1;
            if (lastLineIndex == range.start.row) return alert('Please add the line before chart it');
            scope.chartLine(range.start.row+1);
        }

        //Charts the selected line
        scope.chartLine = function (lineNumber) {
           
            scope.showLoading = true;
            chartTabsManager.drawRowInTab(undefined, {
                rowIndex: lineNumber
            }, function () {
                scope.showLoading = false;
                scope.$applyAsync();
            });
        }
    }

    //Force ace to highlight the wrapped lines
    function fixWrapMode(editor) {

        editor.setOption("highlightActiveLine", false)
        Range = ace.require("ace/range").Range
        editor.$updateHighlightActiveLine = function () {
            var session = this.getSession();

            var highlight;
            if (this.$highlightActiveLine) {
                if ((this.$selectionStyle != "line" || !this.selection.isMultiLine()))
                    highlight = this.getCursorPosition();
                if (this.renderer.$maxLines && this.session.getLength() === 1 && !(this.renderer.$minLines > 1))
                    highlight = false;
            }

            if (session.$highlightLineMarker && !highlight) {
                session.removeMarker(session.$highlightLineMarker.id);
                session.$highlightLineMarker = null;
            } else if (!session.$highlightLineMarker && highlight) {
                var range = new Range(highlight.row, 0, highlight.row, Infinity);
                range.id = session.addMarker(range, "ace_active-line", "fullLine");
                session.$highlightLineMarker = range;
            } else if (highlight) {
                session.$highlightLineMarker.start.row = highlight.row;
                session.$highlightLineMarker.end.row = highlight.row;
                session.$highlightLineMarker.start.column = 0;
                session._signal("changeBackMarker");
            }
        }
        editor.setOption("highlightActiveLine", true)


    }

    //Change the code text in editor
    function setCodeBoxValue(editor, codeText) {

        editor.setValue(codeText);
        editor.navigateFileEnd();
        editor.focus();

    }

    //Make the code-box readonly except when the cursor moves to last line
    function setReadOnlyExceptLastLine(editor) {

        editor.on("changeSelection", function () {
            var range = editor.getSelectionRange();
            var lastLineIndex = editor.session.getLength() - 1;
            var isNotInLastLine = range.start.row !== lastLineIndex || range.end.row !== lastLineIndex;
            editor.setReadOnly(isNotInLastLine);
        });

        editor.container.addEventListener("keydown", function (e) {
            if (e.code !== 'Backspace') return;
            var range = editor.getSelectionRange();
            var isFirstColumn = range.start.column == 0 || range.end.column == 0;
            if (isFirstColumn) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true)
    }

    //After pressing 'Enter' then add the line to model
    function handleEnterEvent(scope, editor) {

        var resetSaveStatusMessage = utilities.timeout(function () {
            scope.saveStatus = '';
            scope.$applyAsync()
        }, 5000);


        editor.container.addEventListener("keydown", function (e) {
            if (e.code !== 'Enter') return;
            editor.navigateFileEnd();
            var codeValue = editor.getValue();
            var lines = codeValue.split('\n');
            var lastLine = lines[lines.length - 1];
            scope.saveStatus = 'progress';
            defaultStrategy.api.addNewRow(lastLine, function (err, newRow) {
                scope.saveStatus = err ? 'error' : 'ok';
                scope.saveStatusMessage = err ? 'Error: ' + err : '';
                if (err) setCodeBoxValue(editor, codeValue);
                resetSaveStatusMessage.touch();
            });
        }, true)
    }

})(this)
