(function (root) {
    var utilities = {

        playToneSound: function () {
            var audio = new Audio('/static_files/sounds/Chime.mp3');
            audio.play();
        },
        round: function (n, decimalPlaces) {
            var factor = Math.pow(10, decimalPlaces);
            return Math.round(n * factor) / factor;
        },
        reloadPage: function () {
            window.location.reload(false);
        },
        formatTime: function (sec_num) {
            var days = utilities.round(sec_num / (60 * 60 * 24), 1);
            var hours = utilities.round(sec_num / (60 * 60), 1);
            var minutes = utilities.round(sec_num / (60), 1);
            var seconds = utilities.round(sec_num, 0);

            var txt = '';
            if (days >= 1)
                txt = utilities.formatSum('day', days);
            else if (hours >= 1)
                txt = utilities.formatSum('hour', hours);
            else if (minutes >= 1)
                txt = utilities.formatSum('minute', minutes);
            else txt = utilities.formatSum('second', seconds);
            return txt;
        },
        formatSum: function (word, count) {
            if (count < 2) return count + ' ' + word;
            return count + ' ' + word + 's';
        },
        utcToNewYorkTimeValue: undefined,
        toNewYorkTime: function (momentDate, outputDateFormat) {
            outputDateFormat = outputDateFormat || 'YYYY-MM-DD HH:mm:ss';
            if (!utilities.utcToNewYorkTimeValue) {
                var utc = momentDate.clone().utc();
                var newYork = utc.clone().tz('America/New_York').hour();
                var diff = 0;
                while (utc.hour() > newYork) {
                    utc.add(-1, 'hours');
                    diff++;
                }
                utilities.utcToNewYorkTimeValue = diff;
            }
            var dd = momentDate.utc().add(-utilities.utcToNewYorkTimeValue, 'hours').format(outputDateFormat);
            return dd;
        },
        //A method that garantee only one executing to the function in spesific interval
        timeout: function (callback, timeoutInterval) {
            var obj = {
                callback: callback,
                timeoutInterval: timeoutInterval,
                timeoutHandle: undefined,
                touched: false,
                //Cause the timer to start new interval
                touch: function () {
                    obj.args = arguments;
                    if (obj.touched && obj.timeoutHandle)
                        clearTimeout(obj.timeoutHandle);
                    obj.f();
                },
                f: function () {
                    var waitTime = obj.timeoutInterval;// obj.touched ? obj.timeoutInterval : 0;
                    obj.touched = true;
                    obj.timeoutHandle = setTimeout(function () {
                        obj.touched = false;
                        if (obj.callback) obj.callback.apply(obj, obj.args);
                    }, waitTime);
                },
                //Invoke the function without delay
                invoke: function () {
                    if (obj.callback) obj.callback.apply(obj, arguments);
                }
            };
            return obj;
        },
        downloadText: function (title, text) {
            download(text, title, "text/plain");
        },
        //get all fields names in this array
        _getCSVColumns: function (array) {
            var columns = [];
            var length = array.length;
            for (var i = 0; i < length; i++) {
                for (var col in array[i]) {
                    if (columns.indexOf(col) < 0)
                        columns.push(col);
                }
            }
            return columns;
        },
        JsonToCSVConvertor: function (JSONData, ShowLabel) {
            //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
            var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

            var processRow = function (row) {
                var finalVal = '';
                for (var j in row) {
                    if (!row.hasOwnProperty(j)) continue;
                    var innerValue = row[j];
                    if (row[j] instanceof Date) {
                        innerValue = row[j].toLocaleString();
                    } else innerValue = innerValue != undefined ? innerValue.toString() : '';;
                    var result = innerValue.replace(/"/g, '""');
                    if (result.search(/("|,|\n)/g) >= 0)
                        result = '"' + result + '"';
                    if (finalVal !== '')
                        finalVal += ',';
                    finalVal += result;
                }
                return finalVal + '\n';
            };

            var csvFile = '';
            if (ShowLabel)
                csvFile = utilities._getCSVColumns(JSONData) + '\n';
            for (var i = 0; i < arrData.length; i++) {
                csvFile += processRow(arrData[i]);
            }
            return csvFile;
        },
        //var csv is the CSV file with headers
        CSVToJsonConvertor: function (csvText) {
            //SOme files are using only '\r' instead of '\n' or '\r\n'
            csvText = csvText.replace(/\r/g, '\n').replace(/\n\n/g, '\n');
            return csv.decode(csvText);
        },
        //Close the bootstrap dropdown menus when user clicks any item
        closeDropDownMenuOnClick: function () {
            $(".dropdown ul.dropdown-menu li").ready(function () {
                $(".dropdown ul.dropdown-menu li").click(function (event) {
                    if (event.toElement)
                        event.toElement.parentElement.click();
                })
            })
        },
        setCookie: function (name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
            } else var expires = "";
            document.cookie = name + "=" + value + expires + "; path=/";
        },
        getCookie: function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },
        removeCookie: function (name) {
            utilities.setCookie(name, "", -1);
        },
        loadJsFile: function (filename) {
            var head = document.getElementsByTagName('head')[0];

            var script = document.createElement('script');
            script.src = filename;
            script.type = 'text/javascript';

            head.appendChild(script)
        }, //Clone thie object
        clone: function (obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        //Check if the browser is mobile/tablet or computer
        isMobile: function () {
            // return true;
            //check using the screen width, if it's less than 768 then it expected to be a small screen (mobile, iphone...)
            return window.screen.availWidth < 768;
            if (/Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true;
            }
            return false;
        },//Check if the browser is mobile/tablet or computer
        isUserAgentMobile: function () {
            if (/Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true;
            }
            return false;
        },
        //get or set a nested value by string
        byString: function () {
            var obj = arguments[0],
                path = arguments[1];
            path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
            path = path.replace(/^\./, ''); // strip a leading dot
            var parts = path.split('.');

            if (arguments.length < 3) {
                for (var i = 0; i < parts.length; ++i) {
                    var key = parts[i];
                    obj = obj[key];
                    if (!obj) break;
                }
                return obj;
            } else {
                for (var i = 0; i < parts.length; ++i) {
                    var key = parts[i];
                    if (i == parts.length - 1)
                        obj[key] = arguments[2];
                    else {
                        obj[key] = obj[key] || {};
                        obj = obj[key];
                    }
                }
                return this;
            }
        },
        removeDuplicates: function (array) {
            var uniqueNames = [];
            $.each(array, function (i, el) {
                if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
            });
            return uniqueNames;
        },
        percentFormatter: function (value) {
            if (!value || !Number.isFinite(value))
                return value;
            return (Math.round(Number(value) * 1000000) / 10000) + '%';
        },
        numberFormatter: function (value) {
            if (!value || !Number.isFinite(value))
                return value;
            return Math.round(Number(value) * 100) / 100;
        },
        //Change the docuemtn main font
        changeFont: function (fontName) {
            $(document.body).removeClass('custom-style');
            $('#customStyle').remove();
            if (fontName) {
                $('head').append('<style id="customStyle">.custom-style div,.custom-style a,.custom-style td,.custom-style th{font-family:' + fontName + ' !important}</style>');
                $(document.body).addClass('custom-style');
            }
        },
        urlParameters_Fun: function () {
            // This function is anonymous, is executed immediately and 
            // the return value is assigned to QueryString!
            var query_string = {};
            var hashText = window.location.hash;
            while (hashText.indexOf('#') == 0 || hashText.indexOf('/') == 0)
                hashText = hashText.substring(1);
            var query = window.location.search.substring(1);
            if (query && hashText)
                query += '&';
            query += hashText;
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                // If first entry with this name
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = decodeURIComponent(pair[1]);
                    // If second entry with this name
                } else if (typeof query_string[pair[0]] === "string") {
                    var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                    query_string[pair[0]] = arr;
                    // If third or later entry with this name
                } else {
                    query_string[pair[0]].push(decodeURIComponent(pair[1]));
                }
            }
            return query_string;
        },
        //Use this function for fileInput, Event 'fileLoaded' will be fire after file loaded
        //Usage: element.on('change', readInputFiles);
        //Handle 'fileLoaded' event: element.on('fileLoaded', function(event,err,textFiles){});
        readInputFiles: function (args) {
            //Retrieve the first (and only!) File from the FileList object
            var element = $(args.target);
            async.map(args.target.files,
                function (f, next) {

                    var r = new FileReader();
                    r.onload = function (e) {
                        next(undefined, {
                            name: f.name,
                            content: e.target.result
                        });
                    }
                    r.readAsText(f);

                },
                function (err, textFiles) {
                    element.trigger('fileLoaded', [undefined, textFiles]);
                    //element.wrap('<form>').closest('form').get(0).reset();
                    //element.unwrap();
                });
        },
        // Parse the dateTime text
        parseDateTime: function (dateTime, throwError) {
            if (typeof (dateTime) !== 'string')
                dateTime = dateTime.toString();
            //remove the dateTime default seperator such as / and space
            dateTime = dateTime.replace(/\//g, '').replace(/ /g, '').replace(/:/g, '').replace(/T/g, '').replace(/-/g, '');

            if (dateTime.length < 4 && throwError) throw 'Invalid date, ' + dateTime;
            var year = parseNumber(dateTime, 0, 4, throwError),
                month = parseNumber(dateTime, 4, 2, throwError),
                day = parseNumber(dateTime, 6, 2, throwError) || 1,
                hours = parseNumber(dateTime, 8, 2, throwError),
                minutes = parseNumber(dateTime, 10, 2, throwError),
                seconds = parseNumber(dateTime, 12, 2, throwError);

            if (month)
                month = month - 1;
            return Date.UTC(year, month, day, hours, minutes, seconds);
        },
        //Parse the number text
        parseNumber: function (num) {
            var testNum = Number(num);
            if (!Number.isFinite(testNum))
                testNum = undefined;
            return testNum;
        },
        /**
         * Convert the input array to JSON object
         * 
         * @param {Array} array: The input array
         * @param {string} keyName: The object map property name
         * @param {string} valueName: The object value property name
         * */
        arrayToObject: function (array, keyName, valueName) {
            var obj = {};
            array.forEach(function (item) {
                obj[item[keyName]] = valueName ? item[valueName] : item;
            });
            return obj;
        },
        /**
         * Performs a binary search on the host array. This method can either be
         * injected into Array.prototype or called with a specified scope like this:
         * binaryIndexOf.call(someArray, searchElement);
         *
         * @param {*} searchElement The item to search for within the array.
         * @return {Number} The index of the element which defaults to -1 when not found.
         */
        binaryIndexOf: function (array, searchElement) {
            var minIndex = 0;
            var maxIndex = array.length - 1;
            var currentIndex;
            var currentElement;

            while (minIndex <= maxIndex) {
                currentIndex = (minIndex + maxIndex) / 2 | 0;
                currentElement = array[currentIndex];

                if (currentElement < searchElement) {
                    minIndex = currentIndex + 1;
                } else if (currentElement > searchElement) {
                    maxIndex = currentIndex - 1;
                } else {
                    return currentIndex;
                }
            }

            return -1;
        }
    }
    utilities.urlParameters = utilities.urlParameters_Fun();
    //make sure the Number.isFinite is exists
    Number.isFinite = Number.isFinite || function (value) {
        return typeof value === "number" && isFinite(value);
    }

    Math.sign = Math.sign || function (value) {
        if (value > 0) return 1;
        if (value < 0) return -1;
        return 0;
    }
    function parseNumber(txt, start, length, throwError) {
        var sub = txt.substring(start, start + length);
        var num = Number(sub);
        if (throwError && sub.length && sub != 'NaN' && !Number.isFinite(num))
            throw 'Invalid number, ' + txt;
        return num;
    }
    root.utilities = utilities;
})(this)
