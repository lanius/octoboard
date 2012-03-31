(function (exports) {
  
  var defaultValues = {};
  defaultValues['autoPaging'] = true;
  defaultValues['hidePolicy'] = 'frame';
  defaultValues['keyboardShortcutUp'] = 'k';
  defaultValues['keyboardShortcutDown'] = 'j';
  defaultValues['keyboardShortcutToggle'] = 't';
  defaultValues['keyboardShortcutScrollUp'] = 'f';
  defaultValues['keyboardShortcutScrollDown'] = 'g';
  defaultValues['scrollSpeed'] = 10;
  
  var getOption = function (key) {
    var value = localStorage.getItem(key);
    if (value === null) {
      value = defaultValues[key];
    }
    return value;
  };
  
  var setOption = function (key, value) {
    localStorage.setItem(key, value);
  };
  
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method === 'get') {
      sendResponse({value: getOption(request.key)});
    }
    else if (request.method === 'set') {
      setOption(request.key, request.value);
      sendResponse({});
    }
  });
  
}(this));
