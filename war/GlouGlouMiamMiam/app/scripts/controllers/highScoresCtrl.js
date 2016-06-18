'use strict';

/**
 * @ngdoc function
 * @name glouGlouMiamMiamApp.controller:HighScoresCtrl
 * @description
 * # HighScoresCtrl
 * Controller of the glouGlouMiamMiamApp
 */
angular.module('glouGlouMiamMiamApp')
  .controller('HighScoresCtrl', ['$scope', 
                                 '$http',
                                 'GApi', 
                                 function ($scope, 
                                           $http,
                                           GApi) {

    // ****************************************************************
    //  VAR
    // ****************************************************************
    
    // ****************************************************************
    //  VAR SCOPE
    // ****************************************************************
    // $scope.scores = [
    //   {
    //     id: '1',
    //     rank: '1',
    //     name: 'Patate',
    //     score: 5500
    //   },
    //   {
    //     id: '2',
    //     rank: '2',
    //     name: 'Orange',
    //     score: 4000
    //   },
    //   {
    //     id: '3',
    //     rank: '3',
    //     name: 'Haricot',
    //     score: 800
    //   },
    //   {
    //     id: '4',
    //     rank: '4',
    //     name: 'Banane',
    //     score: 2
    //   }
    // ];

  

    // ****************************************************************
    //  FONCTIONS
    // ****************************************************************
   

    // ****************************************************************
    //  FONCTIONS SCOPE
    // ****************************************************************
   
	// Récupère les scores
    GApi.execute('highscoresendpoint', 'listTenHighScores').then( function(resp) {
        $scope.scores = resp.items;
        console.log(resp.items);
    });

  }]);