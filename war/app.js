'use strict';

/**
 * @ngdoc overview
 * @name glouGlouMiamMiamApp
 * @description
 * # glouGlouMiamMiamApp
 *
 * Main module of the application.
 */
angular
  .module('glouGlouMiamMiamApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'ui-leaflet',
    'angular-google-gapi',
  ])
  .config(function ($stateProvider,$urlRouterProvider) {
    // ---------------------
	// ROUTEUR
	// ------------------------
	  
    // Default state
    $urlRouterProvider.otherwise("/index");

    // States
    $stateProvider
      .state('index', {
        url: "/index",
        templateUrl: 'GlouGlouMiamMiam/app/views/index.html',
        controller: 'IndexCtrl'
      })
      .state('game', {
        url: "/game",
        templateUrl: 'GlouGlouMiamMiam/app/views/game.html',
        controller: 'GameCtrl'
      })
      .state('highscores', {
        url: "/highscores",
        templateUrl: 'GlouGlouMiamMiam/app/views/highScores.html',
        controller: 'HighScoresCtrl'
      });

    

  })
  .run(['GAuth', 'GApi', 'GData', '$state', '$rootScope',
      function(GAuth, GApi, GData, $state, $rootScope) {
	  // ---------------------
	  // GAPI Angular
	  // ------------------------
	  
        // Init & var
        $rootScope.login = 0;
        $rootScope.gdata = GData;
        $rootScope.rootStates = {
          'mainError': 0
        };

        var CLIENT = '815372761689-3qvas5q59toimnfb0rjslolrc8n30umj.apps.googleusercontent.com';
//        var BASE = 'https://1-dot-glou-glou-miam-miam.appspot.com/_ah/api';
        var BASE = 'http://localhost:8888/_ah/api';

        // Chargement des apis
        GApi.load('highscoresendpoint','v1',BASE)
          .catch(function(api, version) {
            $rootScope.rootStates.mainError = 1;
          });
        GApi.load('productendpoint','v1',BASE)
          .catch(function(api, version) {
            $rootScope.rootStates.mainError = 1;
          });
        //GApi.load('calendar','v3'); // for google api (https://developers.google.com/apis-explorer/)

        GAuth.setClient(CLIENT);
        // GAuth.setScope("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.readonly"); // default scope is only https://www.googleapis.com/auth/userinfo.email

        GAuth.setScope("https://www.googleapis.com/auth/userinfo.email"); // default scope is only https://www.googleapis.com/auth/userinfo.email

        // load the auth api so that it doesn't have to be loaded asynchronously
        // when the user clicks the 'login' button. 
        // That would lead to popup blockers blocking the auth window
        // GAuth.load();

        // or just call checkAuth, which in turn does load the oauth api.
        // if you do that, GAuth.load(); is unnecessary
        GAuth.checkAuth().then(
            function (user) {
              console.log(user.name + ' is already login');
              console.log(user);
              $rootScope.login = 1;
              $rootScope.user = user;
            },
            function() {
              // Rien à faire
            }
        );
      }
  ]);
