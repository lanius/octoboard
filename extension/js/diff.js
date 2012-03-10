(function (exports, $) {
  
  var SHOW_LABEL = 'show diff';
  var HIDE_LABEL = 'hide diff';
  var SHOW_CLASS = 'gdbd-show';
  var HIDE_CLASS = 'gdbd-hide';
  var LABEL_CLASS = 'gdbd-popup-diff';
  var CONTAINER_CLASS = 'gdbd-diff-container'
  
  var hidePolicy = 'frame';
  
  var setToPushes = function (pushes) {
    pushes.each(function (idx, push) {
      setToPush($(push));
    });
  };
  
  var setToPush = function (push) {
    var commits = push.find('.commits ul');
    commits.children().each(function (idx, commit) {
      setToCommit($(commit));
    });
  };
  
  var setToCommit = function (commit) {
    var link = $('<a>');
    link.html(SHOW_LABEL).addClass(LABEL_CLASS);
    if (!getUrl(commit)) { // the case of "n more commits"
      return;
    }
    link.on('click', function () {
      toggle(commit);
    });
    commit.append(link);
  };
  
  var toggle = function (commit) {
    var container = commit.find('.' + CONTAINER_CLASS);
    var link = commit.find('.' + LABEL_CLASS);
    var url = getUrl(commit);
    
    var show = function (container) {
      if (container.length !== 0) {
        container.show();
      }
      link.html(HIDE_LABEL);
      link.removeClass(HIDE_CLASS);
      link.addClass(SHOW_CLASS);
    };
    var hide = function (container) {
      if (container.length !== 0) {
        container.hide();
      }
      link.html(SHOW_LABEL);
      link.removeClass(SHOW_CLASS);
      link.addClass(HIDE_CLASS);
    };
    
    if (container.length !== 0) {
      if (link.html() === HIDE_LABEL) {
        hide(container);
      }
      else {
        show(container);
      }
      onToggled(commit);
      return;
    }
    
    if (commit.find('.loading').length !== 0) {
      return; // now loading
    }
    
    var loading =  $('<span class="loading"> loading...</span>');
    commit.append(loading);
    
    $.get(url).then(function (data, status, xhr) {
      var diff = $(data).find('#files');
      
      var frame = diff.find('.meta');
      frame.addClass('gdbd-diff-frame');
      
      var container = $('<div>');
      container.addClass(CONTAINER_CLASS);
      container.append(diff);
      
      if (hidePolicy === 'frame') {
        frame.on('click', function () {
          hide(container);
        });
      }
      else { // hidePolicy === 'any'
        container.on('click', function () {
          hide(container);
        });
      }
      
      loading.remove();
      commit.append(container);
    });
    
    show(container);
    onToggled(commit);
  };
  
  var getUrl = function (commit) {
    return commit.find('code a').attr('href');
  };
  
  var getAllPushes = function () {
    return $(".alert.push").children();
  };

  var getPagingLink = function () {
    return $(".pagination.ajax_paginate a");
  };

  var diff = function(large, small) { // this does not specify "diff" of git!
    return large.filter(function (i, obj) {
      return !(small.index(obj) > -1); 
    });
  };

  var update = function (onUpdated) {
    setTimeout(function () {
      var pagingPath = getPagingLink().attr('href');
      var lastPage = false;
      var nextPagingLink = -1;
      if (pagingPath === undefined) {
        lastPage = true; // not found paging link (at last page)
      }
      else {
        var s = pagingPath.split('/');
        nextPagingLink = Number(s[s.length-1]);
      }
      
      if (lastPage || currentPagingLink < nextPagingLink) {
        var latestPushes = getAllPushes();
        var newPushes = diff(latestPushes, currentPushes);
        
        setToPushes(newPushes);
        currentPushes = latestPushes;
        
        currentPagingLink = nextPagingLink;
        getPagingLink().on('click', update);
        
        if (onUpdated) {
          onUpdated();
        }
      }
      else {
        update();
      }
    }, 1000);
  };
  
  // set "show diff"
  var currentPushes = getAllPushes();
  if (currentPushes.length === 0) {
    return;
  }
  setToPushes(currentPushes);
  
  // set event listener for paging
  var currentPagingLink = 2;
  getPagingLink().on('click', update);
  
  // export
  if (!exports.gdbd) {
    exports.gdbd = {};
  }
  exports.gdbd.diff = {};
  exports.gdbd.diff.update = update;
  exports.gdbd.diff.toggle = toggle;
  
  // import
  if (exports.gdbd.config) {
    exports.gdbd.config.getOption('hidePolicy', function (option) {
      hidePolicy = option;
    });
  }
  var onToggled = function (commit) {
    exports.gdbd.diff.onToggled(commit);
  };
  
}(this, jQuery));
