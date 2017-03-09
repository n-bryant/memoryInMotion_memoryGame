(function() {
  "use strict";

  const memoryGameModule = function() {
    const $gameContainer = $('.game-container');
    const $gameReport = $('.game-report-container');
    // const $front = $('.card.front');
    // const $this = $(this);
    const start = moment(new Date());

    const player = {
      currentGuess: null,
      health: null,
      guesses: [],
      turns: 0
    };

    let cardFronts = ['/images/img1.gif', '/images/img2.gif', '/images/img3.gif', '/images/img4.gif',
                       '/images/img5.gif', '/images/img6.gif', '/images/img7.gif', '/images/img8.gif',
                       '/images/img9.gif', '/images/img10.gif', '/images/img11.gif', '/images/img12.gif',
                       '/images/img13.gif', '/images/img14.gif', '/images/img15.gif', '/images/img16.jpg'];

    // game board constructor
    class GameBoard {
      constructor(difficulty) {
        this.difficulty = difficulty;
        this.shuffledDeck = this.shuffleCards(cardFronts);
        this.build();
      }

      build() {
        // load two of each card in random order
        const source = $('#tile-template').html();
        const template = Handlebars.compile(source);
        const context = {
          srcFronts: this.shuffledDeck
        };
        const html = template(context);

        $gameContainer.append(html);
      }

      shuffleCards(cards) {
        // number of cards based on selected difficulty
        // let fullDeck = cards.concat(cards);
        let shuffledCards = cards.sort(function(a, b) {return 0.5 - Math.random()});
        if (this.difficulty === 'easy') {
          shuffledCards = shuffledCards.slice(0, 6);
        } else if (this.difficulty === 'medium') {
          shuffledCards = shuffledCards.slice(0, 9);
        } else if (this.difficulty === 'hard') {
          shuffledCards = shuffledCards.slice(0, 12);
        } else {}
        shuffledCards = shuffledCards.concat(shuffledCards);
        return shuffledCards;
      }
    }

    class HealthBar {
      constructor(difficulty) {
        console.log('in');
        let cardCount;
        if (difficulty === 'easy') {
          cardCount = 12;
        } else if (difficulty === 'medium') {
          cardCount = 16;
        } else if (difficulty === 'hard') {
          cardCount = 12;
        } else {
          cardCount = 12;
        }
        this.health = 1.5 * cardCount;
        this.healthBar = [];

        for (let i = 0; i < this.health; i++) {
          this.healthBar.push(i);
        }

        this.build();
      }

      build() {
        const source = $('#health-template').html();
        const template = Handlebars.compile(source);
        const context = {
          health: this.healthBar
        };
        const html = template(context);

        $('.health-bar').append(html);
        updateHealth();
      }
    }

    // binding of event listeners
    function bindEvents() {
      // difficulty select
      document.querySelector('.play-btn').addEventListener('click', () => {
        event.preventDefault();
        let difficulty = $('.difficulty-select').val();
        new GameBoard(difficulty);
        new HealthBar(difficulty);
        $('.home-container, .game-wrapper').toggleClass('is-hidden');
      });

      // gameplay
      $gameContainer.on('click', '.tile-container', function() {
        if (!$(this).children('.front').hasClass('paired')){
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

        // game reset
        document.querySelector('.restart-btn').addEventListener('click', () => {
          location.reload();
        });
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
      let currGuess = player.guesses[player.turns - 1].guess;
      let prevGuess = player.guesses[player.turns - 2].guess;

      let currID = player.guesses[player.turns - 1].id;
      let prevID = player.guesses[player.turns - 2].id;

      if(player.turns % 2 === 0 && currID !== prevID) {
        // if guess A matches guess B
        if (currGuess === prevGuess) {
          // bounce both and keep both cards face up until end of game
          $('.card[src="'+currGuess+'"]').addClass('paired');
          $('.card[src="'+prevGuess+'"]').addClass('paired');
        } else {
          // turn cards over if missed this round
          $('.tile-container[data-id="'+currID+'"]').children('.front').addClass('missed');
          $('.tile-container[data-id="'+prevID+'"]').children('.front').addClass('missed');
          $('.tile-container[data-id="'+currID+'"]').children('.front.missed').on('animationend', function() {
              if (!$(this).hasClass('paired')) {
              $(this).addClass('is-hidden');
              $(this).removeClass('missed');
              $(this).siblings('.back').removeClass('is-hidden');
            }
          });
          $('.tile-container[data-id="'+prevID+'"]').children('.front.missed').on('animationend', function() {
            if (!$(this).hasClass('paired')) {
              $(this).removeClass('missed');
              $(this).addClass('is-hidden');
              $(this).siblings('.back.is-hidden').removeClass('is-hidden');
            }
          });

          // decrease health
          $('.health-bar .hp').last().fadeOut('slow', function() {
            $(this).remove();
            updateHealth();
          });
        }
      }
        // check if game has been won/lost
        checkGameStatus();
    }

    function gameOver(win) {
      const end = moment(new Date());
      const duration = moment.duration(end.diff(start));
      const minutes = duration.asMinutes();

      // keep track of elapsed time
      if (win) {
        $('<p>').text(`You won in ${player.turns / 2} turns and ${minutes.toFixed(2)} minutes!`).prependTo($gameReport);
      } else {
        $('<p>').text(`You lost in ${minutes.toFixed(2)} minutes!`).prependTo($gameReport);
      }

      for(let index = 0; index < $('.card.front').length; index++) {
        if ($('.card.front').hasClass('is-hidden')) {
          $('.card.front').removeClass('is-hidden');
          $('.card.front').siblings('.card.back').addClass('is-hidden');
        }
      }
      $('.tile-container').off('click');
      $('.game-over-container').toggleClass('is-hidden');
    }

    function updateHealth() {
      player.health = $('.health-bar').children('.hp').length;
    }

    function init() {
      bindEvents();
    }

    return {
      init: init
    };
  };

  const memoryGameApp = memoryGameModule();
  memoryGameApp.init();
})();
