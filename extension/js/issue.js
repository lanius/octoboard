(function (exports, $) {
  
  var SHOW_LABEL = 'show discussion';
  var HIDE_LABEL = 'hide discussion';
  var LABEL_CLASS = 'gdbd-popup-issue';
  var CONTAINER_CLASS = 'gdbd-issue-container'
  
  var hidePolicy = 'frame';
  
  var setToIssues = function (issues) {
    issues.each(function (idx, issue) {
      setToIssue($(issue));
    });
  };
  
  var setToIssue = function (issue) {
    if (getUrl(issue).lastIndexOf('http') !== 0 ) { // the case of relative path
      return;
    }
    var link = $('<a>');
    link.html(SHOW_LABEL).addClass(LABEL_CLASS);
    link.on('click', function () {
      toggle(issue);
    });
    getTarget(issue).append(link);
  };
  
  var toggle = function (issue) {
    var container = issue.find('.' + CONTAINER_CLASS);
    var link = issue.find('.' + LABEL_CLASS);
    var url = getUrl(issue);
    var target = getTarget(issue);
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
    target.append(loading);
    
    $.get(url).then(function (data, status, xhr) {
      var discussion = $(data).find('.discussion-timeline');
      discussion.css('width', 'auto')
      
      var container = $('<div>');
      container.addClass(CONTAINER_CLASS);
      
      // remove buggy element
      discussion.find('.comment-form.previewable-comment-form .comment.normal-comment').remove();
      
      // setup form
      var auth_token = discussion.find('input[name=authenticity_token]').val();
      var form = discussion.find('form.js-new-comment-form');
      
      var post = function (action, data, callback) {
        var headers = {
          'X-CSRF-Token': auth_token,
          'Accept': 'application/json, text/javascript, */*; q=0.01',
        };
        $.ajax({
          url: action,
          type: 'POST',
          data: data,
          headers: headers,
          success: function (result, status, xhr) {
            callback(result);
          },
        });
        return;
      };
      
      var updateForms = function (status, result) {
        var commentsTarget = $(discussion.find('.new-comments').get(0));
        commentsTarget.append($(result.discussion));
        
        if (status === 'comment') {
          return;
        }
        
        var formActionBar = $('.bubble .action-bar');
        formActionBar.children().remove();
        formActionBar.append($(result.formActionBar));
        
        var formActions = $('.form-actions').last();
        formActions.children().remove();
        formActions.append($(result.formActions));
        
        registerCommentEvent();
        if (status === 'close') {
          registerReopenEvent();
        }
        else if (status === 'reopen'){
          registerCloseAndCommentEvent();
          registerCloseEvent();
        }
      };
      
      // comment
      var comment = null;
      var registerCommentEvent = function () {
        comment = form.find('.primary');
        comment.on('click', function (e) {
          var textarea = form.find('textarea')
          var content = textarea.val();
          textarea.val('');
          
          if (content === '') {
             return false;
          }
          
          var s = url.split('#')[0].split('/');
          var no = s[s.length-1];
          
          var data = {
            authenticity_token: auth_token,
            'comment[body]': content,
            issue: no
          };
          
          post(form.attr('action'), data, function (result) {
            updateForms('comment', result);
          });
          
          return false;
        });
      };
      registerCommentEvent();
      
      // close and comment
      var closeAndComment = null;
      var registerCloseAndCommentEvent = function () {
        closeAndComment = form.find('[name=comment_and_close]');
        closeAndComment.on('click', function (e) {
          var textarea = form.find('textarea')
          var content = textarea.val();
          textarea.val('');
          
          if (content === '') {
             return false;
          }
          
          var s = url.split('#')[0].split('/');
          var no = s[s.length-1];
          
          var data = {
            authenticity_token: auth_token,
            'comment[body]': content,
            issue: no,
            comment_and_close: 1,
          };
          
          post(form.attr('action'), data, function (result) {
            updateForms('close', result);
          });
          
          return false;
        });
      
      };
      registerCloseAndCommentEvent();
      
      // close
      var close = null;
      var registerCloseEvent = function (reopen) {
        close = discussion.find('a.btn-close-issue');
        close.on('click', function () {
          post(close.attr('href'), {}, function (result) {
            updateForms('close', result);
          });
          return false;
        });
      };
      registerCloseEvent();
      
      // reopen
      var reopen = null;
      var registerReopenEvent = function () {
        reopen = discussion.find('a.btn-reopen');
        reopen.on('click', function () {
          post(reopen.attr('href'), {}, function (result) {
            updateForms('reopen', result);
          });
          return false;
        });
      };
      registerReopenEvent(reopen);
      
      var inner = $('<div>');
      inner.append(discussion);
      
      var topFrame = $('<div class="gdbd-issue-frame">');
      var bottomFrame = $('<div class="gdbd-issue-frame">');
      
      container.append(topFrame);
      container.append(inner);
      container.append(bottomFrame);
      
      if (hidePolicy === 'frame') {
        topFrame.on('click', function () {
          container.hide();
          link.html(SHOW_LABEL);
        });
        bottomFrame.on('click', function () {
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
      target.append(container);
    });
    
    link.html(HIDE_LABEL);
  };
  
  var getUrl = function (issue) {
    return $(issue.find('.title a').get(1)).attr('href');
  };
  
  var getTarget = function (issue) {
    var target = issue.find('.message p');
    if (target.length !== 1) {
      target = issue.find('.message blockquote');
    }
    return target;
  };
  
  var getAllIssueOpened = function () {
    return $(".alert.issues_opened").children();
  };
  
  var getAllIssueComment = function () {
    return $(".alert.issues_comment").children();
  };

  var getPagingLink = function () {
    return $(".pagination.ajax_paginate a");
  };

  var diff = function(large, small) {
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
        var latestIssueOpened = getAllIssueOpened();
        var newIssueOpened = diff(latestIssueOpened, currentIssueOpened);
        setToIssues(newIssueOpened);
        currentIssueOpened = latestIssueOpened;
        
        var latestIssueComment = getAllIssueComment();
        var newIssueComment = diff(latestIssueComment, currentIssueComment);
        setToIssues(newIssueComment);
        currentIssueComment = latestIssueComment;
        
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
  
  // set "show discussion"
  var currentIssueOpened = getAllIssueOpened();
  var currentIssueComment = getAllIssueComment();
  if (currentIssueOpened.length === 0 && currentIssueComment.length === 0) {
    return;
  }
  setToIssues(currentIssueOpened);
  setToIssues(currentIssueComment);
  
  // set event listener for paging
  var currentPagingLink = 2;
  getPagingLink().on('click', update);
  
  // exports some functions
  if (exports.gdbd === undefined) {
    exports.gdbd = {};
  }
  exports.gdbd.issue = {};
  exports.gdbd.issue.update = update;
  exports.gdbd.issue.toggle = toggle;
  
  if (exports.gdbd.config) {
    exports.gdbd.config.getOption('hidePolicy', function (option) {
      hidePolicy = option;
    });
  }
  
}(this, jQuery));
