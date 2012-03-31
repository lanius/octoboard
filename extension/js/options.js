(function (exports, $) {
  
  var config = gdbd.config;
  
  var optionChanged = function () {
    $('#message').text("Please reload GitHub page to reflect changed options.");
  };
  
  // Auto Paging
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
	optionChanged();
  });
  
  
  // Hide Policy
  var hidePolicySelect = $('#hide-policy-select');
  
  // restore option
  config.getOption('hidePolicy', function (option) {
    hidePolicySelect.val(option);
  });
  
  // register event handler
  hidePolicySelect.on('change', function () {
    config.setOption('hidePolicy', hidePolicySelect.val());
	optionChanged();
  });
  
  
  // Keyboard Shortcut
  var keyboardShortcutUp = $('#keyboard-shortcut-up');
  var keyboardShortcutDown = $('#keyboard-shortcut-down');
  var keyboardShortcutToggle = $('#keyboard-shortcut-toggle');
  var keyboardShortcutScrollUp = $('#keyboard-shortcut-scroll-up');
  var keyboardShortcutScrollDown = $('#keyboard-shortcut-scroll-down');
  var scrollSpeed = $('#scroll-speed');
  
  // restore option
  config.getOption('keyboardShortcutUp', function (option) {
    keyboardShortcutUp.val(option);
  });
  config.getOption('keyboardShortcutDown', function (option) {
    keyboardShortcutDown.val(option);
  });
  config.getOption('keyboardShortcutToggle', function (option) {
    keyboardShortcutToggle.val(option);
  });
  config.getOption('keyboardShortcutScrollUp', function (option) {
    keyboardShortcutScrollUp.val(option);
  });
  config.getOption('keyboardShortcutScrollDown', function (option) {
    keyboardShortcutScrollDown.val(option);
  });
  config.getOption('scrollSpeed', function (option) {
    scrollSpeed.val(option);
  });
  
  // register event handler
  keyboardShortcutUp.on('keyup', function () {
    config.setOption('keyboardShortcutUp', keyboardShortcutUp.val());
	optionChanged();
  });
  keyboardShortcutDown.on('keyup', function () {
    config.setOption('keyboardShortcutDown', keyboardShortcutDown.val());
	optionChanged();
  });
  keyboardShortcutToggle.on('keyup', function () {
    config.setOption('keyboardShortcutToggle', keyboardShortcutToggle.val());
	optionChanged();
  });
  keyboardShortcutScrollUp.on('keyup', function () {
    config.setOption('keyboardShortcutScrollUp', keyboardShortcutScrollUp.val());
	optionChanged();
  });
  keyboardShortcutScrollDown.on('keyup', function () {
    config.setOption('keyboardShortcutScrollDown', keyboardShortcutScrollDown.val());
	optionChanged();
  });
  scrollSpeed.on('keyup', function () {
    config.setOption('scrollSpeed', scrollSpeed.val());
	optionChanged();
  });
  
}(this, jQuery));
