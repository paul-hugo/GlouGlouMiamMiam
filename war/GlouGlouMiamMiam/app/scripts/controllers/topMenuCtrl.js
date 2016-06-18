'use strict';

/**
 * @ngdoc function
 * @name glouGlouMiamMiamApp.controller:TopMenuCtrl
 * @description
 * # TopMenuCtrl
 * Controller of the glouGlouMiamMiamApp
 */
angular.module('glouGlouMiamMiamApp')
  .controller('TopMenuCtrl', ['$scope', '$rootScope', '$http', 'leafletData', 'GAuth', '$state', function ($scope, $rootScope, $http, leafletData, GAuth, $state) {

	/*
	 * Connecte l'utilisateur
	 */
  	$scope.doSignup = function(callback) {
      console.log("connexion");

      GAuth.login().then(function(user) {
          console.log(user.name + ' is now logged in');
          console.log(user);

          $rootScope.login = 1;
          
          // Affiche le nom  utilisateur sinon "Connecté"
          $rootScope.user = user;
          if(user.given_name == '') {
        	  $rootScope.user.given_name = "Connected"; 
          }

          callback();

      }, function() {
          console.log('login fail');
      });
    };

    // Pseudo service pour appeler la connexion utilisateur et pour ne pas avoir à créer un service
    $rootScope.$on("CallDoSignup", function(event, args) {
      console.log(args);
      $scope.doSignup(args.callback);
    });

}]);