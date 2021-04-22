# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#  Web version Machina.py:  Alpha -0.01
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#

from browser import window,console,document
import json
import sys
import traceback

#The DOM textarea element
codeElm = document['code']

#Send request sync using ajax
def syncRequest(method,url, data):
    res = window.jQuery.ajax({
        "method": method,
        "url": url,
        "data": data,
        "async": False
        });
    return res.responseText;

class Machina:

    # Gets a var's value from opened session
    def get(self, variableName, defaultValue=None):
        if self.session is None:
            raise Exception('Session not started')
        if variableName in self.session:
            return self.session[variableName]
        return defaultValue

    # Sets a var's value to opened session
    def set(self, variableName, value=None):
        if self.session is None:
            raise Exception('Session not started')
        self.session[variableName] = value

    def __init__(self):
        self.session = {}

    # Main requesting message
    def requestMachina(self, url, parameters=None,callback=None):
        if parameters is None:
            parameters = {}
        if self.get('strategyName') is not None:
            parameters['strategyName'] = self.get('strategyName')
        data= syncRequest('POST',url,parameters);
        data=json.loads(data)
        if 'error' in data:
            raise Exception(data['error'])
        if 'result' in data:
            return data['result']
        return data

    # Main requesting message to strategy worker
    def sendMessageToMW(self, messageParams):
        result = self.requestMachina('/api/kafka/sendMessageToSW', messageParams)
        return result

    # Retrieve all user's strategies
    def listStrategys(self):
        message = {'messageType': 'ListStrategys'}
        strategies = self.sendMessageToMW(message)['strategies']
        self.set('strategies', strategies)
        return strategies

    # Open the strategy
    def openStrategy(self, strategyName='default'):
        self.set('strategyName', strategyName)
        # Update the strategy's rows
        return self.getStrategyRows()

    # Close the strategy
    def closeStrategy(self):
        self.set('strategyName', None)

    # Gets the strategy's rows
    def getStrategyRows(self):
        message = {'messageType': 'GetRows'}
        self.set('strategyRows', self.sendMessageToMW(message)['rows'])
        return self.get('strategyRows')

    # removes all rows from strategy
    def clearStrategy(self, updateRows=True):
        message = {'messageType': 'ClearStrategy'}
        result = self.sendMessageToMW(message)
        if updateRows:  # Update the strategy's rows
            self.getStrategyRows()
        return result

    # columns we want
    #      "Row"     = character(0),
    #      "Query"   = character(0)
    #            BacktestName = session$strategy$backtest$backtestName,
    #            PandL = session$strategy$backtest$pnl,
    #            NumTrades = session$strategy$backtest$ntrades,
    #            SharpeRatio = session$strategy$backtest$sharpe,
    #            SortinoRatio = session$strategy$backtest$sortino)
    def viewStrategy(self):
        print(' Row\t|\tQuery')  # | PandL | NumTrades | SharpeRatio | SortinoRatio'
        print ('----------------------------------')
        for row in self.get('strategyRows'):
            print (row['index']+'\t|\t'+row['query'])

    # undoes last operation on strategy (addRow or clear)
    def undo(self, updateRows=True):
        message = {'messageType': 'Undo'}
        result = self.sendMessageToMW(message)
        if updateRows:  # Update the strategy's rows
            self.getStrategyRows()
        return result

    # undoes last operation on strategy (addRow or clear)
    def addRow(self, query, updateRows=True, startTime='', endTime='', includeData=False):
        message = {'messageType': 'AddRow', 'query': query, 'startTime': startTime,
                   'endTime': endTime, 'includeData': includeData}
        result = self.sendMessageToMW(message)
        if updateRows:  # Update the strategy's rows
            self.getStrategyRows()
        return result

    # Get row, optionally with data
    def getRow(self, rowIndex, startTime='', endTime='', includeData=False):
        message = {'messageType': 'GetRow', 'rowIndex': rowIndex, 'startTime': startTime,
                   'endTime': endTime, 'includeData': includeData}
        return self.sendMessageToMW(message)

    # Get timeseries, optionally with data
    def getTimeSeries(self, query, startTime='', endTime='', includeData=False):
        message = {'messageType': 'GetTimeSeries', 'query': query, 'startTime': startTime,
                   'endTime': endTime, 'includeData': includeData}
        return self.sendMessageToMW(message)

    # List backtest configurations
    def listBacktestConfigurations(self):
        message = {'messageType': 'ListBacktestConfigurations'}
        return self.sendMessageToMW(message)

    # Get backtest configuration
    def getBacktestConfiguration(self, backtestName):
        message = {'messageType': 'GetBacktestConfiguration', 'backtestName': backtestName}
        return self.sendMessageToMW(message)

    # Set backtest configuration
    def setBacktestConfiguration(self, backtestName, backtest):
        message = {'messageType': 'SetBacktestConfiguration', 'backtestName': backtestName, 'backtest': backtest}
        return self.sendMessageToMW(message)

    # Draw series data to the remoteChart page
    # seriesDataList - such as {'GOOG':[], 'SPY':[]}
    def drawSeries(self, seriesDataList):
        seriesDataList = json.dumps(seriesDataList)
        params = {'seriesData': seriesDataList}
        # send data to user's browser
        self.requestMachina('/api/user/remoteChart/sendMessageToRemoteChart', params)

    # Draw rows to the remoteChart page
    def drawRows(self, rowsArray=None, startTime=None, endTime=None):
        params = {'rows': rowsArray, 'startTime': startTime, 'endTime': endTime}
        # send data to user's browser
        self.requestMachina('/api/user/remoteChart/sendMessageToRemoteChart', params)

    # View rows to the dataViewer page
    def viewRows(self, rowsArray=None, startTime=None, endTime=None):
        params = {'rows': rowsArray, 'startTime': startTime, 'endTime': endTime}
        # send data to user's browser
        self.requestMachina('/api/user/dataViewer/sendMessageToDataViewer', params)

    # View data to the dataViewer page
    # dataList - such as {'GOOG':[], 'SPY':[]}
    def viewData(self, dataList):
        dataList = json.dumps(dataList)
        params = {'data': dataList}
        # send data to user's browser
        self.requestMachina('/api/user/dataViewer/sendMessageToDataViewer', params)

    # Send command to browser to clear the charts
    def clearChart(self):
        self.requestMachina('clearChart')

    # Send command to browser to clear the grid
    def clearGrid(self):
        self.requestMachina('clearGrid')

