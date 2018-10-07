/**
 * Word Guess Game.
 *
 * UNCC Full Stack Boot Camp.
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

(function (window, undefined) {
    'use strict';

    let WordGuess = {

        // Research this more. It doesn't work without this!
        init: function(words) {
            this.words = words,
            this.correctGuesses = [],
            this.wrongGuesses = [],
            this.correctLetters = 0,
            this.maximumAttempts = 0,
            this.elAttemptsLeft = document.querySelector('#attempts-remaining'),
            this.elGamesWon = document.querySelector('#games-won'),
            this.elCurrentWord = document.querySelector('#current-word'),
            this.elNotices = document.querySelector('#notices'),
            this.elWrongLetters = document.querySelector('#wrong-letters'),
            this.elWrongLetterTitle = document.querySelector('.used-letters > p'),
            this.elHint = document.querySelector('.hint'),
            this.currentWord = this.chooseWord(),
            this.setup();
        },

        setup: function() {
            this.startPlay();
        },

        resetGame: function() {
            this.init(this.words);
            this.showBadGuesses();
        },

        chooseWord: function() {
            let _choice = this.words[Math.floor(Math.random() * this.words.length)];
            this.maximumAttempts = _choice.length + 8;

            let _letters = [];
            for (let i = 0; i < _choice.length; i++ ){
                _letters.push({
                    letter: _choice[i],
                    pos: i
                });
            }

            return {
                letters: _letters,
                word: _choice.toLowerCase(),
                totalLetters: _choice.length
            };
        },

        startPlay: function() {
            let el = '<ul class="word">';

            for (let i = 0; i < this.currentWord.totalLetters; i++) {
                el += '<li data-pos="' + i + '" class="letter">*</li>';
            }

            el += '</ul>';

            this.elCurrentWord.innerHTML = el;
            this.elAttemptsLeft.innerHTML = this.maximumAttempts;
        },

        showBadGuesses: function() {
            if (this.wrongGuesses) {

                let el = '<ul class="wrong-letters">';

                for (let item of this.wrongGuesses) {
                    el += '<li>' + item + '</li>';
                }

                el += '</ul>';
                this.elWrongLetterTitle.classList.remove('hidden');
                this.elWrongLetters.innerHTML = el;
            } else {
                this.elWrongLetterTitle.classList.add('hidden');
                this.elWrongLetters.innerHTML = "";
            }
        },

        playerGuess: function(event) {
            let guess = event.key;
            console.log(guess);

            if (guess.match(/[a-zA-Z]/) && guess.length === 1) {
                if (this.wrongGuesses.indexOf(guess) > -1 || this.correctGuesses.indexOf(guess) > -1) {
                    alert('You have tried that letter before. Please try again!');
                    // TODO: Play sound (failed/bad)
                }
                else {
                    let solvedLetters = this.validateGuess(guess);

                    if (solvedLetters.length > 0) {
                        this.updateBoard(solvedLetters);
                        // TODO: Play sound (success!)
                    } else {
                        this.wrongGuesses.push(guess);
                        if (this.wrongGuesses.length === this.maximumAttempts) {
                            // Game Over
                            // this.playerLoses()
                        } else {
                            this.showBadGuesses();
                            // TODO: Play Sound (failed/bad)
                        }
                    }
                }
            }
        },

        validateGuess: function (guess) {
            let valid = [];

            for (let l of this.currentWord.letters) {
                if (guess.toLowerCase() === l.letter.toLowerCase()) {
                    valid.push(l);
                    this.correctGuesses.push(l.letter);
                }
            }

            return valid;
        },

        updateBoard: function (choices) {

            this.correctLetters = this.correctLetters += choices.length;

            for (let letter of choices) {
                let listItem = this.elCurrentWord.querySelector('li[data-pos="' + letter.pos + '"]');
                listItem.innerHTML = letter.letter;
                listItem.classList.add('correct');

                if (this.correctLetters === this.currentWord.totalLetters) {
                    this.playerWins();
                }
            }
        },

        playerWins: function () {
            this.elNotices.innerHTML = "Awesome, You've Won!";
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

    console.log(WordGuess);

    window.addEventListener('keydown', (e) => { WordGuess.playerGuess(e) } );

})(window);
