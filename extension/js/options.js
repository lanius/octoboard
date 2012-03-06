(function (exports, $) {
  
  var config = gdbd.config;
  
  // auto paging
  var autoPagingCheckbox = $('#auto-paging-checkbox');
  var autoPagingStatus = $('#auto-paging-status');
  // restore option
  config.getOption('autoPaging', function (option) {
    if (option === true) {
      autoPagingCheckbox.attr('checked', 'checked');
      autoPagingStatus.text('ON');
    }
    else {
      autoPagingStatus.text('OFF');
    }
  });
  // register event handler
  autoPagingCheckbox.on('change', function () {
    if (autoPagingCheckbox.attr('checked') === 'checked') {
      config.setOption('autoPaging', true);
      autoPagingStatus.text('ON');
    }
    else {
      config.setOption('autoPaging', false);
      autoPagingStatus.text('OFF');
    }
  });
  
  // hide policy
  var hidePolicySelect = $('#hide-policy-select');
  // restore option
  config.getOption('hidePolicy', function (option) {
    hidePolicySelect.val(option);
  });
  // register event handler
  hidePolicySelect.on('change', function () {
    config.setOption('hidePolicy', hidePolicySelect.val());
  });
  
}(this, jQuery));
