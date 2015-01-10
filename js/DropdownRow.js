var DropdownRow = function(item, opts){

  // var self = this;

  var e = document.createElement('div');
  e.className = 'tagbox-item' + (opts['itemClass'] ? ' ' + opts['itemClass'] : '')
  e.__item = item;
  // self.item = item;

  var format = opts['rowFormat'];

  if(typeof format == 'string'){
    if(typeof item == 'string') item = { value: item };
    e.innerHTML = format.replace(/\{\{([^}]*)\}\}/g, function(match, field){
      return item[field];
    });
  }else{
    e.innerHTML = format(item);
  }

  return e;

  // var el = self.el = $(e);
  //
  // self.select = function(){
  //   el.addClass('selected');
  // };
  //
  // self.deselect = function(){
  //   el.removeClass('selected');
  // };

};
