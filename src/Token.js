var Token = function(item, opts){

  var el = this.el = $('<div class="tagbox-token">' +
                          '<span></span>' +
                          '<a>&times;</a>' +
                        '</div>')
                        .data('token', this);

  var format = opts['tokenFormat'];

  if(typeof format == 'string'){
    el.children('span').html(format.replace(/\{\{([^}]*)\}\}/g, function(match, field){
      return item[field];
    }));
  }else{
    el.children('span').html(format(item));
  }

  this.value = item[opts['valueField']];
  this.item = item;


  this.remove = function(){
    this.el.data('token', null);
    this.el.remove();
    this.item = null;
    this.el = null;
  };

  this.select = function(){
    this.el.addClass('selected');
  };

  this.deselect = function(){
    this.el.removeClass('selected');
  };
};
