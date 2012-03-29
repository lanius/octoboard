(function (exports, $) {
  
  var config = gdbd.config;
  
  // Auto Paging
  var autoPagingCheckbox = $('#auto-paging-checkbox');
  var autoPagingStatus = $('#auto-paging-status');
  
  // restore option
  config.getOption('autoPaging', function (option) {
    // set default value
    if (option === null) {
      option = true;
    }
    
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
  
  
  // Hide Policy
  var hidePolicySelect = $('#hide-policy-select');
  
  // restore option
  config.getOption('hidePolicy', function (option) {
    // set default value
    if (option === null) {
      option = 'frame';
    }
    
    hidePolicySelect.val(option);
  });
  
  // register event handler
  hidePolicySelect.on('change', function () {
    config.setOption('hidePolicy', hidePolicySelect.val());
  });
  
  
  // Keyboard Shortcut
  var keyboardShortcutUp = $('#keyboard-shortcut-up');
  var keyboardShortcutDown = $('#keyboard-shortcut-down');
  var keyboardShortcutToggle = $('#keyboard-shortcut-toggle');
  
  // restore option
  config.getOption('keyboardShortcutUp', function (option) {
    // set default value
    if (option === null) {
      option = 'k';
    }
    
    keyboardShortcutUp.val(option);
  });
  config.getOption('keyboardShortcutDown', function (option) {
    // set default value
    if (option === null) {
      option = 'j';
    }
    
    keyboardShortcutDown.val(option);
  });
  config.getOption('keyboardShortcutToggle', function (option) {
    // set default value
    if (option === null) {
      option = 't';
    }
    
    keyboardShortcutToggle.val(option);
  });
  
  // register event handler
  keyboardShortcutUp.on('keyup', function () {
    config.setOption('keyboardShortcutUp', keyboardShortcutUp.val());
  });
  keyboardShortcutDown.on('keyup', function () {
    config.setOption('keyboardShortcutDown', keyboardShortcutDown.val());
  });
  keyboardShortcutToggle.on('keyup', function () {
    config.setOption('keyboardShortcutToggle', keyboardShortcutToggle.val());
  });
  
}(this, jQuery));