machina = Machina()
machinaFunctions=['clearChart','clearGrid','viewRows','viewData','addRow', 'clearStrategy', 'closeStrategy', 'drawRows', 'drawSeries', 'getBacktestConfiguration', 'getStrategyRows', 'getRow', 'getTimeSeries', 'listBacktestConfigurations', 'listStrategys', 'openStrategy', 'requestMachina', 'sendMessageToMW', 'setBacktestConfiguration', 'undo', 'viewStrategy']


def clear():
    codeElm.value=""
    return ""
clear.__repr__ = lambda:clear()

def write(data):
    codeElm.value += str(data)


sys.stdout.write = sys.stderr.write = write
history = []
current = 0
_status = "main"  # or "block" if typing inside a block


# execution namespace
editor_ns={'clear':clear,
           '__name__':'__main__'}
for f in machinaFunctions:
    editor_ns[f]=getattr(machina,f)


def cursorToEnd(*args):
    pos = len(codeElm.value)
    codeElm.setSelectionRange(pos, pos)
    codeElm.scrollTop = codeElm.scrollHeight

def get_col(area):
    # returns the column num of cursor
    sel = codeElm.selectionStart
    lines = codeElm.value.split('\n')
    for line in lines[:-1]:
        sel -= len(line) + 1
    return sel


