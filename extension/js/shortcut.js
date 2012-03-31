(function (exports) {
  
  var diff = exports.gdbd.diff;
  var issue = exports.gdbd.issue;
  
  var CURSOR_CLASS = 'gdbd-cursor';
  var SHOW_CLASS = 'gdbd-show';
  var HIDE_CLASS = 'gdbd-hide';
  
  var keyboardShortcutUp = 'k';
  var keyboardShortcutDown = 'j';
  var keyboardShortcutToggle = 't';
  var keyboardShortcutScrollUp = 'f';
  var keyboardShortcutScrollDown = 'g';
  var scrollSpeed = 10;
  
  
  var Alert = function (element) {
    this.element = element;
  };
  
  Alert.prototype = {
    _next: null,
    _nextElement: null,
    _prev: null,
    _prevElement: null,
    _content: null,
    
    next: function (callback) {
      if (this._next) {
        callback(this._next)
        return;
      }
      
      if (!this._nextElement) {
        this._nextElement = this.element.next();
      }
      else {
        this._nextElement = this._nextElement.next();
      }
      
      if (this._nextElement.length === 0) {
        this._nextElement = null;
        callback(null); // no more alert
        return;
      }
      
      var type = this.type(this._nextElement);
      if (type === 'push') {
        this._next = new Alert(this._nextElement);
        this._next._prev = this;
        callback(this._next)
        return;
      }
      else if (type === 'issue') {
        this._next = new Alert(this._nextElement);
        this._next._prev = this;
        callback(this._next)
        return;
      }
      else {
        var _this = this;
        setTimeout(function () {
            _this.next(callback);
        }, 0);
        return;
      }
    },
    
    prev: function (callback) {
      if (this._prev) {
        callback(this._prev)
        return;
      }
      
      if (!this._prevElement) {
        this._prevElement = this.element.prev();
      }
      else {
        this._prevElement = this._prevElement.prev();
      }
      
      if (this._prevElement.length === 0) {
        this._prevElement = null;
        callback(null); // no more alert
        return;
      }
      
      var type = this.type(this._prevElement);
      if (type === 'push') {
        this._prev = new Alert(this._prevElement);
        this._prev._next = this;
        callback(this._prev)
        return;
      }
      else if (type === 'issue') {
        this._prev = new Alert(this._prevElement);
        this._prev._next = this;
        callback(this._prev)
        return;
      }
      else {
        var _this = this;
        setTimeout(function () {
            _this.prev(callback);
        }, 0);
        return;
      }
    },
    
    type: function(element) {
      if (!element) {
        element = this.element;
      }
      if (element.hasClass('push')) {
        return 'push';
      }
      else if (element.hasClass('issues_opened')) {
        return 'issue';
      }
      else if (element.hasClass('issues_comment')) {
        var url = $(element.find('.title a').get(1)).attr('href');
        if (url.lastIndexOf('http') === 0 ) { // the case of not relative path
          return 'issue';
        }
      }
      return 'other'; // default
    },
    
    get content() {
      if (this._content) {
        return this._content;
      }
      
      if (this.type() === 'push') {
        var content = this.element.find('.commits >ul').children();
        var more = false;
        content.each(function (idx, commit) {
          if ($(commit).hasClass('more')) {
            more = true;
          }
        });
        if (more) {
          content = content.splice(0, content.length-1); // remove 'more'
        }
        this._content = content;
      }
      else if (this.type() === 'issue') {
        var content = this.element.find('.message p');
        if (content.length !== 1) {
          content = this.element.find('.message blockquote');
        }
        this._content = content;
      }
      return this._content;
    }
  };

  var Cursor = function () {
  };
  
  Cursor.prototype = {
    _currentAlert: null,
    _currentContentIndex: -1,
    
    init: function (element, index) { // use to reset with random element
      this._currentContentIndex = index;
      this._currentAlert = new Alert(element);
    },
    
    next: function (callback) {
      if (!this._currentAlert) { // first time
        this._currentAlert = new Alert($('.news').children().first());
        if (this._currentAlert.type() === 'other') {
          var _this = this;
          this._currentAlert.next(function (nextAlert) {
            if(!nextAlert) {
              callback(null); // end of alert
              return;
            }
            _this._currentAlert = nextAlert;
            _this.next(callback);
          });
          return;
        }
      }
      
      // check content
      var element = this._currentAlert.content[this._currentContentIndex + 1];
      if (element) {
        this._currentContentIndex++;
        callback($(element));
        return;
      }
      else { // element is undefined (out of index)
        var _this = this;
        this._currentAlert.next(function (nextAlert) {
          if(!nextAlert) {
            callback(null); // end of alert
            return;
          }
          _this._currentContentIndex = -1;
          _this._currentAlert = nextAlert;
          _this.next(callback);
        });
        return;
      }
    },
    
    prev: function (callback) {
      if (!this._currentAlert) { // first time
        callback(null);
        return;
      }
      
      // check content
      var element = this._currentAlert.content[this._currentContentIndex - 1];
      if (element) {
        this._currentContentIndex--;
        callback($(element));
        return;
      }
      else { // element is undefined (out of index)
        var _this = this;
        this._currentAlert.prev(function (prevAlert) {
          if(!prevAlert) {
            callback(null); // end of alert
            return;
          }
		  
		  // FIXME: adhoc bug fix. content is null on specific condition.
		  if(prevAlert.content === null) {
            callback(null);
            return;
          }
		  
          _this._currentAlert = prevAlert;
          _this._currentContentIndex = _this._currentAlert.content.length;
          _this.prev(callback);
        });
        return;
      }
    },
    
    get current() {
      if (this._currentAlert) {
        return $(this._currentAlert.content[this._currentContentIndex]);
      }
      return null;
    },
    
    get type() {
      if (this._currentAlert) {
        return this._currentAlert.type();
      }
      return null;
    }
  };
  
  var cursor = new Cursor();
  var keyToggle = {
    bind: null,
    element: null,
    type: null,
  };
  
  var toggle = function (element, type) {
    if (type === 'push') {
	  diff.toggleOffOthers(element);
	  issue.toggleOffAll();
      diff.toggle(element);
    }
    else if (type === 'issue') {
      if (!element.hasClass('alert')) {
        element = element.parentsUntil('.news').last();
      }
	  issue.toggleOffOthers(element);
	  diff.toggleOffAll();
	  issue.toggle(element);
    }
	jumpTo(element);
  };
  
  var registerToggleShortcut = function (element) {
    if (keyToggle.bind) {
      // buggy! disabled.
      //if (keyToggle.element.find('.' + SHOW_CLASS).length !== 0) {
      //  toggle(keyToggle.element, keyToggle.type); // hide previous view
      //}
      keyToggle.bind.clear();
    }
    //keyToggle.element = element;
    //keyToggle.type = cursor.type;
    keyToggle.bind = KeyboardJS.bind.key(keyboardShortcutToggle, function () {
      toggle(element, cursor.type);
    });
  };
  
  // next
  var registerDownShortcut = function () {
    KeyboardJS.bind.key(keyboardShortcutDown, function () {
      if (cursor.current) {
        cursor.current.removeClass(CURSOR_CLASS);
      }
      cursor.next(function (element) {
        if (!element) {
          cursor.current.addClass(CURSOR_CLASS); // end of cursor
          return;
        }
        element.addClass(CURSOR_CLASS);
        jumpTo(element);
        
        registerToggleShortcut(element);
      });
    });
  };
  
  // prev
  var registerUpShortcut = function () {
    KeyboardJS.bind.key(keyboardShortcutUp, function () {
      if (cursor.current) {
        cursor.current.removeClass(CURSOR_CLASS);
      }
      cursor.prev(function (element) {
        if (!element) {
          if (cursor.current) {
            cursor.current.addClass(CURSOR_CLASS); // end of cursor
          }
          return;
        }
        element.addClass(CURSOR_CLASS);
        jumpTo(element);
        
        registerToggleShortcut(element);
      });
    });
  };
  
  var jumpTo = function (element) {
    window.scroll(0, element.offset().top - 50);
  };
  
  var registerScrollUpShortcut = function () {
    KeyboardJS.bind.key(keyboardShortcutScrollUp, function () {
	  var body = $(document.body);
	  window.scroll(body.scrollLeft(), body.scrollTop() - scrollSpeed);
    });
  };
  
  var registerScrollDownShortcut = function () {
    KeyboardJS.bind.key(keyboardShortcutScrollDown, function () {
	  var body = $(document.body);
	  window.scroll(body.scrollLeft(), body.scrollTop() + scrollSpeed);
    });
  };
  
  // import
  if (exports.gdbd.config) {
    var config = exports.gdbd.config;
    config.getOption('keyboardShortcutToggle', function (option) {
      keyboardShortcutToggle = option;
    });
    
    config.getOption('keyboardShortcutDown', function (option) {
      keyboardShortcutDown = option;
      registerDownShortcut();
    });
    
    config.getOption('keyboardShortcutUp', function (option) {
      keyboardShortcutUp = option;
      registerUpShortcut();
    });
	
	config.getOption('scrollSpeed', function (option) {
      scrollSpeed = option;
      config.getOption('keyboardShortcutScrollUp', function (option) {
        keyboardShortcutScrollUp = option;
        registerScrollUpShortcut();
      });
	  config.getOption('keyboardShortcutScrollDown', function (option) {
        keyboardShortcutScrollDown = option;
        registerScrollDownShortcut();
      });
    });
  }
  
  diff.onToggled = function (element) {
    if (cursor.current) {
      if (element.hasClass(CURSOR_CLASS)) {
        return; // already cursored
      }
      cursor.current.removeClass(CURSOR_CLASS);
    }
    var push = element.parent().parent().parent().parent().parent();
    var index = element.parent().children().index(element);
    cursor.init(push, index);
    cursor.current.addClass(CURSOR_CLASS);
    registerToggleShortcut(element);
  };
  
  issue.onToggled = function (element) {
    var content = element.find('.message p');
    if (content.length !== 1) {
      content = element.find('.message blockquote');
    }
    if (content.length !== 1) {
      content = element;
      element = content.parentsUntil('.news').last();
    }
    
    if (cursor.current) {
      if (content.find('p').first().hasClass(CURSOR_CLASS)) {
        return; // already cursored
      }
      cursor.current.removeClass(CURSOR_CLASS);
    }
    cursor.init(element, 0);
    cursor.current.addClass(CURSOR_CLASS);
    registerToggleShortcut(element);
  };
  
  // todo: long desc show diff
  
}(this));
