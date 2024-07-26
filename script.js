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
            if (board[row][column].getValue() !== 0) {
                console.log("cell is occupied")
                return;
            }

            board[row][column].addChoice(player);
            return true;
        };

        // This method will be used to print our board to the console.
        // It is helpful to see what the board looks like after each turn as we play,
        // but we won't need it after we build our UI
        const printBoard = () => {
            const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
            console.log(boardWithCellValues);
        };

        // Here, we provide an interface for the rest of our
        // application to interact with the board
        return { getBoard, chooseSquare, printBoard };
    }

    /*
** A Cell represents one "square" on the board and can have one of
** 0: no token is in the square,
** X: Player One's token,
** O: Player 2's token
*/

    function Cell() {
        let value = 0;

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
        const board = Gameboard();

        const players = [
            {
                name: playerOneName,
                token: "X"
            },
            {
                name: playerTwoName,
                token: "O"
            }
        ];

        let activePlayer = players[0];

        const switchPlayerTurn = () => {
            activePlayer = activePlayer === players[0] ? players[1] : players[0];
        };
        const getActivePlayer = () => activePlayer;

        const playRound = (row, column) => {
            // Drop a token for the current player
            console.log(`Marking ${getActivePlayer().name}'s choice: [${row}][${column}]...`);
            board.chooseSquare(row, column, getActivePlayer().token);

            // while (true) {
            //     console.log(`Marking ${getActivePlayer().name}'s choice: [${row}][${column}]...`);
            //     const isMoveValid = board.chooseSquare(row, column, getActivePlayer().token);

            //     if (isMoveValid) {
            //       break;
            //     } else {
            //       console.log("That space is full, please choose another space");
            //     }
            //   }

            /*  This is where we would check for a winner and handle that logic,
                such as a win message. */

            // Switch player turn
            switchPlayerTurn();
            printNewRound();
        };

        // For the console version, we will only use playRound, but we will need
        // getActivePlayer for the UI version, so I'm revealing it now
        return {
            playRound,
            getActivePlayer,
            getBoard: board.getBoard
        };
    }

    function ScreenController() {
        const game = GameController();
        const playerTurnDiv = document.querySelector('.turn');
        const boardDiv = document.querySelector('.board');

        const updateScreen = () => {
            // clear the board
            boardDiv.textContent = "";

            // get the newest version of the board and player turn
            const board = game.getBoard();
            const activePlayer = game.getActivePlayer();

            // Display player's turn
            playerTurnDiv.textContent = `${activePlayer.name}'s Turn...`

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

