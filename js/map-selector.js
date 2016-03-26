// ---------------------------------------------------------------
// ------------------- Map Selector class ------------------------
// ---------------------------------------------------------------

var MapSelector = function(element) {
    this.element = element;
    this.callback = null;
};

MapSelector.prototype.onChange = function(callback) {
    this.callback = callback
};

MapSelector.prototype.getMaps = function() {
    var mapTitles = Storage.get('karelMapsIndex') || [];
    var retVal = [];
    for (var i = 0; i < mapTitles.length; i++) {
        var key = mapTitles[i];
        retVal[key] = Storage.get(key);
    }
    return retVal;
};

MapSelector.prototype.formOptions = function() {
    
    var list = this.getMaps();
    var self = this;

    for (var i = 0; i < list.length; i++) {
        var option = $('<option></option>');
        option.text(list[i].name);
        option.val(i);
        this.element.append(option);
    }

    this.element.change(function() {
        if (self.callback)
            self.callback( list[self.element.find('option:selected').val()] );
    });

};

MapSelector.prototype.formUlList = function(flags) {

    flags = flags || {};
    var list = this.getMaps();

    if (!list) {
        return;
    }  

    var $ul = $('<ul></ul>');
    this.element.append($ul);
    for (var property in list) {
        if (list.hasOwnProperty(property)) {
            var map     = list[property];
            var glyphId = (map.secretOwnership) ? 'team-glyph' : 'user-glyph';
            var $li     = $('<li></li>');
            var $glyph  = $('<div id="' + glyphId + '" class="glyph"></div>');
            var $span   = $('<span>' + property + '</span>');

            $ul.append($li);
            $li.append($glyph);
            $li.append($span);

            if (this.callback) {
                $li.click({cb: this.callback, arg: map}, function(e) {
                    e.data.cb( e.data.arg );
                });
            }

            if (flags.editCallback) {
                var $edit = $('<div class="edit sidebar-btn"></div>'); 
                $edit.click({cb: flags.editCallback, arg: map}, function(e) {
                    e.data.cb( e.data.arg );
                });
                $li.append($edit);
            }

            if (flags.deleteCallback) {
                var $remove = $('<div class="delete sidebar-btn"></div>'); 
                $remove.click({cb: flags.deleteCallback, arg: map}, function(e) {
                    e.data.cb( e.data.arg );
                });
                $li.append($remove);
            }
        }
    }
}

// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------