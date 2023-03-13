(function (global) {
    "use strict";

    // Helper utilities
    var util = {
        extend: function (src, props) {
            props = props || {};
            var p;
            for (p in src) {
                if (!props.hasOwnProperty(p)) {
                    props[p] = src[p];
                }
            }
            return props;
        },
        each: function (a, b, c) {
            if ("[object Object]" === Object.prototype.toString.call(a)) {
                for (var d in a) {
                    if (Object.prototype.hasOwnProperty.call(a, d)) {
                        b.call(c, d, a[d], a);
                    }
                }
            } else {
                for (var e = 0, f = a.length; e < f; e++) {
                    b.call(c, e, a[e], a);
                }
            }
        },
        isNumber: function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n) && n != 0;
        },
        includes: function (a, b) {
            return a.indexOf(b) > -1;
        },
    };

    /**
     * Default configuration options. These can be overriden
     * when loading a game instance.
     * @property {Object}
     */
    var defaultConfig = {};

    /**
     * Sudoku singleton engine
     * @param {Object} config Configuration options
     */
    function Game(config) {
        this.config = config;

        // Initialize game parameters
        this.cellMatrix = {};
        this.matrix = {};

        this.values = [];

        this.resetValidationMatrices();

        return this;
    }
    /**
     * Game engine prototype methods
     * @property {Object}
     */
    Game.prototype = {
        /**
         * Build the game GUI
         * @returns {HTMLTableElement} Table containing 9x9 input matrix
         */
        buildGUI: function () {
            var td, tr;

            this.table = document.createElement("table");
            this.table.classList.add("sudoku-container");

            for (var i = 0; i < 9; i++) {
                tr = document.createElement("tr");
                this.cellMatrix[i] = {};

                for (var j = 0; j < 9; j++) {
                    // Build the input
                    this.cellMatrix[i][j] = document.createElement("input");
                    this.cellMatrix[i][j].maxLength = 1;

                    // Using dataset returns strings which means messing around parsing them later
                    // Set custom properties instead
                    this.cellMatrix[i][j].row = i;
                    this.cellMatrix[i][j].col = j;

                    this.cellMatrix[i][j].addEventListener("keyup", this.onKeyUp.bind(this));

                    td = document.createElement("td");

                    td.appendChild(this.cellMatrix[i][j]);

                    // Calculate section ID
                    var sectIDi = Math.floor(i / 3);
                    var sectIDj = Math.floor(j / 3);
                    // Set the design for different sections
                    if ((sectIDi + sectIDj) % 2 === 0) {
                        td.classList.add("sudoku-section-one");
                    } else {
                        td.classList.add("sudoku-section-two");
                    }
                    // Build the row
                    tr.appendChild(td);
                }
                // Append to table
                this.table.appendChild(tr);
            }

            this.table.addEventListener("mousedown", this.onMouseDown.bind(this));

            // Return the GUI table
            return this.table;
        },

        /**
         * Handle keyup events.
         *
         * @param {Event} e Keyup event
         */
        onKeyUp: function (e) {
            var val, row, col,
                input = e.currentTarget

            val = input.value.trim();
            row = input.row;
            col = input.col;

            // Reset board validation class
            this.table.classList.remove("valid-matrix");
            input.classList.remove("invalid");

            if (!util.isNumber(val)) {
                input.value = "";
                return false;
            }
            // Cache value in matrix
            this.matrix[row][col] = val;
        },

        onMouseDown: function (e) {
            var t = e.target;

            if (t.nodeName === "INPUT" && t.classList.contains("disabled")) {
                e.preventDefault();
            }
        },

        /**
         * Reset and rebuild the validation matrices
         */
        resetValidationMatrices: function () {
            this.matrix = {};

            // Build the row/col matrix and validation arrays
            for (var i = 0; i < 9; i++) {
                this.matrix[i] = ["", "", "", "", "", "", "", "", ""];
            }
        },
    };

    /**
     * Get a number of random array items
     *
     * @param {Array} array The array to pick from
     * @param {Number} count Number of items
     * @returns {Array} Array of items
     */
    function removeEmply(array) {
        var ret = [];

        for (var i = 0; i < array.length; i++) {
            if (array[i].value != 0) {
                ret.push(array[i]);
            }
        }
        return ret;
    }

    function triggerEvent(el, type) {
        if ('createEvent' in document) {
            // modern browsers, IE9+
            var e = document.createEvent('HTMLEvents');
            e.initEvent(type, false, true);
            el.dispatchEvent(e);
        } else {
            // IE 8
            var e = document.createEventObject();
            e.eventType = type;
            el.fireEvent('on' + e.eventType, e);
        }
    }

    var Sudoku = function (container, settings) {
        this.container = container;

        if (typeof container === "string") {
            this.container = document.querySelector(container);
        }

        this.game = new Game(util.extend(defaultConfig, settings));

        this.container.appendChild(this.getGameBoard());
    };

    Sudoku.prototype = {
        /**
         * Return a visual representation of the board
         * @returns {jQuery} Game table
         */
        getGameBoard: function () {
            return this.game.buildGUI();
        },

        newGame: function () {
            var that = this;

            setTimeout(function () {
                that.start();
            }, 20);
        },

        /**
         * Start a game.
         */
        start: function (input) {
            var arr = [],
                x = 0,
                values,
                rows = input,
                inputs = this.game.table.getElementsByTagName("input");

            util.each(rows, function (i, row) {
                util.each(row, function (r, val) {
                    arr.push({
                        index: x,
                        value: val
                    });
                    x++;
                });
            });

            // Get random values for the start of the game
            values = removeEmply(arr);
            util.each(values, function (i, data) {
                var input = inputs[data.index];
                input.value = data.value;
                input.classList.add("disabled");
                input.tabIndex = -1;
                triggerEvent(input, 'keyup');
            });
        },

        /**
         * Call for a validation of the game board.
         * @returns {Boolean} Whether the board is valid
         */
        validate: async function () {
            var isValid;
            isValid = true
            spinner.style.display = "flex";
            for (var i = 0; i != 9; ++i) {
                for (var j = 0; j != 9; ++j) {
                    if (this.game.matrix[i][j] != '') {
                        this.game.matrix[i][j] = this.game.matrix[i][j];
                    } else {
                        this.game.matrix[i][j] = '0';
                    }
                }
            }
            var that = this;
            var boardInput = (Object.keys(this.game.matrix).map(function (k) {
                return that.game.matrix[k];
            }));
            try {
                await contract.verifyWin(boardInput);
                playerWon.innerHTML = "Player has Won!"
                this.game.table.classList.toggle("valid-matrix", isValid);
                controls.style.display = "none";
            } catch (err) {
                if (err.code == 4001) {
                    alert("txn declined");
                } else {
                    alert("invalid board");
                }
            }
            spinner.style.display = "none";
        },
    };

    global.Sudoku = Sudoku;
})(this);

