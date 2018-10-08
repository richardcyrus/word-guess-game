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
 *      -   If the guess is incorrect, let the player know, and update
 *          the incorrect letters list on the page.
 *      -   Update the number of guesses remaining.
 * 3.   If the player wins the game, update the count of games won on the
 *      page.
 * 4.   After a win or a loss, automatically choose the next word and
 *      start play again.
 *
 */


(function (window) {
    'use strict';

    // Track the number of winning games for the player.
    let numberOfWins = 0;

    let WordGuess = {
        words: [],
        // correctGuesses: 0,
        wrongLetters: [],
        correctLetters: [],
        // maximumAttempts: 0,
        remainingAttempts: 0,
        elAttemptsLeft: document.querySelector('#attempts-remaining'),
        elGamesWon: document.querySelector('#games-won'),
        elCurrentWord: document.querySelector('#current-word'),
        elNotices: document.querySelector('#notices'),
        elWrongLetters: document.querySelector('#wrong-letters'),
        elWrongLetterTitle: document.querySelector('.used-letters > p'),
        elHint: document.querySelector('.hint'),
        currentWord: {},

        /**
         * Populate the word list, choose the first word of play, and
         * start the game.
         *
         * @param words
         */
        init: function(words) {
            this.words = words;
            this.currentWord = this.chooseWord();
            this.setup();

            console.log(this.currentWord);
        },

        setup: function() {
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

            if (this.remainingAttempts === 0) {
                // Game Over.
                this.resetGame();
            } else if (guess.match(/[a-zA-Z]/) && guess.length === 1) {

                if (this.wrongLetters.includes(guess) || this.correctLetters.includes(guess)) {
                    // TODO: Use a flash message instead of an alert.
                    alert('You have tried that letter before. Please try again!');

                    // TODO: Play sound (failed/bad)
                }
                else {
                    let validCharacters = this.validateGuess(guess);

                    if (validCharacters.length > 0) {

                        this.updateBoard(validCharacters);

                        if (this.correctLetters.length === this.currentWord.totalCharacters) {

                            this.elAttemptsLeft.innerHTML = '0';
                            numberOfWins += 1;
                            // TODO: Play sound (success!)
                            this.playerWins();
                            this.resetGame();
                        }
                    } else {
                        // Deduct an attempt for every invalid letter press.
                        this.remainingAttempts = this.remainingAttempts - 1;
                        this.elAttemptsLeft.innerHTML = this.remainingAttempts;

                        this.wrongLetters.push(guess);
                        this.elWrongLetterTitle.classList.remove('hidden');

                        this.showBadGuesses();
                        // TODO: Play Sound (failed/bad)
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
            let valid = this.currentWord.characters.filter(function(letter){
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

                listItem.innerHTML = letter.character;
                listItem.classList.add('correct');
            }, this);
        },

        /**
         * Selects a word for play.
         *
         * @param increaseMaxAttempts
         * @returns {{characters: Array, word: string, totalCharacters: *}}
         */
        chooseWord: function(increaseMaxAttempts = 2) {
            let choice = this.words[Math.floor(Math.random() * this.words.length)];

            this.remainingAttempts = choice.length + increaseMaxAttempts;

            let letters = [];
            for (let i = 0; i < choice.length; i++ ){
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
        startPlay: function() {
            let el = '<ul class="word">';

            for (let i = 0; i < this.currentWord.totalCharacters; i++) {
                el += `<li data-pos="${i}" class="letter">*</li>`;
            }

            el += '</ul>';

            this.elCurrentWord.innerHTML = el;

            // Set at start.
            this.elAttemptsLeft.innerHTML = this.remainingAttempts;
        },

        /**
         * When the wrong choice is made in the game, update the
         * letters used portion of the screen with the letter that
         * was chosen.
         */
        showBadGuesses: function() {
            let el = '<ul class="used-letters">';

            this.wrongLetters.forEach(function (letter) {
                el += `<li data-guessed-letter="${letter}" class="guessed-letter">${letter}</li>`
            });

            el += '</ul>';

            this.elWrongLetters.innerHTML = el;
        },

        playerWins: function () {
            this.elNotices.innerHTML = "Awesome, You've Won!";
            this.elGamesWon.innerHTML = `${numberOfWins}`;
            console.log(numberOfWins);
        },

        resetGame: function () {
            this.wrongLetters = [];
            this.correctLetters = [];
            this.remainingAttempts = 0;
            this.elNotices.innerHTML = "";
            this.elHint.innerHTML = "";
            this.elWrongLetters.innerHTML = "";
            this.init(this.words);
        },

    };

    const wordList = [
        'prince',
        'elvis',
        'adele',
        'eminem',
        'madonna',
        'sting',
        'pink',
        'bono',
        'cher',
        'shakira',
        'rihanna',
        'beyonce',
        'fergie',
        'sia',
        'slash',
        'jewel',
        'dido',
        'seal',
        'sade',
        'enya',
        'usher',
        'bjork',
        'beck',
        'ringo',
        'liberace',
        'morrissey',
        'flea',
        'tupac',
        'moby',
        'kesha',
        'ludacris',
        'lorde',
        'drake',
        'aaliyah',
        'macklemore',
        'selena',
        'brandy',
        'meatloaf',
        'redman',
        'rupaul',
        'coolio',
        'common',
        'nelly',
        'pitbull',
        'shaggy',
    ];

    WordGuess.init(wordList);

    window.addEventListener('keyup', (e) => { WordGuess.playerGuess(e) } );

})(window);
