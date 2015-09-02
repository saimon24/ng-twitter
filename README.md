[![Build Status](https://travis-ci.org/saimon24/ng-twitter.svg?branch=master)](https://travis-ci.org/saimon24/ng-twitter)

# ngTwitter

ngTwitter is an AngularJS [Twitter REST API](https://dev.twitter.com/rest/public) wrapper.  The purpose of this library is to quickly and easily access all the Twitter API endpoints without having to worry about the request signing and signature.


## Requirements

You need to have a Twitter app and a valid OAuth token.


## Installing ngTwitter

### Bower

Add this repository as dependency:

    $ bower install ng-twitter-api --save

This will add the dependency to your project and to the `bower.json` file.

The JavaScript library must then be added to your **index.html** file found in your projects **www**
directory:

    <script src="../ng-twitter-api/dist/ng-twitter-api.min.js"></script>

Twitter requires HMAC-SHA1 signatures in their Oauth implementation. This project install jsSHA with bower so you only have to include the file:

    <script src="../bower_components/jsSHA/src/sha1.js"></script>

* [jsSHA 1.6.0](https://github.com/Caligatio/jsSHA) Secure Hash Library

### Injecting:

Once added to your index.html file, you must inject the library into your **app.js** module.  Make your
**app.js** file look something like the following:

    angular.module('starter', ['ngTwitter'])

Now ngTwitter is ready to use!

## Using ngTwitter In Your Project
1. Find your **ClientId** and your **SecretId** from your [Twitter app](https://apps.twitter.com/).
2. Grab you OAuth token inside your app. If you are using the [Ionic Framework](http://ionicframework.com/) you should use the [ngCordova](http://ngcordova.com/) library. After including it, your request for a OAuth token could look like this:
```javascript
    $cordovaOauth.twitter(clientId, clientSecret).then(function (succ) {
        $twitterApi.configure(clientId, clientSecret, succ);
      }, function(error) {
        console.log(error);
    });
```
For a complete Ionic integration guide also check out my Blogpost [How To Easily Use The Twitter REST Api With AngularJS](http://devdactic.com/twitter-rest-api-angularjs/).

*If you got your OAuth token differently, just make sure to configure ngTwitter before making any other calls like this:*
```javascript
    $twitterApi.configure(clientId, clientSecret, oauthToken);
```
After configuring you can use all the endpoint wrapper. Each API call returns a promise. The success callback is the complete Twitter Rest response.
```javascript
    $twitterApi.getHomeTimeline({count: 5}).then(function(data) {
      console.log(data);
    }, function(error) {
      console.log('err: ' + error);
    });
````

### Available methods
The options object is optional on every request. Just check out the Twitter documentation what you want to send.
```javascript
configure(string clientId, string clientSecret, object token);
getHomeTimeline(object options); // GET statuses/home_timeline
getMentionsTimeline(object options) // GET statuses/mentions_timeline
getUserTimeline(object options) // GET statuses/user_timeline
searchTweets(string keyword, object options); // GET search/tweets
postStatusUpdate(string statusText, object options); // POST statuses/update
getUserDetails(string user_id, object options); // GET users/show
getRequest(string full_twitter_api_url, object options); // GET custom url
postRequest(string full_twitter_api_url, object options); // POST custom url
```


## Contribution Rules

All contributions must be made via the `development` branch.  This keeps the project more maintainable in terms of versioning as well as code control.


## Have a question or found a bug?

Message me on Twitter - [@schlimmson](https://www.twitter.com/schlimmson)

Follow my Blog Devdactic - [https://devdactic.com](https://devdactic.com)
