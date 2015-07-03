angular.module('twitter.functions', [])

.factory('$twitterApi', ['$q', '$twitterHelpers', '$http', function($q, $twitterHelpers, $http) {
  var token;
  var clientId = '';
  var clientSecret = '';

  var HOME_TIMELINE_URL = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
  var SEARCH_TWEETS_URL = 'https://api.twitter.com/1.1/search/tweets.json';
  var STATUS_UPDATE_URL = 'https://api.twitter.com/1.1/statuses/update.json';

  function makeHttpGetRequest(url, data, deferred) {
    $http({
        method: 'GET',
        url: url,
        params: data
      })
    .success(function(data, status, headers, config) {
      deferred.resolve(data);
    })
    .error(function(data, status, headers, config) {
        if (status === 401) {
          token = null;
        }
        deferred.reject(status);
    });
    return deferred.promise;
  }

  function makeHttpPostRequest(url, params, deferred) {
    $http.post(url, params)
    // $http({
    // method: 'POST',
    // url: url,
    // transformRequest: function(obj) {
    //     var str = [];
    //     for(var p in obj)
    //     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    //     console.log(str.join("&"));
    //     return str.join("&");
    // },
    // data: params
    // })
    .success(function(data, status, headers, config) {
      deferred.resolve(data);
    })
    .error(function(data, status, headers, config) {
        if (status === 401) {
          token = null;
        }
        deferred.reject(status);
    });
    return deferred.promise;
  }

  function transformRequest(obj) {
      var str = [];
      for(var p in obj)
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      console.log(str.join("&"));
      return str.join("&");
  }

  return {
    configure: function(cId, cSecret, authToken) {
      clientId = cId;
      clientSecret = cSecret;
      token = authToken;
    },
    getHomeTimeline: function(parameters) {
      var deferred = $q.defer();
      if (typeof(parameters)==='undefined') parameters = {};
      $twitterHelpers.createTwitterSignature('GET', HOME_TIMELINE_URL, parameters, clientId, clientSecret, token);
      return makeHttpGetRequest(HOME_TIMELINE_URL, parameters, deferred);
    },
    searchTweets: function(keyword, parameters) {
      var deferred = $q.defer();
      if (typeof(parameters)==='undefined') parameters = {};
      parameters = angular.extend(parameters, {q: keyword});
      var test = $twitterHelpers.createTwitterSignature('GET', SEARCH_TWEETS_URL, parameters, clientId, clientSecret, token);
      return makeHttpGetRequest(SEARCH_TWEETS_URL, parameters, deferred);
    },
    postStatusUpdate: function(statusText) {
      var deferred = $q.defer();
      var parameters = {status: statusText};
      var encoded = encodeURIComponent(statusText);
      $twitterHelpers.createTwitterSignature('POST', STATUS_UPDATE_URL, parameters, clientId, clientSecret, token);
      return makeHttpPostRequest(STATUS_UPDATE_URL + '?' + transformRequest(parameters), parameters, deferred);
      // return makeHttpPostRequest(STATUS_UPDATE_URL + '?' + 'status=' + encoded, parameters, deferred);
    }
  };
}]);

/*
 * AngularJS Twitter REST Api wrapper
 *
 * Created by Simon Reimler
 * http://www.devdactic.com
 *
 *
 *
 * DESCRIPTION:
 *
 * Configure the library with:
 *    - Consumer Key (API Key)
 *    - Consumer Secret (API Secret)
 *    - Valid OAuth Token
 *
 *
 *
 * Wrapped Endpoints:
 *
 *    statuses/home_timeline
 *    statuses/update
 *    search/tweets
 *
 */

 angular.module('ngTwitter', [
  'twitter.functions',
  'twitter.utils'
]);

angular.module('twitter.utils', [])

.factory('$twitterHelpers', ['$q', '$http', function($q, $http) {

  /* This snippet is copied from Nic Raboy's ngCordovaOauth
  * For more information see: https://github.com/nraboy/ng-cordova-oauth
  * Sign an Oauth 1.0 request
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
        headerAndBodyParameters[bodyParameterKeys[i]] = encodeURIComponent(bodyParameters[bodyParameterKeys[i]]);
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
      // $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

      $http.defaults.headers.common.Authorization = signatureObj.authorization_header;
      // $http.defaults.headers.post.Authorization = signatureObj.authorization_header;

      return signatureObj;
    }
  };
}]);
