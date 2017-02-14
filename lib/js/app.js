'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  "use strict";

  // revealing module

  var memoryGameModule = function memoryGameModule() {
    var $gameContainer = $('.game-container');
    var start = moment(new Date());

    var player = {
      currentGuess: null,
      health: null,
      guesses: [],
      turns: 0
    };

    var GameBoard = function () {
      function GameBoard() {
        _classCallCheck(this, GameBoard);

        this.cardFronts = ['images/img1.gif', 'images/img2.gif', 'images/img3.gif', 'images/img4.gif', 'images/img5.gif', 'images/img6.gif', 'images/img7.gif', 'images/img8.gif', 'images/img9.gif', 'images/img10.gif', 'images/img11.gif', 'images/img12.gif', 'images/img13.gif', 'images/img14.gif', 'images/img15.gif', 'images/img16.jpg'];
        this.shuffledDeck = this.shuffleCards(this.cardFronts);
        this.build();
      }

      _createClass(GameBoard, [{
        key: 'build',
        value: function build() {
          // load two of each card in random order
          var source = $('#tile-template').html();
          var template = Handlebars.compile(source);
          var context = {
            srcFronts: this.shuffledDeck
          };
          var html = template(context);

          $gameContainer.append(html);
        }
      }, {
        key: 'shuffleCards',
        value: function shuffleCards(cards) {
          // duplicate array
          var fullDeck = cards.concat(cards);
          // http://www.w3schools.com/js/js_array_sort.asp
          var shuffledCards = fullDeck.sort(function (a, b) {
            return 0.5 - Math.random();
          });
          return shuffledCards;
        }
      }]);

      return GameBoard;
    }();

    function bindEvents() {
      $gameContainer.on('click', '.tile-container', function () {
        if (!$(this).children('.front').hasClass('paired')) {
          player.currentGuess = {
            guess: $(this).children('.front').attr('src'),
            id: $(this).attr('data-id')
          };
          player.guesses.push(player.currentGuess);
          player.turns++;

          // console.log('prev: '+player.guesses[player.turns - 2].id);
          if (player.turns >= 2 && player.currentGuess.id !== player.guesses[player.turns - 2].id) {
            $(this).children('.back').addClass('is-hidden');
            $(this).children('.front').removeClass('is-hidden');
            checkGuess();
          } else {
            $(this).children('.back').addClass('is-hidden');
            $(this).children('.front').removeClass('is-hidden');
          }
        }
      });
    }

    function checkGameStatus() {
      if (player.health === 0) {
        gameOver(false);
      }
      if ($('.card.paired').length === $('.card.front').length) {
        gameOver(true);
      }
    }

    function checkGuess() {
      // check whether most recent selection matches previous selection
      var currGuess = player.guesses[player.turns - 1].guess;
      var prevGuess = player.guesses[player.turns - 2].guess;

      var currID = player.guesses[player.turns - 1].id;
      var prevID = player.guesses[player.turns - 2].id;

      if (player.turns % 2 === 0 && currID !== prevID) {
        // if guess A matches guess B
        if (currGuess === prevGuess) {
          // bounce both and keep both cards face up until end of game
          $('.card[src="' + currGuess + '"]').addClass('paired');
          $('.card[src="' + prevGuess + '"]').addClass('paired');
        } else {
          // turn cards over if missed this round
          $('.tile-container[data-id="' + currID + '"]').children('.front').addClass('missed');
          $('.tile-container[data-id="' + prevID + '"]').children('.front').addClass('missed');
          $('.tile-container[data-id="' + currID + '"]').children('.front.missed').on('animationend', function () {
            if (!$(this).hasClass('paired')) {
              $(this).addClass('is-hidden');
              $(this).removeClass('missed');
              $(this).siblings('.back').removeClass('is-hidden');
            }
          });
          $('.tile-container[data-id="' + prevID + '"]').children('.front.missed').on('animationend', function () {
            if (!$(this).hasClass('paired')) {
              $(this).removeClass('missed');
              $(this).addClass('is-hidden');
              $(this).siblings('.back.is-hidden').removeClass('is-hidden');
            }
          });

          // decrease health
          $('.health-bar .hp').last().fadeOut('slow', function () {
            $(this).remove();
            updateHealth();
          });
        }
      }
      // check if game has been won/lost
      checkGameStatus();
    }

    function gameOver(win) {
      var end = moment(new Date());
      var duration = moment.duration(end.diff(start));
      var minutes = duration.asMinutes();

      // keep track of elapsed time
      if (win) {
        $('<p>').text('You won in ' + player.turns + ' turns and ' + minutes + ' minutes!').appendTo($gameContainer);
      } else {
        $('<p>').text('You lost in ' + minutes + ' minutes!').appendTo($gameContainer);
      }

      for (var index = 0; index < $('.card.front').length; index++) {
        if ($('.card.front').hasClass('is-hidden')) {
          $('.card.front').removeClass('is-hidden');
          $('.card.front').siblings('.card.back').addClass('is-hidden');
        }
      }
      $('.tile-container').off('click');
    }

    function updateHealth() {
      player.health = $('.health-bar').children('.hp').length;
    }

    function init() {
      bindEvents();
      updateHealth();
      new GameBoard();
    }

    return {
      init: init
    };
  };

  var memoryGameApp = memoryGameModule();
  memoryGameApp.init();
})();
