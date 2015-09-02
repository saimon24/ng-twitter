angular.module('twitter.functions', [])

.factory('$twitterApi', ['$q', '$twitterHelpers', '$http', function($q, $twitterHelpers, $http) {
  var token;
  var clientId = '';
  var clientSecret = '';

  var HOME_TIMELINE_URL = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
  var SEARCH_TWEETS_URL = 'https://api.twitter.com/1.1/search/tweets.json';
  var STATUS_UPDATE_URL = 'https://api.twitter.com/1.1/statuses/update.json';
  var STATUS_MENTIONS_URL = 'https://api.twitter.com/1.1/statuses/mentions_timeline.json';
  var USER_TIMELINE_URL = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
  var USER_DETAILS_URL = 'https://api.twitter.com/1.1/users/show.json';

  function getRequest(url, neededParams, optionalParams) {
    var deferred = $q.defer();
    if (typeof(optionalParams)==='undefined') optionalParams = {};
    if (typeof(neededParams)==='undefined') neededParams = {};
    var parameters = angular.extend(optionalParams, neededParams);
    $twitterHelpers.createTwitterSignature('GET', url, parameters, clientId, clientSecret, token);

    $http({
        method: 'GET',
        url: url,
        params: parameters
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

  function postRequest(url, neededParams, optionalParams) {
    var deferred = $q.defer();
    if (typeof(optionalParams)==='undefined') optionalParams = {};
    var parameters = angular.extend(optionalParams, neededParams);

    // // Append the bodyparams to the URL
    var t = $twitterHelpers.createTwitterSignature('POST', url, parameters, clientId, clientSecret, token);
    if (parameters !== {}) url = url + '?' + $twitterHelpers.transformRequest(parameters);

    $http.post(url, parameters)
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
    getHomeTimeline: function(parameters) {
      return getRequest(HOME_TIMELINE_URL, parameters);
    },
    getMentionsTimeline: function(parameters) {
      return getRequest(STATUS_MENTIONS_URL, parameters);
    },
    getUserTimeline: function(parameters) {
      return getRequest(USER_TIMELINE_URL, parameters);
    },
    searchTweets: function(keyword, parameters) {
      return getRequest(SEARCH_TWEETS_URL, {q: keyword}, parameters);
    },
    postStatusUpdate: function(statusText, parameters) {
      return postRequest(STATUS_UPDATE_URL, {status: statusText}, parameters);
    },
    getUserDetails: function(user_id, parameters) {
      return getRequest(USER_DETAILS_URL, {user_id: user_id}, parameters);
    },
    getRequest: getRequest,
    postRequest: postRequest
  };
}]);
