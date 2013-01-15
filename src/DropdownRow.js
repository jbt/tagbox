var DropdownRow = function(item, opts){

  this.el = $('<div class="tagbox-item" />');

  if(opts['itemClass']) this.el.addClass(opts['itemClass']);

  this.item = item;

  var format = opts['rowFormat'];

  if(typeof format == 'string'){
    this.el.html(format.replace(/\{\{([^}]*)\}\}/g, function(match, field){
      return item[field];
    }));
  }else{
    this.el.html(format(item));
  }

  this.select = function(){
    this.el.addClass('selected');
  };

  this.deselect = function(){
    this.el.removeClass('selected');
  };

};
