angular.module('twitter.functions', [])

.factory('$twitterApi', ['$q', '$twitterHelpers', '$http', function($q, $twitterHelpers, $http) {
  var token;
  var clientId = '';
  var clientSecret = '';

  var HOME_TIMELINE_URL = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
  var SEARCH_TWEETS_URL = 'https://api.twitter.com/1.1/search/tweets.json';
  var STATUS_UPDATE_URL = 'https://api.twitter.com/1.1/statuses/update.json';

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

  function makeHttpPostRequest(url, params, deferred) {

  // function postRequest(url, neededParams, optionalParams) {

    // var deferred = $q.defer();
    //   if (typeof(parameters)==='undefined') parameters = {};
    //
    //   parameters = angular.extend(parameters, {status: statusText});
    //   var t = $twitterHelpers.createTwitterSignature('POST', STATUS_UPDATE_URL, parameters, clientId, clientSecret, token);
    //   return makeHttpPostRequest(STATUS_UPDATE_URL + '?' + transformRequest(parameters), parameters, deferred);


    // var deferred = $q.defer();
    // if (typeof(optionalParams)==='undefined') optionalParams = {};
    // var parameters = angular.extend(optionalParams, neededParams);
    //
    // // Append the bodyparams to the URL
    // if (parameters !== {}) url = url + '?' + $twitterHelpers.transformRequest(parameters);
    //
    // var t = $twitterHelpers.createTwitterSignature('POST', url, parameters, clientId, clientSecret, token);
    // console.log(t);

    // $http.post(url, parameters)
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

  return {
    configure: function(cId, cSecret, authToken) {
      clientId = cId;
      clientSecret = cSecret;
      token = authToken;
    },
    getHomeTimeline: function(parameters) {
      return getRequest(HOME_TIMELINE_URL, parameters);
    },
    searchTweets: function(keyword, parameters) {
      return getRequest(SEARCH_TWEETS_URL, {q: keyword}, parameters);
    },
    postStatusUpdate: function(statusText, parameters) {
      var deferred = $q.defer();
      if (typeof(parameters)==='undefined') parameters = {};

      parameters = angular.extend(parameters, {status: statusText});
      var t = $twitterHelpers.createTwitterSignature('POST', STATUS_UPDATE_URL, parameters, clientId, clientSecret, token);
      return makeHttpPostRequest(STATUS_UPDATE_URL + '?' + $twitterHelpers.transformRequest(parameters), parameters, deferred);


      // return postRequest(STATUS_UPDATE_URL, {status: statusText}, parameters);
    }
  };
}]);
