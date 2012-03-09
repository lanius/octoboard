(function (exports) {
  
  var diff = exports.gdbd.diff;
  var issue = exports.gdbd.issue;
  
  var LABEL_CLASS = 'gdbd-cursor';
  
  var currentAlert = null;
  var currentAlertType = null;
  var currentCursor = null;
  
  var searchNextAlert = function (callback) {
    if (!currentAlert) {
      currentAlert = $('.news').children().first();
    }
    else {
      currentAlert = currentAlert.next();
    }
    
    if (isPush(currentAlert)) {
      currentAlertType = 'push';
      callback();
      return;
    }
    else if (isIssue(currentAlert)) {
      currentAlertType = 'issue';
      callback();
      return;
    }
    else {
      setTimeout(function () {
        searchNextAlert(callback);
      }, 0);
      return;
    }
  };
  
  var searchNextCursor = function (callback) {
    if (!currentAlert) {
      searchNextAlert(function () {
        setTimeout(function () {
          searchNextCursor(callback);
        }, 0);
      });
      return;
    }
    
    if (!currentCursor) { // first time
      if (currentAlertType === 'push') {
        currentCursor = searchCommit();
      }
      else if (currentAlertType === 'issue') {
        currentCursor = searchIssue();
      }
      currentCursor.addClass(LABEL_CLASS);
      callback();
      return;
    }
    else {
      currentCursor.removeClass(LABEL_CLASS);
      
      if (currentAlertType === 'push') {
        currentCursor = currentCursor.next();
        if (currentCursor.hasClass('more')) {
          currentAlertType = null;
          currentCursor = null;
          searchNextAlert(function () {
            setTimeout(function () {
              searchNextCursor(callback);
            }, 0);
          });
          return;
        }
        else {
          currentCursor.addClass(LABEL_CLASS);
          callback();
          return;
        }
      }
      else if (currentAlertType === 'issue') {
        currentAlertType = null;
        currentCursor = null;
        searchNextAlert(function () {
          setTimeout(function () {
            searchNextCursor(callback);
          }, 0);
        });
        return;
      }
    }
  };
  
  var searchCommit = function () {
    return currentAlert.find('.commits ul').children().first();
  };
  
  var searchIssue = function () {
    var issue = currentAlert.find('.message p');
    if (issue.length !== 1) {
      issue = currentAlert.find('.message blockquote');
    }
    return issue;
  };
  
  var isPush = function (alertObj) {
    return alertObj.hasClass('push');
  };
  
  var isIssue = function (alertObj) {
    if (alertObj.hasClass('issues_opened')) {
      return true;
    }
    else if (alertObj.hasClass('issues_comment')) {
      var url = $(alertObj.find('.title a').get(1)).attr('href');
      if (url.lastIndexOf('http') !== 0 ) { // the case of relative path
        return false;
      }
      return true;
    }
    return false;
  };
  
  KeyboardJS.bind.key('j', function () {
    searchNextCursor(function () {
      window.scroll(0, currentAlert.offset().top);
      // todo: bind key 't' to toggle
    });
  });
  
}(this));
