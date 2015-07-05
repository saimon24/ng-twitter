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
      str.push(encodeURIComponent(p) + "=" + escapeSpecialCharacters(obj[p]));
      return str.join("&");
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
    postStatusUpdate: function(statusText, parameters) {
      var deferred = $q.defer();
      if (typeof(parameters)==='undefined') parameters = {};

      parameters = angular.extend(parameters, {status: statusText});
      var t = $twitterHelpers.createTwitterSignature('POST', STATUS_UPDATE_URL, parameters, clientId, clientSecret, token);
      return makeHttpPostRequest(STATUS_UPDATE_URL + '?' + transformRequest(parameters), parameters, deferred);
    }
  };
}]);
