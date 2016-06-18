'use strict';

/**
 * @ngdoc function
 * @name glouGlouMiamMiamApp.controller:GameCtrl
 * @description
 * # GameCtrl
 * Controller of the glouGlouMiamMiamApp
 */
angular.module('glouGlouMiamMiamApp')
  .controller('GameCtrl', ['$scope',
                           '$rootScope',
                           '$http', 
                           'leafletData', 
                           '$location', 
                           '$anchorScroll',
                           '$timeout',
                           'GAuth',
                           'GApi',
                           '$state',
                           function ($scope,
                                     $rootScope, 
                                     $http, 
                                     leafletData, 
                                     $location, 
                                     $anchorScroll, 
                                     $timeout,
                                     GAuth,
                                     GApi,
                                     $state) {

    // ****************************************************************
    //  VAR
    // ****************************************************************
	  
	// Etats de la question
    var currentQuestionState = {
      winButtons: 0,
      winMap: 0
    };

    // Messages d'erreurs
    var msgErreur = {
      buttonsFirst: 'Réponds d\'abord à la première question !!!'
    };

    // Petites remarques désobligeantes
    var msgInsultes = [
      'Gros null !',
      'Pov\' naze !',
      'Franchement...',
      'Mon chien fait mieux !',
      'Tu me déçois...',
      'Tu le fais exprès ?',
      'Franchement...'
    ];

    // Textes
    var texts = {
      'penseMajorite': 'Bravo ! Tu penses comme la majorité des intellos qui ont répondu',
      'penseMinorite': 'Pfff... Tu penses comme la minorité de nuls qui ont répondu...',
      'egaliteDesAvis': 'Mouais... Si tu le dis !',
      'errorToMap': 'Tu crois pouvoir trouver le département ?'
    };

    // ****************************************************************
    //  VAR SCOPE
    // ****************************************************************

    // Etats de l'applications
    $scope.states = {
      gameState: -1,
      buttonsState: -1,
      saveScoreOk: 0,
      displayResults: 0,
      callout1: {
        display: 0,
        closeButton: 1
      }
    };

    // Barème du jeu
    $scope.bareme = {
      winButtons: 2,
      winMap: 3,
      winAllQuestions: 4
    };

    // Messages des boites de dialogue et des callout
    $scope.msgDisplayed = {
      callout1: {
        insulte: '',
        text: ''
      },
      modal1: {
        insulte: '',
        action: '',
        dpt: ''
      }
    };
    
    // Variables du jeu
    $scope.game = {
      nbQuestions: 0,
      currentQuestion: 0,
      questions: [],
      score: 0,
      nbWins: 0
    };

    // Hard-coding des variables du jeu
    // $scope.game = {
    //   nbQuestions: 3,
    //   currentQuestion: 0,
    //   questions: [
             // {
             //    "id": "8",
             //    "ci": "11276",
             //    "dpt": "AUDE",
             //    "commune": "Paziols",
             //    "ida": 1342,
             //    "produit": "Rivesaltes",
             //    "glouglou": 0,
             //    "miammiam": 0,
             //    "kind": "productendpoint#resourcesItem",
             //    "etag": "\"xiiNVei4ZbqV6Rr-ILbAfsyA5Z4/LAjulx8UmsdCzkROkSOQUi2TuCs\""
             // }
    //   ],
    //   score: 0,
    //   nbWins: 0
    // };
    

    // ****************************************************************
    //  FONCTIONS
    // ****************************************************************

    /*
     * Récupère les [n] produits via l'API pour former les questions 
     */
    function getQuestions(nbQuestions) {

      // Bornes min-max pour le random
      var borneMax = 1000,
//          borneMax = 10998,
          borneMin = 1;
      // Random
      var id = Math.floor((Math.random() * borneMax) + borneMin);
      console.info("Id généré: "+id);

      // Appel API
      GApi.execute('productendpoint',
                     'getProduct',
                     {
                       id: id 
                     }
      ).then( function(resp) {

          console.log("un tour : "+ nbQuestions);
          
          // Parcours des questions existantes pour tester unicité sur le nom de l'aoc
          var trouve = 0;
          $scope.game.questions.forEach(function(aoc, index) {
        	  if(!trouve && aoc.produit == resp.produit) {
        		  trouve = 1;
        		  nbQuestions++;
        		  console.log("Produit déjà trouvé, keep going");
        	  }
          });
          
          // Ajout de la question
          if(!trouve) { 
        	  $scope.game.questions.push(resp);
        	  $scope.game.nbQuestions++;
          }

          // Récursivité pour obtenir les autres questions
          if (nbQuestions > 1) {
            id = Math.floor((Math.random() * borneMax) + borneMin);
            nbQuestions--;
            getQuestions(nbQuestions);
          } else {
            $scope.loadGame();
          }
          
        }, function() {
          // Das grosse erreur
          console.log("Erreur get questions");
          $scope.states.gameState = -2;
        });
    }

    /*
     * Fin du jeu: calcul des points / displays
     */
    function endGame() {

      // Calcul des points
      if($scope.game.nbWins == $scope.game.nbQuestions) {
        $scope.game.score = $scope.game.score + $scope.bareme.winAllQuestions;
      }

      $scope.openFinalScores(); // Affichage résultats
    }

    /*
     * Initialisation des variables pour la question courante
     */
    function initQuestion() {
      currentQuestionState.winButtons = 0;
      currentQuestionState.winMap = 0;
      $scope.states.buttonsState = -1;
      $scope.geojson.style.fillColor = "#2ba6cb";
    }

    /*
     * Affichage le callout1 dans la page
     * - messages: tableau de messages
     * - time: temps d'affiche (ms)
     */
    function callout1(messages, time, closeButton) {
      $scope.msgDisplayed.callout1.insulte = messages[0];
      $scope.msgDisplayed.callout1.text = messages[1];
      $scope.states.callout1.closeButton = closeButton;
      $scope.states.callout1.display = 1;

      if(time > 0) {
        $timeout(function() {
          $scope.states.buttonsFirst = 0;
        }, 3000);
      }
    }

    /*
     * Sélectionne une insulte au hasard
     */
    function pickOneInsulte() {
      return msgInsultes[Math.floor(Math.random() * (msgInsultes.length - 0 +1)) + 0];
    }

    /*
     * Scroll à une balise 'id' HTML
     */
    function scrollTo(id) {
      $location.hash(id);
      $anchorScroll();
    }

    // ****************************************************************
    //  FONCTIONS SCOPE
    // ****************************************************************
    
    /*
     * Démarre le jeu
     * Initialisation des variables et récupération des questions
     */
    $scope.startGame = function() {
      $scope.displayResults = 0;
      $scope.states.gameState = -1;
      $scope.game.nbQuestions = 0;
      $scope.game.questions = [];
      $scope.game.questions.length = 0;
      getQuestions(1);
    };

    /*
     * Charge le jeu après la récupération des questions
     */
    $scope.loadGame = function() {

      console.log($scope.game.questions);

      $scope.states.gameState = 0;
      $scope.states.buttonsState = -1;
      $scope.states.saveScoreOk = 0;
      $scope.states.callout1.display = 0;
      $scope.states.callout1.closeButton = 1;
      
      console.log("AHAHAH:"+$scope.states.saveScoreOk);

      $scope.game.currentQuestion = 0;
      $scope.game.score = 0;
      $scope.game.nbWins = 0;
    };

    /*
     * Re-load du jeu
     */
    $scope.reloadGame = function() {

      $scope.startGame();
      initQuestion();

      //scrollTo('game-row');

      $('#scoresModal').foundation('close');
      $('#finalScoresModal').foundation('close');
    };

    /*
     * Fonction pour faire un loop sur un nombre (angular oblige)
     */
    $scope.getNumber = function(n) {
        return new Array(n);
    };

    /*
     * Réponse à la question en cours
     */
    $scope.answering = function(answer) {
    	
      var rep = -1;
      var type = "";

      if($scope.states.gameState != -1 && $scope.states.buttonsState == -1) {

        // On détermine la réponse générale pour conditionner l'affichage
        if($scope.game.questions[$scope.game.currentQuestion].miammiam > $scope.game.questions[$scope.game.currentQuestion].glouglou) {
          // Miammiam
          rep = 1;
        } else if($scope.game.questions[$scope.game.currentQuestion].miammiam == $scope.game.questions[$scope.game.currentQuestion].glouglou) {
          // Egalité
          rep = 2;
        } else {
          // Glouglou
          rep = 0;
        }

        console.log("Réponse générale: "+rep);

        // Réponse à l'utilisateur
        if(rep == 2) {
          //Egalité, on se fiche de la réponse puisqu'on l'a pas...
          $scope.states.buttonsState = 2;
          callout1([
              texts.egaliteDesAvis,
              texts.errorToMap
          ], 2000, 0);

        } else {
          if(answer == rep) {
            // Bonne réponse
            $scope.states.buttonsState = 1;
            $scope.game.score = $scope.game.score + $scope.bareme.winButtons;
            currentQuestionState.winButtons = 1;

            // Display
            callout1([
              texts.penseMajorite,
              texts.errorToMap
            ], 2000, 0);

          } else {
            // Mauvaise réponse
            $scope.states.buttonsState = 0;

            // Display
            callout1([
              texts.penseMinorite,
              texts.errorToMap
            ], 0, 0);
          }
        }

        // Préparation pour l'update en base
        if(answer == 0) {
          //Répond glou
          //$scope.game.questions[$scope.game.currentQuestion].glouglou++;
          type = "glou";
        } else {
          //$scope.game.questions[$scope.game.currentQuestion].miammiam++;
          type = "miam";
        }

        console.log("Sera envoyé: "+type);

        // Paramètres pour la requête
        var params = {
          'type': type,
          'resource': $scope.game.questions[$scope.game.currentQuestion]
        };

        // Update en base
        GApi.executeAuth('productendpoint', 'updateGGMM', params).then(function(resp) {
          //console.log("Réponse MAJ:");
          //console.log(resp);
        });

        //scrollTo('dptMap');
      }
    };

    /*
     * Affiche le modal entre chaque questions [Pas utilisé]
     * - messages: tableau de messages
     */
    $scope.openScoresModal = function (messages) {

      // Affichage résultat question
      $scope.scoresModalProgressBar = {
        "width" : "0%"
      };
      
      // Assignation des messages
      $scope.msgDisplayed.modal1.insulte = messages[0];
      $scope.msgDisplayed.modal1.action = messages[1];
      $scope.msgDisplayed.modal1.dpt = messages[2];

      // Barre de progression du temps
      var counter = 0;
      var top = 4;
      var progress = 0;
      var unit = Math.round(100/4);
      $('#scoresModal').foundation('open');

      var updateCounter = function() {
          counter++;
          $scope.scoresModalProgressBar = {
            "width" : progress+"%"
          };
          progress = progress+unit;

          if(counter <= top) {
            $timeout(updateCounter, 400);
          } else {
            $('#scoresModal').foundation('close');
          }
      };
      updateCounter();
    };

    /*
     * Affiche le modal des scores
     */
    $scope.openFinalScores = function () {
      //$('#finalScoresModal').foundation('open');
      $scope.displayResults = 1;
    };

    /*
     * Question suivante
     */
    $scope.nextQuestion = function () {

      if($scope.game.currentQuestion < $scope.game.nbQuestions-1) {

        $scope.states.callout1.display = 0;
        $scope.game.currentQuestion++;
        initQuestion();

        // Scroll au début de la question
        scrollTo('game-row');

      } else {
        // Fin du jeu
        endGame();
      }

    };

    /*
     * Sauvegarde le score du joueur en base
     */
    $scope.saveScore = function () {

      // Test utilisateur connecté
      GAuth.checkAuth().then(
          function (user) {
            //console.log(user.name + ' is already login');
        	
        	var name = '';  
        	if($scope.saveScorePseudo != '') {
	        	name = $scope.saveScorePseudo;
        	} else {
        		if(user.given_name != '') {
        			name = user.given_name;
        		} else {
        			name = "Joueur anonyme";
        		}
        	}
        	
        	console.log(user);
            
        	// Paramètres à envoyer
            var hs = {
              googleId: user.id,
              nickName: name,
              score: $scope.game.score
            };
        	
            // Call
            GApi.executeAuth('highscoresendpoint', 'updateNewHighScores', hs).then( function(resp) {
              $scope.states.saveScoreOk = 1;
            }, function() {
                console.log("error :(");
            });

          }, function() {
        	// Pas connecté, appel de la fonction pour se connecter
            $rootScope.$broadcast("CallDoSignup", { 'callback': $scope.saveScore});
            // $scope.saveScore();
          }
      );
    };
    
    $scope.GoToHighscores = function () {
    	$('#finalScoresModal').foundation('close');
    	$state.go('highscores');
    }

    // ****************************************************************
    //  CARTE
    // ****************************************************************

    // Initialisation paramètre de la carte
    angular.extend($scope, {
      france: {
          lat: 46.35,
          lng: 2.56,
          zoom: 5
      },
      defaults: {
        scrollWheelZoom: true
      },
      events: {
        map: {
            enable: ['click'],
            logic: 'emit'
        }
      }
    });  

    // Récupération du calque des départements
    $http.get("GlouGlouMiamMiam/app/images/departements.json").success(function(data, status) {
      angular.extend($scope, {
        geojson: {
          data: data,
          style: {
              fillColor: "#2ba6cb",
              weight: 2,
              opacity: 1,
              color: 'white',
              fillOpacity: 1,
          }
        }
      });
    });

    // Click sur un département
    $scope.$on('leafletDirectiveGeoJson.click', function (event, leafletPayload) {

      //console.log(leafletPayload);

      if($scope.states.gameState != -1 && $scope.states.buttonsState != -1) {

        if(leafletPayload.model.properties.NOM_DEPT == $scope.game.questions[$scope.game.currentQuestion].dpt) {
          // Bonne réponse
          $scope.geojson.style.fillColor = "#5da423";
          $scope.game.score = $scope.game.score + $scope.bareme.winMap;

          if(currentQuestionState.winButtons) {
            $scope.game.nbWins++;
          }

        } else {
          // Mauvaise réponse
          $scope.geojson.style.fillColor = "#c60f13";
        }

        // Timeout, sinon pas le temps de voir
        $timeout(function() {
           $scope.nextQuestion();
        }, 500);


      } else {
        // TODO
        //calloutButtonsFirst();
      }
    });

    // ****************************************************************
    //  MAIN
    // ****************************************************************
    // Initialisations
    $('#scoresModal').foundation();
    $('#finalScoresModal').foundation();

    $scope.startGame();

  }]);