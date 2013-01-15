$.fn['tagbox'] = function(opts){

  var defaults = {
    'maxHeight': 200,
    'maxItems': 20,
    'rowFormat': '{{name}}',
    'tokenFormat': '{{name}}',
    'valueField': 'name',
    'delimiter': ',',
    'allowDuplicates': false,
    'createNew': function(txt){ return { name: txt }; },
    'allowNew': false,
    'newText': '{{txt}}',
    'emptyText': 'Not Found',
    'dropdownContainer': 'body'
  };

  var options = $.extend({}, defaults, opts);

  return this.each(function(){
    var tb = new TagBox(this, options);
    $(this).data('tagbox', tb);
  });

};
