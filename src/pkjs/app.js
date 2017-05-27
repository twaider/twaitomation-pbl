// Import the Clay package
var Clay = require('pebble-clay');
// Load our Clay configuration file
var clayConfig = require('./config');
// Initialize Clay
var clay = new Clay(clayConfig);
var messageKeys = require('message_keys');
var baseUrl = '';

function urlencode(str) {
    str = (str + '').toString();
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A');
}

function getLocalStorageItem ( key ) {
   var item = localStorage.getItem(key);
   if ( item != 'null' && item != null && item != 'undefined' && item != 'None' && item != '' ) {
      return item;
   }
   return false;
}

var Base64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },
    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = 0;
//        var c1 = 0;
        var c2 = 0;
        var c3 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
};

Pebble.addEventListener('ready', function(e) {
  var baseUrl = getLocalStorageItem('SERVER');
  var url = baseUrl + '/api/states?api_password=' + getLocalStorageItem('PASS');
  xhrWrapper(url, 'get', {}, function(req) {
    if (req.status == 200) {
      var json = JSON.parse(req.response);
      console.log(json);
      Pebble.sendAppMessage({'APP_READY': true});
      Pebble.sendAppMessage({'STATES': json});
    }
  });
  
});

Pebble.addEventListener('appmessage', function(dict) {
  if (dict.payload['DEVICE_UUID'] && dict.payload['STATUS']) {
    var delayed = dict.payload['DELAYED'] == '1';
    toggle(dict.payload['DEVICE_UUID'], dict.payload['STATUS'], delayed);
  }
});

function toggle(device_uuid, status, delayed) {
  var baseUrl = getLocalStorageItem('SERVER');
  var url = baseUrl + '/api/services/light/toggle?api_password=' + getLocalStorageItem('PASS');
  var data = "{\"entity_id\":\"light." + device_uuid +  "\"}";
  console.log(data);
  xhrWrapper(url, 'post', data, function(req) {
    if (req.status == 200) {
      var json = JSON.parse(req.response);
      console.log(json);
    }
  });
}

function sendResultToPebble(json) {
  if(json && json.status) {
    var status = parseInt(json.status);
    Pebble.sendAppMessage({
      'DEVICE_STATUS': status
    });
  }
}

function xhrWrapper(url, type, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(xhr);
  };
  xhr.open(type, url);
  xhr.setRequestHeader("x-ha-access", getLocalStorageItem("PASS"));
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send(data);
}

Pebble.addEventListener('webviewclosed', function ( e ) {
   if ( e && !e.response ) {
      return;
   }
   var dict = clay.getSettings(e.response);
   var claySettings = clay.getSettings(e.response);
     
   if ( claySettings[messageKeys.USERNAME] && claySettings[messageKeys.PASS]  && claySettings[messageKeys.SERVER] ) {
     
      if ( claySettings[messageKeys.SERVER] && claySettings[messageKeys.SERVER] != "" ) {
         localStorage.setItem("SERVER", claySettings[messageKeys.SERVER]);
      } else {
         localStorage.setItem("SERVER", null);
      }
      if ( claySettings[messageKeys.PASS] && claySettings[messageKeys.PASS] != "" ) {
         localStorage.setItem("PASS", claySettings[messageKeys.PASS]);
      } else {
         localStorage.setItem("PASS", null);
      }     
      if ( claySettings[messageKeys.USERNAME] && claySettings[messageKeys.USERNAME] != "" ) {
         localStorage.setItem("USERNAME", claySettings[messageKeys.USERNAME]);
      } else {
         localStorage.setItem("USERNAME", null);
      } 
   } else {
      // Send settings values to watch side
      Pebble.sendAppMessage(dict, function ( e ) {
         //console.log('Sent config data to Pebble');
      }, function ( e ) {
         console.log('Failed to send config data!');
         console.log(JSON.stringify(e));
      });
   }
});
