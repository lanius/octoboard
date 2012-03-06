(function (exports, $) {
  
  var config = gdbd.config;
  var diff = gdbd.diff;
  var issue = gdbd.issue;
  
  var displayHeight = function () {
    return $(document).height();
  };
  
  var scrolledHeight = function () {
    return $(window).scrollTop() + $(window).height();
  };
  
  var registerAutoPaging = function () {
    
    var loadingDiff = false;
    var loadingIssue = false;
    var startLoading = function () {
      loadingDiff = true;
      loadingIssue = true;
    };
    var isLoading = function () {
      return (loadingDiff || loadingIssue);
    };
    
    $(document).on('scroll', function () {
      if (isLoading()) {
        return;
      }
      
      var pagingLink = $(".pagination.ajax_paginate a");
      if (pagingLink.length === 0) {
        return;
      }
      
      if ((scrolledHeight() / displayHeight()) > 0.8) {
        startLoading();
        $.get(pagingLink.attr('href')).then(function (data, status, xhr) {
          if (data.indexOf('div') < 0) { // last page
            pagingLink.remove();
          }
          else {
            pagingLink.parent().before($(data));
            pagingLink.remove();
            
            diff.update(function () {
              loadingDiff = false;
            });
            issue.update(function () {
              loadingIssue = false;
            });
          }
        });
        
      }
      
    });
  };
  
  config.getOption('autoPaging', function (option) {
    if (option === true) {
      registerAutoPaging();
    }
  });
  
}(this, jQuery));
