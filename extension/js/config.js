(function (exports) {
  
  var config = {};
  
  config.getOption = function (key, callback) {
    chrome.extension.sendRequest({method: 'get', key: key}, function(response) {
      var value = response.value;
      
      // change a string to a type
      if (value === 'true') {
        value = true;
      }
      else if (value === 'false') {
        value = false;
      }
      
      callback(value);
    });
  };
  
  config.setOption = function (key, value) {
    chrome.extension.sendRequest({method: 'set', key: key, value: value}, function(response) {
      return;
    });
  };
  
  // exports
  if (exports.gdbd === undefined) {
    exports.gdbd = {};
  }
  exports.gdbd.config = config;
  
  
  // fix hack
  $('.alert').css('position', 'static');
  
}(this));