const provider = ((window.ethereum != null) ? new ethers.providers.Web3Provider(window.ethereum) : ethers
    .providers.getDefaultProvider());
let address, contract;
let spinner = document.getElementById("spinner")
let resultContent = document.getElementById("result-content")
let connectButton = document.getElementById('connect');
let playerWon = document.getElementById("player-won")
let controls = document.getElementById("controls");

connectButton.addEventListener('click', getAccounts);


const contractAddress = "0x8dd690Ce9c415EcB601707645D91e22097973Ae4";
const ABI = [{
        "inputs": [],
        "name": "InvalidBoard",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ProcessedAlready",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "UnSolved",
        "type": "error"
    },
    {
        "inputs": [{
            "internalType": "uint256[9][9]",
            "name": "_board",
            "type": "uint256[9][9]"
        }],
        "name": "verifyWin",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getBoard",
        "outputs": [{
            "internalType": "uint256[9][9]",
            "name": "_board",
            "type": "uint256[9][9]"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getSolvedBoard",
        "outputs": [{
            "internalType": "uint256[9][9]",
            "name": "_board",
            "type": "uint256[9][9]"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "playerWon",
        "outputs": [{
            "internalType": "bool",
            "name": "_won",
            "type": "bool"
        }],
        "stateMutability": "view",
        "type": "function"
    }
];

async function getAccounts() {
    let accounts = await provider.send('eth_requestAccounts', []);
    if (accounts.length) {
        address = accounts[0];
        document.getElementById('connect').remove();
        document.getElementById('connect_message').innerHTML = address;
        contractInit();
    }
}

async function loadValues() {
    var board;
    const userWon = await contract.playerWon();
    if (userWon) {
        board = await contract.getSolvedBoard();
        playerWon.innerHTML = "Player has Won!"
        controls.style.display = "none";
    } else {
        board = await contract.getBoard();
    }
    spinner.style.display = "none"
    game.start(board);
    this.game.game.table.classList.toggle("valid-matrix", userWon);
    resultContent.style.display = "block"
}

function contractInit() {
    spinner.style.display = "flex";
    contract = new ethers.Contract(contractAddress, ABI, provider.getSigner());
    loadValues();
}
var game = new Sudoku(".container");

const container = document.querySelector(".sudoku-container");
const inputs = Array.from(document.querySelectorAll("input"));
container.addEventListener("click", e => {
    const el = e.target.closest("input");

    if (el) {
        inputs.forEach(input => {
            input.classList.toggle("highlight", input.value && input.value === el.value);
        });
    }
}, false);

document.getElementById("controls").addEventListener("click", function (e) {

    var t = e.target;

    if (t.nodeName.toLowerCase() === "button") {
        game[t.dataset.action]();
    }
});