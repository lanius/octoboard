(function (exports) {
  
  var getOption = function (key) {
    var value = localStorage.getItem(key);
    
    // set default value
    if (value === null) {
      if (key === 'autoPaging') {
        value = true;
      }
      else if (key === 'hidePolicy') {
        value = 'frame';
      }
      else {
        value = null;
      }
      setOption(key, value);
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
