(function (exports, $) {
  
  var SHOW_LABEL = 'show diff';
  var HIDE_LABEL = 'hide diff';
  var LABEL_CLASS = 'gdbd-popup-diff';
  var DIFF_CONTAINER_CLASS = 'gdbd-diff-container'
  
  var hidePolicy = 'frame';
  
  var setShowDiff = function (pushes) {
    pushes.each(function (idx, push) {
      setShowDiffToPush($(push));
    });
  };
  
  var setShowDiffToPush = function (push) {
    var commits = push.find(".commits ul");
    commits.children().each(function (idx, commit) {
      setShowDiffToCommit($(commit));
    });
  };
  
  var setShowDiffToCommit = function (commit) {
    var link = $('<a>');
    link.html(SHOW_LABEL);
    link.addClass(LABEL_CLASS);
    var url = commit.find('code a').attr('href');
    if (!url) {
      return; // the case of "n more commits"
    }
    link.on('click', function () {
      toggleDiff(commit);
    });
    commit.append(link);
  };
  
  var toggleDiff = function (commit) {
    var container = commit.find('.' + DIFF_CONTAINER_CLASS);
    var link = commit.find('.' + LABEL_CLASS);
    var url = commit.find('code a').attr('href');
    if (container.length !== 0) {
      if (link.html() === HIDE_LABEL) {
        container.hide();
        link.html(SHOW_LABEL);
      }
      else {
        container.show();
        link.html(HIDE_LABEL);
      }
      return;
    }
    
    var loading =  $('<span> loading...</span>');
    commit.append(loading);
    
    $.get(url).then(function (data, status, xhr) {
      var diff = $(data).find('#files');
      
      var frame = diff.find('.meta');
      frame.addClass('gdbd-diff-frame');
      
      var container = $('<div>');
      container.addClass(DIFF_CONTAINER_CLASS);
      container.append(diff);
      
      if (hidePolicy === 'frame') {
        frame.on('click', function () {
          container.hide();
          link.html(SHOW_LABEL);
        });
      }
      else { // hidePolicy === 'any'
        container.on('click', function () {
          container.hide();
          link.html(SHOW_LABEL);
        });
      }
      
      loading.remove();
      commit.append(container);
    });
    
    link.html(HIDE_LABEL);
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

  var updateShowDiff = function (onUpdated) {
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
        
        setShowDiff(newPushes);
        currentPushes = latestPushes;
        
        currentPagingLink = nextPagingLink;
        getPagingLink().on('click', updateShowDiff);
        
        if (onUpdated) {
          onUpdated();
        }
      }
      else {
        updateShowDiff();
      }
    }, 1000);
  };
  
  // set "show diff"
  var currentPushes = getAllPushes();
  if (currentPushes.length === 0) {
    return;
  }
  setShowDiff(currentPushes);
  
  // set event listener for paging
  var currentPagingLink = 2;
  getPagingLink().on('click', updateShowDiff);
  
  // exports some functions
  if (exports.gdbd === undefined) {
    exports.gdbd = {};
  }
  exports.gdbd.diff = {};
  exports.gdbd.diff.update = updateShowDiff;
  
  if (exports.gdbd.config) {
    exports.gdbd.config.getOption('hidePolicy', function (option) {
      hidePolicy = option;
    });
  }
  
}(this, jQuery));
