/**
 * Word Guess Game.
 *
 * UNC Charlotte Full Stack Boot Camp.
 * (c) 2018 Richard Cyrus <richard.cyrus@rcyrus.com>
 *
 * 1.   The computer chooses a word, and displays an underscore for each
 *      letter in the word.
 * 2.   The player will press a key to indicate their guess.
 *      -   If the guess is correct, update the page to display the letter
 *          in the correct position of the word.
 *      -   If the guess is incorrect, update the incorrect letters
 *          list on the page.
 *      -   Update the number of guesses remaining.
 * 3.   If the player wins the game, update the count of games won on the
 *      page.
 * 4.   After a win or a loss, automatically choose the next word and
 *      start play again.
 *
 */


(function (window) {
    'use strict';

    // Track the game stats for the player.
    let numberOfWins = 0;
    let numberOfLosses = 0;

    const WordGuess = {
        correctLetters: [],
        currentWord: {},
        elAttemptsLeft: document.querySelector('#attempts-remaining'),
        elCurrentWord: document.querySelector('#current-word'),
        elGamesLost: document.querySelector('#games-lost'),
        elGamesWon: document.querySelector('#games-won'),
        elHint: document.querySelector('.game__hint'),
        elTimerMessage: document.querySelector('.timer__message'),
        elTimerOverlay: document.querySelector('.timer__overlay'),
        elTimerTimeLeft: document.querySelector('.timer__time-left'),
        elWrongLetters: document.querySelector('#wrong-letters'),
        elWrongLetterTitle: document.querySelector('#letters-attempted'),
        remainingAttempts: 0,
        restartID: 0,
        restartSeconds: 5,
        words: [],
        wrongLetters: [],

        /**
         * Populate the word list, choose the first word of play, and
         * start the game.
         *
         * @param words
         */
        init: function (words) {
            this.words = words;
            this.currentWord = this.chooseWord();

            console.log(this.currentWord);
            this.startPlay();
        },

        /**
         * Key press entry point into the game. When the player presses a key
         * it's processed here.
         *
         * @param event
         */
        playerGuess: function (event) {
            let guess = event.key;

            if (guess.match(/[a-zA-Z]/) && guess.length === 1) {

                if (this.wrongLetters.includes(guess) || this.correctLetters.includes(guess)) {
                    // TODO: Use a flash message instead of an alert.
                    // alert('You have tried that letter before. Please try again!');
                }
                else {
                    let validCharacters = this.validateGuess(guess);

                    if (validCharacters.length > 0) {

                        this.updateBoard(validCharacters);

                        if (this.correctLetters.length === this.currentWord.totalCharacters) {

                            this.elAttemptsLeft.textContent = '0';

                            numberOfWins++;
                            this.elGamesWon.textContent = `${numberOfWins}`;

                            this.elTimerMessage.classList.add('game-won');
                            this.elTimerMessage.textContent = "Awesome, You've Won!";
                            this.restartGame(this.restartSeconds);
                        }

                    } else {
                        // Deduct an attempt for every invalid letter press.
                        this.remainingAttempts--;
                        this.elAttemptsLeft.textContent = this.remainingAttempts;

                        this.wrongLetters.push(guess);

                        this.showBadGuesses();

                        if (this.remainingAttempts === 0) {
                            // Game Over.
                            numberOfLosses++;
                            this.elGamesLost.textContent = `${numberOfLosses}`;

                            this.elTimerMessage.classList.add('game-lost');
                            this.elTimerMessage.textContent = "Sorry, you lose!";
                            this.restartGame(this.restartSeconds);
                        }
                    }
                }
            }
        },

        /**
         * Determine if the character entered by the player is in the
         * current word.
         *
         * @param guess
         * @returns {Array}
         */
        validateGuess: function (guess) {
            // Capture all instances of the guessed letter in the word.
            let valid = this.currentWord.characters.filter(function (letter) {
                return guess.toLowerCase() === letter.character
            });

            // Update the correctLetters list.
            valid.forEach(function (letterObject) {
                this.correctLetters.push(letterObject.character);
            }, this);

            return valid;
        },

        /**
         * Update the game display with the correctly guessed letters.
         *
         * @param letters
         */
        updateBoard: function (letters) {
            letters.forEach(function (letter) {
                let listItem = this.elCurrentWord.querySelector(
                    'li[data-pos="' + letter.pos + '"]'
                );

                listItem.textContent = letter.character;
                listItem.classList.add('correct');
            }, this);
        },

        /**
         * Selects a word for play.
         *
         * @param padAttempts
         * @returns {{characters: Array, word: string, totalCharacters: *}}
         */
        chooseWord: function (padAttempts = 2) {
            let choice = this.words[Math.floor(Math.random() * this.words.length)];

            this.remainingAttempts = choice.length + padAttempts;

            let letters = [];
            for (let i = 0; i < choice.length; i++) {
                letters.push({
                    character: choice[i],
                    pos: i
                });
            }

            return {
                characters: letters,
                word: choice.toLowerCase(),
                totalCharacters: choice.length
            };
        },

        /**
         * Display the game board. There's one `_` for each character of
         * the currently active word.
         *
         * This also displays the initial attempts remaining.
         */
        startPlay: function () {
            let el = '<ul class="word">';

            for (let i = 0; i < this.currentWord.totalCharacters; i++) {
                el += `<li data-pos="${i}" class="letter">*</li>`;
            }

            el += '</ul>';

            this.elCurrentWord.innerHTML = el;

            // Set at start.
            this.elAttemptsLeft.innerHTML = this.remainingAttempts;
            this.elGamesWon.textContent = `${numberOfWins}`;
            this.elGamesLost.textContent = `${numberOfLosses}`;
        },

        /**
         * When the wrong choice is made in the game, update the
         * letters used portion of the screen with the letter that
         * was chosen.
         */
        showBadGuesses: function () {
            let el = '<ul class="used-letters">';

            this.wrongLetters.forEach(function (letter) {
                el += `<li data-guessed-letter="${letter}" class="guessed-letter incorrect">${letter}</li>`
            });

            el += '</ul>';

            this.elWrongLetterTitle.style.display = 'block';
            this.elWrongLetters.innerHTML = el;
        },

        /**
         * Clear notices and counters specific to each play attempt.
         * Start the play again.
         */
        resetGame: function () {
            // Clear in game trackers.
            this.wrongLetters = [];
            this.correctLetters = [];
            this.remainingAttempts = 0;

            // Clear in game notices.
            this.elTimerMessage.textContent = "";
            this.elHint.textContent = "";
            this.elWrongLetterTitle.style.display = 'none';
            this.elWrongLetters.innerHTML = "";
            this.elTimerOverlay.style.display = 'none';
            this.elTimerTimeLeft.textContent = '';

            // Start next game.
            this.init(this.words);
        },

        /**
         * Execute a timed delay before starting the next play.
         *
         * @param seconds
         */
        restartGame: function (seconds) {
            this.elTimerOverlay.style.display = 'flex';

            // Clear existing timers.
            clearInterval(this.restartID);

            const now = Date.now();
            const then = now + seconds * 1000;

            // Start the clock.
            this.displayTimeLeft(seconds);

            this.restartID = setInterval(() => {
                const secondsLeft = Math.round((then - Date.now()) / 1000);

                // Should we stop?
                if (secondsLeft < 0) {
                    // Stop setInterval.
                    clearInterval(this.restartID);

                    // Start the next game.
                    this.resetGame();
                }

                // Display time left
                this.displayTimeLeft(secondsLeft);
            }, 1000);
        },

        /**
         * Update the countdown timer between plays.
         *
         * @param seconds
         * @param withMinutes
         */
        displayTimeLeft: function (seconds, withMinutes = false) {
            const minutes = Math.floor(seconds / 60);
            const remainderSeconds = seconds % 60;
            let timeLeft = `${remainderSeconds}`;

            if (withMinutes) {
                timeLeft = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
            }

            this.elTimerTimeLeft.textContent = `${timeLeft}`;
        }
    };

    const wordList = [
        'aaliyah',
        'adele',
        'beck',
        'beyonce',
        'bjork',
        'bono',
        'brandy',
        'cher',
        'common',
        'coolio',
        'dido',
        'drake',
        'elvis',
        'eminem',
        'enya',
        'fergie',
        'flea',
        'jewel',
        'kesha',
        'liberace',
        'lorde',
        'ludacris',
        'macklemore',
        'madonna',
        'meatloaf',
        'moby',
        'morrissey',
        'nelly',
        'pink',
        'pitbull',
        'prince',
        'redman',
        'rihanna',
        'ringo',
        'rupaul',
        'sade',
        'seal',
        'selena',
        'shaggy',
        'shakira',
        'sia',
        'slash',
        'sting',
        'tupac',
        'usher',
    ];

    WordGuess.init(wordList);

    window.addEventListener('keyup', (e) => {
        WordGuess.playerGuess(e)
    });

})(window);
