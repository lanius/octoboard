(function (exports, $) {
  
  var SHOW_LABEL = 'show discussion';
  var HIDE_LABEL = 'hide discussion';
  
  var ELEMENT_ROOT = 'octbd-issue-root';
  
  var SHOW_CLASS = 'gdbd-show';
  var HIDE_CLASS = 'gdbd-hide';
  var LABEL_CLASS = 'gdbd-popup-issue';
  var CONTAINER_CLASS = 'gdbd-issue-container'
  
  var hidePolicy = 'frame';
  
  
  var elementRoot = $('<div>');
  elementRoot.attr('id', ELEMENT_ROOT);
  $(document.body).append(elementRoot);
  
  
  var elementCache = {};
  
  
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
    
    var show = function (container) {
      container.show();
      link.html(HIDE_LABEL);
      link.removeClass(HIDE_CLASS);
      link.addClass(SHOW_CLASS);
    };
    var hide = function (container) {
      container.hide();
      link.html(SHOW_LABEL);
      link.removeClass(SHOW_CLASS);
      link.addClass(HIDE_CLASS);
    };
    
    var cachedElement = elementCache[url];
    if (cachedElement) {
      if (link.html() === HIDE_LABEL) {
        hide(cachedElement);
      }
      else {
        show(cachedElement);
      }
      onToggled(issue);
      return;
    }
    
    if (target.find('.loading').length !== 0) {
      return; // now loading
    }
    
    var loading =  $('<span class="loading"> loading...</span>');
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
          hide(container);
        });
        bottomFrame.on('click', function () {
          hide(container);
        });
      }
      else { // hidePolicy === 'any'
        container.on('click', function () {
          hide(container);
        });
      }
      
      loading.remove();
      
      elementRoot.append(container);
      container.css('top', target.offset().top + target.height());
      elementCache[url] = container;
      
      show(container);
      onToggled(issue);
    });
    
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
    return $(".alert.issues_opened");
  };
  
  var getAllIssueComment = function () {
    return $(".alert.issues_comment");
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
      if (!pagingPath) {
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
  
  // export
  if (!exports.gdbd) {
    exports.gdbd = {};
  }
  exports.gdbd.issue = {};
  exports.gdbd.issue.update = update;
  exports.gdbd.issue.toggle = toggle;
  
  // import
  if (exports.gdbd.config) {
    exports.gdbd.config.getOption('hidePolicy', function (option) {
      hidePolicy = option;
    });
  }
  var onToggled = function (issue) {
    exports.gdbd.issue.onToggled(issue);
  };
  
}(this, jQuery));
