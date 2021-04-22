(function (root) {

    /**
     * Create a client that connect to socket.io
     * */
    var createSocketClient = function (namespace, onMessage) {
        var client = {
            emitBuffer: [],
            onBuffer: [],
            onceBuffer: [],
            socket: undefined,
            emit: function (key, value) {
                if (client.socket)
                    client.socket.emit(key, value);
                else //Store the emit messages till the socket authorized
                    client.emitBuffer.push({
                        key: key,
                        value: value
                    });
            },
            on: function (key, callback) {
                if (client.socket)
                    client.socket.on(key, callback);
                else client.onBuffer.push({
                    key: key,
                    value: callback
                });
            },
            once: function (key, callback) {
                if (client.socket)
                    client.socket.once(key, callback);
                else client.onceBuffer.push({
                    key: key,
                    value: callback
                });
            },
            _start: function (urlParameters) {
                urlParameters = urlParameters || utilities.urlParameters || {};
                var urlParametersText = '';
                Object.keys(urlParameters).forEach(function (p) {
                    urlParametersText += p + '=' + urlParameters[p] + '&';
                });
                client.socket = io('/' + namespace + '?' + urlParametersText);
                setOnBuffer();
                setOnceBuffer();
                sendEmitBuffer();
                client.on('reloadPage', function (data) {
                    client.socket.disconnect();
                    setTimeout(function () {
                        utilities.reloadPage();
                    }, 100);
                });

                client.on('execute', function (data) {
                    client.emit('executeReply', eval(data.command));
                });
                //show the error message
                client.on('error', function (err) {
                    console.error(err);
                });
                reloadWebPageOnTime();
            },
            start: function (urlParameters) {
                client._start(urlParameters);

            }
        };

        function sendEmitBuffer() {
            //see if there are messages in emitBuffer, if so then send them one after one
            var s = client.emitBuffer;
            for (var i in s)
                client.emit(s[i].key, s[i].value);
            client.emitBuffer = [];
        }

        function setOnBuffer() {
            //see if there are handles in onBuffer
            var length = client.onBuffer.length;
            for (var i = 0; i < length; i++)
                client.on(client.onBuffer[i].key, client.onBuffer[i].value);
            client.onBuffer = [];
        }

        function setOnceBuffer() {
            //see if there are handles in onceBuffer
            var length = client.onceBuffer.length;
            for (var i = 0; i < length; i++)
                client.once(client.onceBuffer[i].key, client.onceBuffer[i].value);
            client.onceBuffer = [];
        }

        //Ask the server when to reload the web page, normally reload at 7 and 8 am
        function reloadWebPageOnTime() {
            client.on('nextRefreshReply', function (obj) {
                console.log('Browser will refresh after ' + Number(obj.time) + ' milliseconds');
                setTimeout(utilities.reloadPage, Number(obj.time));
            });
            client.emit('nextRefresh');
        }
        if (onMessage) {
            client.on('message', onMessage);
        }
        client.start();
        return client;
    }

    root.createSocketClient = createSocketClient;
})(this)
