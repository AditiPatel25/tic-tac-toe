document.addEventListener('DOMContentLoaded', function () {

    function Gameboard() {
        const rows = 3;
        const columns = 3;
        const board = [];

        // Create a 2d array that will represent the state of the game board
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < columns; j++) {
                board[i].push(Cell());
            }
        }

        // gets entire board
        const getBoard = () => board;

        // marks the spot chosen by the user
        const chooseSquare = (row, column, player) => {
            // checks that the square chosen by the player is available
            if (board[row][column].getValue() !== "") {
                alert("pick a square that isn't occupied")
                return false;
            }

            board[row][column].addChoice(player);
            return true;
        };

        // prints board
        const printBoard = () => {
            const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
        };

        // Here, we provide an interface for the rest of our
        // application to interact with the board
        return { getBoard, chooseSquare, printBoard };
    }

    /*
** A Cell represents one "square" on the board and can have one of
** "": no token is in the square,
** X: Player One's token,
** O: Player 2's token
*/

    function Cell() {
        let value = "";

        // Accept a player's token to change the value of the cell
        const addChoice = (player) => {
            value = player;
        };

        // How we will retrieve the current value of this cell through closure
        const getValue = () => value;

        return {
            addChoice,
            getValue
        };
    }

    /* 
** The GameController will be responsible for controlling the 
** flow and state of the game's turns, as well as whether
** anybody has won the game
*/
    function GameController(
        playerOneName = "Player One",
        playerTwoName = "Player Two"
    ) {
        let board = Gameboard();

        const players = [
            {
                name: playerOneName,
                token: "X",
                numTurns: 0
            },
            {
                name: playerTwoName,
                token: "O",
                numTurns: 0
            }
        ];

        let activePlayer = players[0];

        const switchPlayerTurn = () => {
            activePlayer = activePlayer === players[0] ? players[1] : players[0];
        };
        const getActivePlayer = () => activePlayer;

        const printNewRound = () => {
            board.printBoard();
        };


        const checkForWinner = (board) => {
            const rows = board.length;
            const columns = board[0].length;

            // Check rows for a win
            for (let i = 0; i < rows; i++) {
                if (board[i][0].getValue() !== "" &&
                    board[i][0].getValue() === board[i][1].getValue() &&
                    board[i][1].getValue() === board[i][2].getValue()) {
                    return board[i][0].getValue();
                }
            }

            // Check columns for a win
            for (let j = 0; j < columns; j++) {
                if (board[0][j].getValue() !== "" &&
                    board[0][j].getValue() === board[1][j].getValue() &&
                    board[1][j].getValue() === board[2][j].getValue()) {
                    return board[0][j].getValue();
                }
            }

            // Check diagonal (top-left to bottom-right) for a win
            if (board[0][0].getValue() !== "" &&
                board[0][0].getValue() === board[1][1].getValue() &&
                board[1][1].getValue() === board[2][2].getValue()) {
                return board[0][0].getValue();
            }

            // Check diagonal (top-right to bottom-left) for a win
            if (board[0][2].getValue() !== "" &&
                board[0][2].getValue() === board[1][1].getValue() &&
                board[1][1].getValue() === board[2][0].getValue()) {
                return board[0][2].getValue();
            }

            // No winner found
            return null;
        };

        const playRound = (row, column) => {
            // console.log(`Marking ${getActivePlayer().name}'s choice: [${row}][${column}]...`);
            // marks spot for current player
            let marked = board.chooseSquare(row, column, getActivePlayer().token);

            const winnerText = document.createElement("h2");
            winnerText.classList.add("honk-font");
            winnerText.classList.add("winner-text");

            if (marked) {
                getActivePlayer().numTurns++;

                // checks for winner
                const winnerToken = checkForWinner(board.getBoard());

                if (winnerToken === "X") {
                    winnerText.textContent = `The winner is ${players[0].name}!`;
                    document.body.appendChild(winnerText);
                    return;
                } else if (winnerToken === "O") {
                    winnerText.textContent = `The winner is ${players[1].name}!`;
                    document.body.appendChild(winnerText);
                    return;
                } else if (players[0].numTurns + players[1].numTurns === 9) {
                    winnerText.textContent = `It's a tie!`;
                    document.body.appendChild(winnerText);
                    return;
                }

                // Switch player turn
                switchPlayerTurn();
                printNewRound();
            }
        };

        const restartGame = () => {
            console.log("Restarting game...");
            board = Gameboard();
            activePlayer = players[0];
            players.forEach(player => player.numTurns = 0);
            document.querySelectorAll(".winner-text").forEach(node => node.remove());
            printNewRound();
        };

        // Initial play game message
        printNewRound();

        return {
            playRound,
            getActivePlayer,
            restartGame,
            getBoard: () => board.getBoard()
        };
    }

    function ScreenController() {
        let game = GameController();
        const playerTurnDiv = document.querySelector('.turn');
        const boardDiv = document.querySelector('.board');
        const resetButton = document.getElementById("reset");
        const player1InputName = document.getElementById("player1-name");
        const player2InputName = document.getElementById("player2-name");
        const submitNameButton = document.getElementById("submit-name");

        
        const setName = (event) => {
            event.preventDefault();

            const playerOneName = player1InputName.value.trim() || "Player One";
            const playerTwoName = player2InputName.value.trim() || "Player Two";

            game = GameController(playerOneName, playerTwoName);
            updateScreen();

            player1InputName.value = "";
            player2InputName.value = "";
        };

        submitNameButton.addEventListener("click", setName);

    
        resetButton.addEventListener("click", () => {
            game.restartGame();
            updateScreen();
        });

        const updateScreen = () => {
            // clear the board
            boardDiv.textContent = "";

            // get the newest version of the board and player turn
            const board = game.getBoard();
            const activePlayer = game.getActivePlayer();

            // Display player's turn
            playerTurnDiv.textContent = `${activePlayer.name}'s turn...`

            // Render board squares
            board.forEach((row, rowIndex) => {
                row.forEach((cell, columnIndex) => {
                    // Anything clickable should be a button!!
                    const cellButton = document.createElement("button");
                    cellButton.classList.add("cell");
                    // Create data attributes to identify the row and column
                    // This makes it easier to pass into our `playRound` function 
                    cellButton.dataset.row = rowIndex;
                    cellButton.dataset.column = columnIndex;
                    cellButton.textContent = cell.getValue();
                    boardDiv.appendChild(cellButton);
                });
            });
        }

        // Add event listener for the board
        function clickHandlerBoard(e) {
            const selectedColumn = e.target.dataset.column;
            const selectedRow = e.target.dataset.row;
            // Make sure I've clicked a column and not the gaps in between
            if (!selectedColumn || !selectedRow) return;

            game.playRound(selectedRow, selectedColumn);
            updateScreen();
        }
        boardDiv.addEventListener("click", clickHandlerBoard);

        // Initial render
        updateScreen();

        // We don't need to return anything from this module because everything is encapsulated inside this screen controller.
    }

    ScreenController();
});

