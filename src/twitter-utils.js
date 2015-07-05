angular.module('twitter.utils', [])

.factory('$twitterHelpers', ['$q', '$http', function($q, $http) {

  /* This snippet is copied from Nic Raboy's ngCordovaOauth
  * For more information see: https://github.com/nraboy/ng-cordova-oauth
  * Sign an Oauth 1.0 request
  *
  * Addition From Simon Reimler:
  * Encode Bodyparams with escapeSpecialCharacters(), because Twitter is very strict with OAuth.
  * See: http://stackoverflow.com/questions/14672502/bug-or-spec-change-of-twitter-api-1-1
  *
  * @param    string method
  * @param    string endPoint
  * @param    object headerParameters
  * @param    object bodyParameters
  * @param    string secretKey
  * @param    string tokenSecret (optional)
  * @return   object
  */
  function createSignature(method, endPoint, headerParameters, bodyParameters, secretKey, tokenSecret) {
    if(typeof jsSHA !== "undefined") {
      var headerAndBodyParameters = angular.copy(headerParameters);
      var bodyParameterKeys = Object.keys(bodyParameters);
      for(var i = 0; i < bodyParameterKeys.length; i++) {
        headerAndBodyParameters[bodyParameterKeys[i]] = escapeSpecialCharacters(bodyParameters[bodyParameterKeys[i]]);
      }
      var signatureBaseString = method + "&" + encodeURIComponent(endPoint) + "&";
      var headerAndBodyParameterKeys = (Object.keys(headerAndBodyParameters)).sort();
      for(i = 0; i < headerAndBodyParameterKeys.length; i++) {
        if(i == headerAndBodyParameterKeys.length - 1) {
          signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]]);
        } else {
          signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]] + "&");
        }
      }
      var oauthSignatureObject = new jsSHA(signatureBaseString, "TEXT");

      var encodedTokenSecret = '';
      if (tokenSecret) {
        encodedTokenSecret = encodeURIComponent(tokenSecret);
      }

      headerParameters.oauth_signature = encodeURIComponent(oauthSignatureObject.getHMAC(encodeURIComponent(secretKey) + "&" + encodedTokenSecret, "TEXT", "SHA-1", "B64"));
      var headerParameterKeys = Object.keys(headerParameters);
      var authorizationHeader = 'OAuth ';
      for(i = 0; i < headerParameterKeys.length; i++) {
        if(i == headerParameterKeys.length - 1) {
          authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '"';
        } else {
          authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '",';
        }
      }
      return { signature_base_string: signatureBaseString, authorization_header: authorizationHeader, signature: headerParameters.oauth_signature };
    } else {
      return "Missing jsSHA JavaScript library";
    }
  }

  /* This snippet is copied from Nic Raboy's ngCordovaOauth
  * For more information see: https://github.com/nraboy/ng-cordova-oauth
  *
  * Create Random String Nonce
  *
  * @param    integer length
  * @return   string
  */
  function createNonce(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  function escapeSpecialCharacters(string) {
    var tmp = encodeURIComponent(string);
    tmp = tmp.replace(/\!/g, "%21");
    tmp = tmp.replace(/\'/g, "%27");
    tmp = tmp.replace(/\(/g, "%28");
    tmp = tmp.replace(/\)/g, "%29");
    tmp = tmp.replace(/\*/g, "%2A");
    return tmp;
  }

  function transformRequest(obj) {
      var str = [];
      for(var p in obj)
      str.push(encodeURIComponent(p) + "=" + escapeSpecialCharacters(obj[p]));
      console.log(str.join('&'));
      return str.join('&');
  }

  return {
    createTwitterSignature: function(method, url, bodyParameters, clientId, clientSecret, token) {
      var oauthObject = {
        oauth_consumer_key: clientId,
        oauth_nonce: createNonce(10),
        oauth_signature_method: "HMAC-SHA1",
        oauth_token: token.oauth_token,
        oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
        oauth_version: "1.0"
      };
      var signatureObj = createSignature(method, url, oauthObject, bodyParameters, clientSecret, token.oauth_token_secret);
      $http.defaults.headers.common.Authorization = signatureObj.authorization_header;
      return signatureObj;
    },
    transformRequest: transformRequest
  };
}]);
