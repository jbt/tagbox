var TagBox = function(el, opts){

  var self = this;

  self.tokens = [];

  var input = self.input = $(el)
    .hide();
  self.options = opts;

  var wrapper = self.wrapper = $('<div class="tagbox-wrapper" />')
    .click(function(e){
      var target = $(e.target).closest('input, .tagbox-token, .tagbox-wrapper');

      if(target.is('.tagbox-token')){
        if($(e.target).is('a')){
          removeToken(target.data('token'));
        }else{
          selectToken(target.data('token'));
        }
      }else{
        deselectCurrentToken();
      }
      newInput.focus();
    })
    .insertBefore(self.input);

  var newInput = $('<input type="text" />')
    .bind('keyup keydown blur update change', resizeInputBox)
    .bind('blur', function(){
      setTimeout(function(){
        if(!self.dontHide) dropdown.hide();
      }, 50);
    })
    .bind('keydown', handleKeyDown)
    .appendTo(wrapper);

  var resizer = $('<span />')
    .appendTo(wrapper)
    .css({
      position: 'absolute',
      left: -99999,
      width: 'auto',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      fontSize: input.css('fontSize'),
      fontFamily: input.css('fontFamily'),
      fontWeight: input.css('fontWeight'),
      fontVariant: input.css('fontVariant'),
      letterSpacing: input.css('letterSpacing')
    });

  var dropdown = self.dropdown = new CompletionDropdown(self, opts);

  dropdown.el.appendTo(opts['dropdownContainer']);

  if(input.val()){
    var items = opts['items'];
    var bits = input.val().split(opts['delimiter']);
    var found;
    for(var i = 0; i < bits.length; i += 1){
      found = false;
      for(var j = 0; j < items.length; j += 1){
        if(items[j][opts['valueField']] == bits[i]){
          addToken(items[j]);
          found = true;
          break;
        }
      }
      if(!found && opts['allowNew']){
        addToken(opts['createNew'](bits[i]));
      }
    }
  }

  resizeInputBox(true);
  $(window).bind('resize', function(){
    resizeInputBox(true);
  });


  function handleKeyDown(e){

    var cursorFarRight = (newInput.val().length == newInput[0].selectionStart);
    var cursorFarLeft = (newInput[0].selectionEnd === 0);

    if(e.keyCode === 37){
      if(selectedToken){
        if(selectedToken === self.tokens[0]){
          deselectCurrentToken();
        }else{
          selectToken(self.tokens[self.tokens.indexOf(selectedToken) - 1]);
        }
        return false;
      }
      if(cursorFarLeft && self.tokens.length){
        selectToken(self.tokens[self.tokens.length - 1]);
      }
    }

    if(e.keyCode === 39){
      if(selectedToken){
        if(selectedToken === self.tokens[self.tokens.length - 1]){
          deselectCurrentToken();
        }else{
          selectToken(self.tokens[self.tokens.indexOf(selectedToken) + 1]);
        }
        return false;
      }
      if(cursorFarRight && self.tokens.length){
        selectToken(self.tokens[0]);
      }
    }

    if(selectedToken &&
      (e.keyCode === 46 || // delete
       e.keyCode === 8 )   // backspace
    ){
      removeToken(selectedToken, e.keyCode === 8 ? -1 : 1);
      return false;
    }

    if(e.keyCode === 8 && cursorFarLeft && self.tokens.length){
      selectToken(self.tokens[self.tokens.length - 1]);
      return false;
    }

    if(newInput.val()){
      if(e.keyCode === 38){
        dropdown.selectPrevious();
        return false;
      }
      if(e.keyCode === 40){
        dropdown.selectNext();
        return false;
      }

      if((e.keyCode == 39 &&
            cursorFarRight) || // right, but only if we're at the furthest
          e.keyCode == 13 || // enter
    //    e.keyCode == 32 || // space
          e.keyCode == 9  ){ // tab
        var selection = dropdown.getSelected();

        if(selection){
          addToken(selection);
        }else if(opts['allowNew']){
          addToken(opts['createNew'](newInput.val()));
        }
        return false;
      }
    }else{
      if(e.keyCode == 13 ||
     //  e.keyCode == 32 ||
         e.keyCode == 9  ){
        return false;
      }
    }

    // Don't allow typing if we've hit the maximum
    if(self.tokens.length === opts['maxItems']){
      newInput.val('');
      return false;
    }

    //if(String.fromCharCode(e.which)){
      setTimeout(updateDropdown, 10);
    //}
  }

  function addToken(selectedItem){
    var t = new Token(selectedItem, opts);

    t.el.insertBefore(newInput);

    self.tokens.push(t);

    newInput.val('');
    resizeInputBox();
    dropdown.hide();

    updateInput();
  }

  self.addToken = addToken;

  function removeToken(token, reSelect){
    token.remove();

    var idx = self.tokens.indexOf(token);

    self.tokens.splice(idx, 1);

    if(token === selectedToken) selectedToken = undefined;

    updateInput();
    resizeInputBox(true);

    if(reSelect){
      if(reSelect === -1){
        selectToken(self.tokens[idx - 1]);
      }else if(reSelect === 1){
        selectToken(self.tokens[idx]);
      }
    }

  }

  function updateInput(){
    var values = [];
    for(var i = 0; i < self.tokens.length; i += 1){
      values.push(self.tokens[i].value);
    }

    input.val(values.join(opts['delimiter']));
  }

  var selectedToken;

  function selectToken(token){
    if(selectedToken){
      selectedToken.deselect();
    }
    if(selectedToken !== token){
      selectedToken = token;
      token.select();
    }else{
      selectedToken = undefined;
    }
  }

  function deselectCurrentToken(){
    if(selectedToken){
      selectedToken.deselect();
      selectedToken = undefined;
    }
  }

  function scoresObject(){
    var si = opts['searchIn'];
    if(typeof si == 'string'){
      si = [si];
    }
    if($.isArray(si)){
      var scores = {};
      for(var i = 0; i < si.length; i += 1){
        scores[si[i]] = 10;
      }
      return scores;
    }

    return si;
  }

  function alreadyHaveItem(item){
    for(var i = 0; i < self.tokens.length; i += 1){
      if(self.tokens[i].item === item) return true;
    }
    return false;
  }

  function updateDropdown(){
    var items = opts['items'];
    var itemsToShow = [];
    var term = newInput.val();
    var relevance = scoresObject();

    if(term === ''){
      dropdown.hide();
      return;
    }

    for(var i = 0; i < items.length; i += 1){
      var theItem = {
        item: items[i],
        score: fuzzyRank(items[i], term, relevance)
      };
      if(theItem.score > 0 && (opts['allowDuplicates'] || !alreadyHaveItem(theItem.item))){
        itemsToShow.push(theItem);
      }
    }

    itemsToShow = itemsToShow.sort(function(a, b){
      return b.score - a.score;
    });

    for(var i = 0; i < itemsToShow.length; i += 1){
      itemsToShow[i] = itemsToShow[i].item;
    }

    dropdown.showItems(itemsToShow);
    dropdown.setEmptyItem(term);
  }

  function resizeInputBox(force){
    if(self.currentInput == newInput.val() && (force !== true)) return;

    deselectCurrentToken();

    self.currentInput = newInput.val();

    resizer.text(self.currentInput);


    newInput.width(0);

    newInput.width(
      Math.min(
        self.wrapper.width() - 16,
        Math.max(
          self.wrapper.width() - newInput.offset().left + self.wrapper.offset().left - 16,
          resizer.width(),
          1
        )
      )
    );

    dropdown.updatePosition(wrapper);
  }

};
