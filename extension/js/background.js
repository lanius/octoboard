(function (exports) {
  
  var getOption = function (key) {
    return localStorage.getItem(key);
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
