angular.module('twitter.functions', [])

.factory('$twitterApi', ['$q', '$twitterHelpers', '$http', function($q, $twitterHelpers, $http) {
  var token;
  var clientId = '';
  var clientSecret = '';

  var HOME_TIMELINE_URL = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
  var SEARCH_TWEETS_URL = 'https://api.twitter.com/1.1/search/tweets.json';

  return {
    configure: function(cId, cSecret, authToken) {
      clientId = cId;
      clientSecret = cSecret;
      token = authToken;
    },
    logout: function() {
      token = null;
    },
    getHomeTimeline: function() {
      var deferred = $q.defer();
      $twitterHelpers.createTwitterSignature('GET', HOME_TIMELINE_URL, {}, clientId, clientSecret, token);
      $http.get(HOME_TIMELINE_URL)
      .success(function(data, status, headers, config) {
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
          if (status === 401) {
            logout();
          }
          deferred.reject(status);
      });
      return deferred.promise;
    },
    searchTweets: function(keyword) {
      var deferred = $q.defer();
      var keywordObj = {q:keyword};
      $twitterHelpers.createTwitterSignature('GET', SEARCH_TWEETS_URL, keywordObj, clientId, clientSecret, token);

      $http.get(SEARCH_TWEETS_URL +'?' + 'q=' + keyword)
      .success(function(data, status, headers, config) {
          deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
          if (status === 401) {
            logout();
          }
          deferred.reject(status);
      });
      return deferred.promise;
    }
  };
}]);
