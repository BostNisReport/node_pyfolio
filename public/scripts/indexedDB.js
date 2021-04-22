(function (root) {

    // In the following line, you should include the prefixes of implementations you want to test.
    root.indexedDB = root.indexedDB || root.mozIndexedDB || root.webkitIndexedDB || root.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some root.IDB* objects:
    root.IDBTransaction = root.IDBTransaction || root.webkitIDBTransaction || root.msIDBTransaction || { READ_WRITE: "readwrite" }; // This line should only be needed if it is needed to support the object's constants for older browsers
    root.IDBKeyRange = root.IDBKeyRange || root.webkitIDBKeyRange || root.msIDBKeyRange;
    // (Mozilla has never prefixed these objects, so we don't need root.mozIDB*)


    if (!root.indexedDB) {
        console.error("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    }
    

    var IndexDBConnector = root.IndexDBConnector = function (dbName, objectStoreName) {
        if (!dbName || !objectStoreName)
            throw "Please set dbName and objectStoreName";
        this.dbName = dbName;
        this.objectStoreName = objectStoreName;
    }

    IndexDBConnector.prototype = {
        openDB: function (callback) {
            var instance = this;
            // Let us open our database
            var request = root.indexedDB.open(instance.dbName,1);
            request.onerror = function (event) {
                if (callback) callback(request.errorCode);
            };
            request.onsuccess  = function (event) {
                instance.db = event.target.result;
            };
            request.onupgradeneeded = function (event) {
                instance.db = event.target.result;
                instance.db.createObjectStore(instance.objectStoreName, { keyPath: "id" });
                if (callback)  callback();
            };
        },
        //Add this item to db, itme must have 'id' field
        addItem: function (item, callback) {
            var instance = this;
            if (!item || !item.id)
                throw "Item must include 'id' field";
            var request = instance.db.transaction([instance.objectStoreName], "readwrite")
                .objectStore(instance.objectStoreName)
                .add(item);

            request.onsuccess = function (event) { if (callback) callback(); };
            request.onerror = function (event) {
                if (callback) callback("Unable to add data\r\nKenny is aready exist in your database! ");
            }
            
        },
        getItem: function (itemID,callback) {
            var instance = this;

            var transaction = instance.db.transaction([instance.objectStoreName]);
            var objectStore = transaction.objectStore(instance.objectStoreName);
            var request = objectStore.get(itemID);
            request.onerror = function (event) {
                callback("Unable to retrieve data from database!");
            };
            request.onsuccess = function (event) {
                callback(undefined,request.result);
            };
        },
        getAllItems: function (callback) {
            var instance = this;

            var objectStore = instance.db.transaction(instance.objectStoreName).objectStore(instance.objectStoreName);
            var items = [];
            var connection = objectStore.openCursor();

            connection.onerror = function (event) {
                callback("Unable to retrieve data from database!");
            };

            connection.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    items.push(cursor.value);
                    cursor.continue();
                }
                else callback(undefined, items);
            };   
        },
        removeItem: function (itemID,callback) {
            var instance = this;

            var request = instance.db.transaction([instance.objectStoreName], "readwrite")
                .objectStore(instance.objectStoreName)
                .delete(itemID);
            request.onsuccess = function (event) {
                if (callback) callback();
            };
            request.onerror = function (event) {
                if (callback) callback('Unable to remove data from database!');
            };
        },
        removeAllItems: function (itemID, callback) {
            var instance = this;

            var request = instance.db.transaction([instance.objectStoreName], "readwrite")
                .objectStore(instance.objectStoreName).clear();
            request.onsuccess = function (event) {
                if (callback) callback();
            };
            request.onerror = function (event) {
                if (callback) callback('Unable to clear data from database!');
            };
        }

    }

})(this)
