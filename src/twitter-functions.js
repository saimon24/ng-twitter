angular.module('twitter.functions', [])

.factory('$twitterApi', ['$q', '$twitterHelpers', '$http', function($q, $twitterHelpers, $http) {
  var token;
  var clientId = '';
  var clientSecret = '';

  var HOME_TIMELINE_URL = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
  var SEARCH_TWEETS_URL = 'https://api.twitter.com/1.1/search/tweets.json';
  var STATUS_UPDATE_URL = 'https://api.twitter.com/1.1/statuses/update.json';

  function makeHttpGetRequest(url, deferred) {
    $http.get(url)
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


  function makeHttpPostRequest(url, deferred) {
    $http.post(url, data)
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

  return {
    configure: function(cId, cSecret, authToken) {
      clientId = cId;
      clientSecret = cSecret;
      token = authToken;
    },
    getHomeTimeline: function() {
      var deferred = $q.defer();
      $twitterHelpers.createTwitterSignature('GET', HOME_TIMELINE_URL, {}, clientId, clientSecret, token);
      return makeHttpGetRequest(HOME_TIMELINE_URL, deferred);
    },
    searchTweets: function(keyword) {
      var deferred = $q.defer();
      var bodyObj = {q: keyword};
      $twitterHelpers.createTwitterSignature('GET', SEARCH_TWEETS_URL, bodyObj, clientId, clientSecret, token);
      var encoded = encodeURI(keyword);
      return makeHttpGetRequest(SEARCH_TWEETS_URL +'?' + 'q=' + encoded, deferred);
    },
    postStatusUpdate: function(statusText) {
      var deferred = $q.defer();
      var encoded = encodeURIComponent(statusText);
      var bodyObj = {status: statusText};
      var test = $twitterHelpers.createTwitterSignature('POST', STATUS_UPDATE_URL, bodyObj, clientId, clientSecret, token);
      return makeHttpPostRequest(STATUS_UPDATE_URL + '?' + 'status=' + encoded, deferred);
    }
  };
}]);
