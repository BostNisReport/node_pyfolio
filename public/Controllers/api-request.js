(function (root) {

        //This module support api calls
        angular.module('api-request', []).
            factory('ApiRequest', ['$http', '$q', function ($http, $q) {
                angular.$http = $http;
                angular.$q = $q;

                //This is the static instance for the requests
                angular.requests = new ApiRequester();
                angular.events.emit('ApiRequestLoaded');
                return ApiRequester;
            }]).
            run(['ApiRequest', function (ApiRequest) { }]);

        //Enable GET/POST requests using angular.$http
        var ApiRequester = root.ApiRequester = function () {
            this.requetsCanceler = angular.$q.defer();
        }
        ApiRequester.prototype = new EventManager();

        angular.extend(ApiRequester.prototype, {
            //The $http config used for requests
            createHttpConfig: function (additionalProperties) {
                var instance = this;
                var config= {
                    timeout: this.requetsCanceler.promise,
                    eventHandlers: {
                        progress: function (c) {
                            instance.emit('DownloadProgress',c);
                        }
                    },
                    uploadEventHandlers: {
                        progress: function (c) {
                            instance.emit('UploadProgress', c);
                        }
                    }
                };
                if (additionalProperties)
                    angular.extend(config, additionalProperties);
                return config;
            },
            /**
           * Request an api call to the server
           * 
           * @param {string} dataUrl: The api url
           * @param {object} params: The request params
           * @param {function} callback: The callback function that will handle the error and data
           * */
            get: function (dataUrl, params, callback) {

                angular.$http.get(dataUrl, this.createHttpConfig({ params: params })).success(function (data, status, headers, config) {
                    callback(data && (data.error || data.Error), data);
                }).error(function (data, status, headers, config) {
                    callback('Failed to load ' + dataUrl);
                });

            },
            /**
                * Request an api call to the server
                * 
                * @param {string} dataUrl: The api url
                * @param {object} params: The request params
                * @param {function} callback: The callback function that will handle the error and  data
                * */
            post: function (dataUrl, params, callback) {
                angular.$http.post(dataUrl, params, this.createHttpConfig()).success(function (data, status, headers, config) {
                    callback(data && (data.error || data.Error), data);
                }).error(function (data, status, headers, config) {
                    callback('Failed to load ' + dataUrl);
                });
            },
            abort: function () {
                this.requetsCanceler.resolve();
                //Re-set the canceler for next requests
                this.requetsCanceler = angular.$q.defer();
            }
        });



    })(this)