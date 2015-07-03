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