def myKeyPress(event):
    global _status, current
    if event.keyCode == 9:  # tab key
        event.preventDefault()
        codeElm.value += "    "
    elif event.keyCode == 13:  # return
        src = codeElm.value
        if _status == "main":
            currentLine = src[src.rfind('>>>') + 4:]
        elif _status == "3string":
            currentLine = src[src.rfind('>>>') + 4:]
            currentLine = currentLine.replace('\n... ', '\n')
        else:
            currentLine = src[src.rfind('...') + 4:]
        if _status == 'main' and not currentLine.strip():
            codeElm.value += '\n>>> '
            event.preventDefault()
            return
        codeElm.value += '\n'
        history.append(currentLine)
        current = len(history)
        if _status == "main" or _status == "3string":
            try:
                _ = editor_ns['_'] = eval(currentLine, editor_ns)
                if _ is not None:
                    write(repr(_)+'\n')
                if codeElm.value.rfind('>>>') != -1:
                    codeElm.value +='\n'
                codeElm.value += '>>> '
                _status = "main"
            except IndentationError:
                codeElm.value += '... '
                _status = "block"
            except SyntaxError as msg:
                if str(msg) == 'invalid syntax : triple string end not found' or \
                    str(msg).startswith('Unbalanced bracket'):
                    codeElm.value += '... '
                    _status = "3string"
                elif str(msg) == 'eval() argument must be an expression':
                    try:
                        exec(currentLine, editor_ns)
                    except:
                        traceback.print_exc()
                    codeElm.value += '>>> '
                    _status = "main"
                elif str(msg) == 'decorator expects function':
                    codeElm.value += '... '
                    _status = "block"
                else:
                    traceback.print_exc()
                    codeElm.value += '>>> '
                    _status = "main"
            except:
                traceback.print_exc()
                codeElm.value += '>>> '
                _status = "main"
        elif currentLine == "":  # end of block
            block = src[src.rfind('>>>') + 4:].splitlines()
            block = [block[0]] + [b[4:] for b in block[1:]]
            block_src = '\n'.join(block)
            # status must be set before executing code in globals()
            _status = "main"
            try:
                _ = exec(block_src, editor_ns)
                if _ is not None:
                    print(repr(_))
            except:
                traceback.print_exc()
            codeElm.value += '>>> '
        else:
            codeElm.value += '... '
        
        cursorToEnd()
        event.preventDefault()

def myKeyDown(event):
    global _status, current
    if event.keyCode == 37:  # left arrow
        sel = get_col(codeElm)
        if sel < 5:
            event.preventDefault()
            event.stopPropagation()
    elif event.keyCode == 36:  # line start
        pos = codeElm.selectionStart
        col = get_col(codeElm)
        codeElm.setSelectionRange(pos - col + 4, pos - col + 4)
        event.preventDefault()
    elif event.keyCode == 38:  # up
        if current > 0:
            pos = codeElm.selectionStart
            col = get_col(codeElm)
            # remove current line
            codeElm.value = codeElm.value[:pos - col + 4]
            current -= 1
            codeElm.value += history[current]
        event.preventDefault()
    elif event.keyCode == 40:  # down
        if current < len(history) - 1:
            pos = codeElm.selectionStart
            col = get_col(codeElm)
            # remove current line
            codeElm.value = codeElm.value[:pos - col + 4]
            current += 1
            codeElm.value += history[current]
        event.preventDefault()
    elif event.keyCode == 8:  # backspace
        src = codeElm.value
        lstart = src.rfind('>>> ')
        if lstart==-1 or len(src)<=lstart+4:
            event.preventDefault()
            event.stopPropagation()
    elif event.keyCode == 76 and event.ctrlKey:  # Ctr+l
        codeElm.value='>>> '
        event.preventDefault()
        event.stopPropagation()

codeElm.bind('keypress', myKeyPress)
codeElm.bind('keydown', myKeyDown)
codeElm.bind('click', cursorToEnd)
v = sys.implementation.version
originalSrc = codeElm.value
codeElm.value = "Brython %s.%s.%s on %s %s\n>>> " % (
    v[0], v[1], v[2], window.navigator.appName, window.navigator.appVersion)
#codeElm.value += 'Type "copyright", "credits" or "license" for more information.'
codeElm.value += originalSrc
codeElm.focus()
cursorToEnd()