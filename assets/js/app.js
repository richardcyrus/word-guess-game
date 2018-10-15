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

    /**
     * A Fisher-Yates shuffle to ensure that for each turn of the game
     * the word presented is unique.
     *
     * @see https://bost.ocks.org/mike/shuffle/
     * @see https://www.frankmitchell.org/2015/01/fisher-yates/
     *
     * @param list
     *
     * @returns {*}
     */
    function shuffle(list) {
        let remaining = list.length, pick, current;

        while(0 !== remaining) {
            pick = Math.floor(Math.random() * remaining--);

            current = list[remaining];
            list[remaining] = list[pick];
            list[pick] = current;
        }

        return list;
    }

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
        elGameNotice: document.querySelector('.game__notice'),
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
        wordList: [],

        /**
         * Populate the word list, choose the first word of play, and
         * start the game.
         *
         * @param words
         */
        init: function (words) {
            /**
             * Copy the word list at page load. This should
             * never be zero again.
             */
            if (this.wordList.length === 0) {
                this.wordList = words.slice();
            }

            /**
             * Shuffle here so the list is always unique.
             *
             * It matters because when the list is exhausted, it's seeded
             * again from `this.wordList`. `this.init()` runs every time
             * the player wins or loses.
             */
            this.words = shuffle(words);
            this.currentWord = this.chooseWord();
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

            if (guess.match(/[a-zA-Z!$]/) && guess.length === 1) {

                if (this.wrongLetters.includes(guess) || this.correctLetters.includes(guess)) {
                    this.elGameNotice.innerHTML = '<p class="flash-warning">You\'ve tried that letter before. Please try again!</p>';
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
            /**
             * Since the playable word list is a random shuffle, we take the
             * next word from the front of the list. This causes the words
             * presented to always be unique until the end of `this.words`.
             */
            let choice = this.words.shift();

            this.remainingAttempts = choice.word.length + padAttempts;

            let letters = [];
            for (let i = 0; i < choice.word.length; i++) {
                letters.push({
                    character: choice.word[i].toLowerCase(),
                    pos: i
                });
            }

            return {
                characters: letters,
                word: choice.word.toLowerCase(),
                totalCharacters: choice.word.length,
                hint: choice.hint
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
            if ('hint' in this.currentWord) {
                this.elHint.innerHTML = this.currentWord.hint;
            }

            // Set at start.
            this.elAttemptsLeft.textContent = this.remainingAttempts;
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
            // Clear per word trackers.
            this.wrongLetters = [];
            this.correctLetters = [];
            this.remainingAttempts = 0;

            // Clear per word page notices.
            this.elTimerMessage.textContent = "";
            this.elHint.textContent = "";
            this.elWrongLetterTitle.style.display = 'none';
            this.elWrongLetters.innerHTML = "";
            this.elTimerOverlay.style.display = 'none';
            this.elTimerTimeLeft.textContent = '';

            try {
                this.elTimerMessage.classList.remove('game-won', 'game-lost');
            } catch (ex) {
                // ignore the error generated when the class is not
                // on the element.
            }

            /**
             * Start with the next word.
             *
             * Here we check if the playing words have been exhausted. If so,
             * we seed the game again, with the copy that was made at page
             * load. -- Makes the game continuous! --
             */
            if (this.words.length === 0) {
                this.init(this.wordList.slice());
            } else {
                this.init(this.words);
            }
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
        {word: "Eminem", hint: "He holds the world record for the most words in a hit single."},
        {word: "Madonna", hint: "She's known as <i>The Material Girl</i>."},
        {word: "Prince", hint: "He played 27 instruments on his debut album."},
        {word: "Elvis", hint: "He holds the record for most top 10 hits on the UK Singles Chart."},
        {word: "Beyonce", hint: "Whose 2013 world tour was called <i>The Mrs Carter Show</i>?"},
        {word: "Rihanna", hint: "My real name is Robyn Fenty."},
        {word: "Meatloaf", hint: "My real name is Michael Lee Aday."},
        {word: "Adele", hint: "This British pop star won 5 Grammy's including Album of the Year in 2017."},
        {word: "Shakira", hint: "In 2006, my song <i>Hips Don't Lie</i> hit the #1 spot in over 50 different countries."},
        {word: "P!nk", hint: "I sang the lyric <i>I'm not here for your entertainment, you don't really wanna mess with ne tonight</i>."},
        {word: "Aqua", hint: "We sing the song <i>Barbie Girl</i>."},
        {word: "Aaliyah", hint: "My last hit song was <i>Rock the boat</i>."},
        {word: "Nelly", hint: "Some of my hit songs are <i>Country Grammar</i>, <i>Ride Wit Me</i> and <i>Hot in Herre</i>."},
        {word: "Usher", hint: "I sang with Alicia Keys on the 2004 hit single <i>My Boo</i>."},
        {word: "Dido", hint: "I've been told my real name is very extravagant. A sample of one of my songs was used on Eminem's song <i>Stan</i>."},
        {word: "Nivea", hint: "Some of my hits are <i>Laundromat</i> and <i>Don't Mess with My Man</i>."},
        {word: "Ke$ha", hint: "I sing the party song <i>Blow</i>."},
        {word: "Ludacris", hint: "I sing <i>Splash Waterfalls</i>."},
        {
            word: "Shaggy",
            hint: "<i>&lsquo;The gift of life astounds me to this day; I give it up for the woman; She's the constant wind that fills my sails; Oh, that woman&rsquo;</i>"
        },
        {word: "Ashanti", hint: "I recorded the single <i>Only U</i>."},
        {word: "Fergie", hint: "In the video for my 2007 chart topper <i>Glamorous</i>, I'm seen on a plane."},
        {word: "Creed", hint: "Some of our hits include <i>Arms Wide Open</i>, <i>My Sacrifice</i> and <i>One Last Breath</i>."},
        {word: "Jibbs", hint: "I have a song with the phrase <i>&lsquo;bout 24 inches is how low I let it hang</i>."},
        {word: "Evanescense", hint: "Which band sings these lyrics? <i>Lay down your head and stay awhile</i>."},
        {word: "Nickelback", hint: "Our band had the hit single <i>Someday</i>."},
        {word: "Chester", hint: "I'm the lead singer in Linkin Park."}
    ];

    WordGuess.init(wordList);

    window.addEventListener('keypress', (e) => {
        WordGuess.playerGuess(e)
    });

})(window);
