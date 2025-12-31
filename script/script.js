function Gameboard() {
  let board = new Array(9);

  const GetBoard = () => board;

  const isCellAvailable = (index) => board[index] === undefined;

  const placeToken = (index, token) => {
    if (isCellAvailable(index)) 
      board[index] = token;
    else 
      console.log("This cell is picked!");
  }

  return {GetBoard, placeToken, isCellAvailable};
 }

 function Player(name, token){
   return {name, token, score: 0};
  }
  
  function GameController() {
    const board = Gameboard();
    let gameOver = false;
    
    const winningCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [2, 4, 6],
        [0, 4, 8]
      ];

  const checkWin = () => {
    for (let element of winningCombos){
      if (board.GetBoard()[element[0]] === activePlayer.token
          && board.GetBoard()[element[1]] === activePlayer.token
          && board.GetBoard()[element[2]] === activePlayer.token) {
        activePlayer.score++;
        return activePlayer;
      }
    };
  }

  const checkDraw = () => {
    for (let cell of board.GetBoard()){
      if (cell === undefined)
        return false; 
    }
    return true;
  }
  
  const resetGame = () => {
    board.GetBoard().fill(undefined);
    activePlayer = FirstPlayer;
    gameOver = false;
  };

  const setPlayerNames = (first, second) => {
    FirstPlayer.name = first;
    SecondPlayer.name = second;
  };

  const FirstPlayer = new Player('Player 1', 'X');
  const SecondPlayer = new Player('Player 2', 'O');

  const getActivePlayer = () => activePlayer;
  const getPlayers = () => ({ first: FirstPlayer, second: SecondPlayer });

  let activePlayer = FirstPlayer;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === FirstPlayer ? SecondPlayer : FirstPlayer;
  }


  const playTurn = (index) => {
    if (gameOver) return {status: 'gameOver'};

    if (!board.isCellAvailable(index))
      return {status: 'invalid'};

    board.placeToken(index, activePlayer.token);
    if (checkWin()){
      gameOver = true;
      return { status: 'win', winner: activePlayer };
    }

    if (checkDraw()){
      gameOver = true;
      return { status: 'draw' };
    }

    switchPlayerTurn();
    
    return { status: 'continue' };
  }

  return {board, getActivePlayer, playTurn, resetGame, getPlayers, setPlayerNames};
}

function DisplayController() {
    const game = GameController();
    
    const dialog = document.getElementById('openingScreen');
    dialog.showModal();
    const preventClosing = true;
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && preventClosing) {
        event.preventDefault();
      }
    });

    const startGameButton = document.getElementById('startGame');
    const firstPlayerName = document.getElementById('firstPlayerNameInput');
    const secondPlayerName = document.getElementById('secondPlayerNameInput');
    
    const cells = document.querySelectorAll(".cell");
    const boardArray = game.board.GetBoard();

    startGameButton.onclick = () => {
        game.setPlayerNames(firstPlayerName.value, secondPlayerName.value);
        document.getElementById('firstPlayerName').textContent = firstPlayerName.value;
        document.getElementById('secondPlayerName').textContent = secondPlayerName.value;
    }

    const resetButton = document.getElementById('resetGameButton');

    const renderBoard = () => {
      boardArray.forEach((value, index) => {
        if (value != undefined)
            cells[index].textContent = value;
      });
    }

    const updateScores = () => {
      const players = game.getPlayers();
      document.getElementById('firstPlayerScore').textContent = players.first.score;
      document.getElementById('secondPlayerScore').textContent = players.second.score;
    }

    const resetGame = () => {
      game.resetGame();
      cells.forEach(cell => {
        cell.textContent = '';
      });
    }

    const endGameDialog = (status) => {
      document.getElementById('resultDialog').showModal();
      
      const message = document.getElementById('resultMessage');
      if (status === 'win')
        message.textContent = `${game.getActivePlayer().name} has won the game!`
      else if (status === 'draw')
        message.textContent = 'The game ended with a draw, Try to play again'
      document.getElementById('newGameButton').onclick = () => {
        resetGame();
        document.getElementById('resultDialog').close();
      }
    }

    const updateCellColors = (index) => {
      if (!game.board.isCellAvailable(index)) return;
      if (game.getActivePlayer().token === 'X')
        cells[index].style.color = '#ff6b6b'
      else if (game.getActivePlayer().token === 'O')
        cells[index].style.color = '#4eaaa4ff';
    }

    resetButton.onclick = () => resetGame();

    cells.forEach((cell, index) => {
      cell.addEventListener("click", () => {
        updateCellColors(index);
        
        const result = game.playTurn(index);
        
        if (result.status === 'gameOver' || result.status === 'invalid') return;

        updateScores();
        renderBoard();

        if (result.status === 'win' || result.status === 'draw')
          return endGameDialog(result.status);
        });
    });
}

const display = DisplayController();
