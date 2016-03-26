var Storage = (function () {
    var storage = {};
    var instance = localStorage;

    storage.get = function (key) {
        var data = instance.getItem(key);
        return (data) ? JSON.parse(data) : null;
    };

    storage.set = function (key, value) {
        instance.setItem(key, JSON.stringify(value));
    };

    storage.addMap = function (title, map) {
        
        var mapList = storage.get('karelMapsIndex');
        if (!mapList) {
            mapList = [];
        }

        if (mapList.indexOf(title) < 0) {
            mapList.push(title);
            storage.set('karelMapsIndex', mapList);
        }
        storage.set(title, map);

    };

    storage.getCode = function (language) {
        var data = instance.getItem(language);
        return (data) ? data : null;
    };

    storage.saveCode = function (language, code) {
        instance.setItem(language, code);
    };

    storage.removeMap = function (mapName) {

        var mapList = storage.get('karelMapsIndex');
        if (!mapList) {
            mapList = [];
        } else {
            var mapIdx = mapList.indexOf(mapName);
            if (mapList.indexOf(mapName) >= 0) {
                mapList.splice(mapIdx, 1);
            }
        }
        storage.set('karelMapsIndex', mapList);
        storage.clear(mapName);
    };

    storage.clear = function (key) {
        instance.removeItem(key);
    };

    return storage;

})();