var CompletionDropdown = function(completer, opts){

  this.el = $('<div class="tagbox-dropdown"><div class="list"></div></div>')
    .css({
      maxHeight: opts['maxHeight']
    })
    .hide();

  if(opts['allowNew']){
    this.newRow = $('<div class="tagbox-item new-item" />').prependTo(this.el);
  }

  this.updatePosition = function(input){
    var o1 = this.el.offset();
    var o2 = input.offset();
    var o3 = this.el.parent().offset();

    if(this.el.parent().is('body')){
      // TODO figure out how to take into account margin/padding on body element properly
      o3 = {
        top: 0,
        left: 0
      };
    }

    this.el.css({
      top: o2.top - o3.top + input.height() + 1,
      left: o2.left - o3.left,
      width: input.width()
    });
  };

  this.show = function(){
    this.el.show();
  };

  this.hide = function(){
    this.el.hide();
  };

  this.getSelected = function(){
    return this.selectedRow.item;
  };

  this.selectNext = function(){
    if(this.selectedIndex === this.rows.length - 1){
      if(opts['allowNew'] || this.rows.length === 0){
        this.selectRow(-1);
      }else{
        this.selectRow(0);
      }
    }else{
      this.selectRow(this.selectedIndex + 1);
    }
  };

  this.selectPrevious = function(){
    if(this.selectedIndex === 0){
      if(opts['allowNew']){
        this.selectRow(-1);
      }else{
        this.selectRow(this.rows.length - 1);
      }
    }else{
      if(this.selectedIndex === -1) this.selectedIndex = this.rows.length;
      this.selectRow(this.selectedIndex - 1);
    }
  };

  this.selectRow = function(idx){
    if(this.selectedRow){
      this.selectedRow.deselect();
    }
    this.newRow && this.newRow.removeClass('selected');
    if(typeof idx !== 'number'){
      idx = this.rows.indexOf(idx);
    }
    if(idx >= 0){
      this.selectedRow = this.rows[idx];
      this.selectedRow.select();
      this.scrollToRow(this.selectedRow.el);
    }else{
      this.selectedRow = false;
      this.newRow && this.newRow.addClass('selected');
    }
    this.selectedIndex = idx;
  };

  this.scrollToRow = function(r){
    var o = r.offset().top - this.el.offset().top - this.el.scrollTop();
    if(o < 0){
      this.el.scrollTop(r.offset().top - this.el.offset().top);
    }else if(o > this.el.height() - r.height()){
      this.el.scrollTop(o + this.el.scrollTop() - this.el.height() + r.height());
    }
  };

  this.setEmptyItem = function(txt){
    this.el.find('.new-item').text(opts['newText'].replace(/\{\{txt\}\}/g, txt));
  };

  this.showItems = function(items){
    this.el.find('.list').empty();
    this.rows = [];

    if(items.length > 0){
      for(var i = 0; i < Math.min(items.length, opts['maxItems']); i += 1){
        var row = new DropdownRow(items[i], opts);
        row.el.appendTo(this.el.find('.list'));
        row.el.on('mouseover', function(self, row){ return function(){
          self.selectRow(row);
        }; }(this, row));
        row.el.on('mousedown', function(){
          completer.dontHide = true;
        }).on('mouseup', function(){
          completer.dontHide = false;
        });
        row.el.on('click', function(item){ return function(){
          completer.addToken(item);
        }; }(items[i]));
        this.rows.push(row);
      }
      this.selectRow(0);
    }else{
      $('<div class="tagbox-item empty"/>')
        .text(opts['emptyText'])
        .appendTo(this.el.find('.list'));
      this.selectRow(-1);
    }

    this.show();
  };
};
