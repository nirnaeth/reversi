/*jslint vars: true, white: true, plusplus: true, maxerr: 50, indent: 4 */

var Reversi = function () {
  "use strict";

  // Column names
  var colName = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  // Row names
  var rowName = ['1', '2', '3', '4', '5', '6', '7', '8'];

  var passMove = function () {
    var that = {};

    that.isPassMove = function () { return true; };
    that.isGameOver = function () { return false; };
    that.getPosition = function () { return null; };
    that.show = function () { return "Pass"; };
    return that;
  };

  var gameOverMove = function () {
    var that = {};

    that.isPassMove = function () { return false; };
    that.isGameOver = function () { return true; };
    that.getPosition = function () { return null; };
    that.show = function () { return "Game over"; };
    return that;
  };

  var positionMove = function (position) {
    var that = {};
    var movePosition = position;
    that.isPassMove = function () { return false; };
    that.isGameOver = function () { return false; };
    that.getPosition = function () { return movePosition; };
    that.show = function () { return movePosition.show(); };
    return that;

  };

  var otherPlayer = function (type) {
    if (type === 1) { return 2; }
    if (type === 2) { return 1; }
  };

  function Reversi(spec) {
    spec = spec || {};

    if (spec.board !== undefined) {
      this.b = spec.board.copy();
    }
    else {
      this.b = new Board();
    }
    this.currentPlayer = spec.currentPlayer || 1;
  };

  Reversi.prototype.setup = function () {
    this.b = new Board();
    this.b.setTypeAtPosition(new Position(3, 3), 1);
    this.b.setTypeAtPosition(new Position(4, 4), 1);
    this.b.setTypeAtPosition(new Position(3, 4), 2);
    this.b.setTypeAtPosition(new Position(4, 3), 2);
    this.currentPlayer = 1;
  };

  Reversi.prototype.getBoard = function () { return this.b; };
  Reversi.prototype.getCurrentPlayer = function () { return this.currentPlayer; };
  Reversi.prototype.setCurrentPlayer = function (player) { this.currentPlayer = player; };

  var getTurnedPieces = function (board, position, type) {
    var direction;
    var otherColor = otherPlayer(type);
    var turnList = [];
    if (board.getTypeAtPosition(position) !== 0) { return turnList; }

    for (direction = 0; direction < 8; direction++) {
      var newPosition = position.move(direction);
      if (newPosition === null) { continue; }
      var typeAtPosition = board.getTypeAtPosition(newPosition);
      var possibleList = [];
      while (typeAtPosition === otherColor) {
        possibleList.push(newPosition);
        newPosition = newPosition.move(direction);
        if (newPosition === null) {
          break;
        }
        typeAtPosition = board.getTypeAtPosition(newPosition);
        if (typeAtPosition === type) {
          turnList = turnList.concat(possibleList);
        }
      }
    }
    return turnList;
  };

  Reversi.prototype.makePassMove = function () {
    var allowedMoveList = this.getLegalMoves();
    if (allowedMoveList.length > 1) { throw "Not allowed to pass when multiple possible moves exist"; }

    if (allowedMoveList[0].isGameOver()) { throw "Pass move not allowed when game is over"; }

    if (allowedMoveList[0].isPassMove()) {
      this.currentPlayer = otherPlayer(this.currentPlayer);
    } else {
      throw "Not allowed to pass when possible move exists";
    }
  };

  Reversi.prototype.doMove = function (move) {
    var newGame = new Reversi({ board: this.b, currentPlayer: this.currentPlayer });
    newGame.makeMove(move);
    return newGame;
  };

  Reversi.prototype.makeMove = function (positionMove) {
    var index;
    if (positionMove.isPassMove()) {
      this.makePassMove();
      return;
    }

    var position = positionMove.getPosition();
    if (position === null) { throw "Not a valid move"; }

    var turnList = getTurnedPieces(this.b, position, this.currentPlayer);
    if (turnList.length === 0) { throw "Illegal move"; }

    for (index = 0; index < turnList.length; index++) {
      this.b.setTypeAtPosition(turnList[index], this.currentPlayer);
    }
    this.b.setTypeAtPosition(position, this.currentPlayer);
    this.currentPlayer = otherPlayer(this.currentPlayer);
  };

  var findLegalMovesForPlayer = function (player, b) {
    var row, column, legalMoves = [];
    var tryLocation;
    var turnList;

    for (row = 0; row < 8; row++) {
      for (column = 0; column < 8; column++) {
        tryLocation = new Position(row, column);
        turnList = getTurnedPieces(b, tryLocation, player);
        if (turnList.length > 0) {
          legalMoves.push(positionMove(tryLocation));
        }
      }
    }
    return legalMoves;
  };

  Reversi.prototype.getLegalMoves = function () {
    /// <summary>Find all legal moves where a piece is placed on board and turns opponent pieces
    /// if None are found - see if other player has options
    /// if both are unable to make a move the game is over
    /// if opponent is able to move make a pass move</summary>

    var legalMoves = findLegalMovesForPlayer(this.currentPlayer, this.b);

    // If no pieces may be placed player we have two cases
    // If other player has valid moves the current player may only make a pass move
    // If other player also has no valid moves the game has ended.
    if (legalMoves.length === 0) {
      var otherPlayerLegalMoves = findLegalMovesForPlayer(otherPlayer(this.currentPlayer), this.b);
      if (otherPlayerLegalMoves.length === 0) {
        legalMoves.push(gameOverMove());
      } else {
        legalMoves.push(passMove());
      }
    }

    return legalMoves;
  };

  Reversi.prototype.drawBoard = function (location) {
    var tableAsHtml = b.toString();
    $(location).append(tableAsHtml);
  };

  var drawBoard = function (game, clickEventHandler, passHandler) {
    var rowIndex, columnIndex;
    var playerOneCount = 0, playerTwoCount = 0;

    var board = game.getBoard();

    var allowedMoves = game.getLegalMoves();

    var table = $("<table>").addClass("board");
    
    var row = ''//$("<tr>");
    //row.addClass('col_header');
    //table.append(row);
    //row.append($("<td>"));
    // for (columnIndex = 0; columnIndex < 8; columnIndex++) {
    //   row.append($("<td>").append(colName[columnIndex]));
    // }
    //row.append($("<td>").addClass('row_header'));

    var internalClickEventHandler = function (event) {
      var r = event.data.row;
      var c = event.data.column;
      clickEventHandler(r, c);
    };

    for (rowIndex = 0; rowIndex < 8; rowIndex++) {
      row = $("<tr>")//.append($("<td>").append(rowName[rowIndex]));
      for (columnIndex = 0; columnIndex < 8; columnIndex++) {
        // Find type to draw
        var type = board.getTypeAtPosition(new Position(rowIndex, columnIndex));
        var sign = " ";
        var field = $("<td>");
        if (type === 1) {
          playerOneCount = playerOneCount + 1;
          field.addClass("p1").append('<div></div');
        }
        if (type === 2) {
          playerTwoCount = playerTwoCount + 1;
          field.addClass("p2").append('<div></div');
        }
        /*var movesIndex;
        if (type === 0) {
          for (movesIndex = 0; movesIndex < allowedMoves.length; movesIndex++) {
            var move = allowedMoves[movesIndex];
            if (move.isPassMove() === false && move.isGameOver() === false) {
              var location = move.getPosition();
              if (location.getRow() === rowIndex && location.getColumn() === columnIndex) {
                field.addClass("allowed");
                //field.addClass("p" + game.getCurrentPlayer());
              }
            }
          }
        }*/
        // Draw field
        if (type === 0) {
          field.click({ row: rowIndex, column: columnIndex }, internalClickEventHandler);
        }
        row.append(field);
      }
      //row.append($("<td>").append(rowName[rowIndex]).addClass('row_header'));
      table.append(row);
    }
    
    if (allowedMoves.length === 1 && allowedMoves[0].isPassMove()) {
      $("#pass_button").removeClass('button_disabled');
      $("#pass_button").click(passHandler);
    }
    
    var state = "";
    if (allowedMoves.length === 1 && allowedMoves[0].isGameOver()) {
      state = "Game over";
    }
    
    $('#player_1 .score').html("").append(playerOneCount);
    $('#player_2 .score').html("").append(playerTwoCount);
    return table;
  };

  var getBestMove = function (game, positionEvaluator) {
    var moveList = game.getLegalMoves();
    var bestScore = -1000;
    var bestIndex = -1;
    var i;
    var playerSign = 1;
    if (game.getCurrentPlayer() == 2) { playerSign = -1; }

    for (i = 0; i < moveList.length; i++) {
      var newGame = game.doMove(moveList[i]);
      var newGameValue = positionEvaluator(newGame.getBoard()) * playerSign;
      if (newGameValue > bestScore) {
        bestIndex = i;
        bestScore = newGameValue;
      }
    }
    return moveList[bestIndex];
  };


  var minimax = function (state,
    evaluationFunction,
    getActionsFunction,
    performActionFunction,
    ply,
    withPruning, maxPlayer) {
    /// <summary>Minimax with optional alpha-beta pruning
    /// 
    /// Arguments: 
    ///
    ///   state - A state object send as first argument to
    ///   evaluationFunction - Function returning a value given a state
    ///   getActionsFunction - Function returning an array of allowed moves 
    ///   performActionFunction - Function returning a new state when applying an action 
    ///   ply - Number of moves to search
    ///   withPruning - True/False whether to use alpha-beta pruning
    ///   maxPlayer - Function that given a state specifies whether it should maximize or minimize.  
    /// </summary>
    var nodes = 0;
    var evaluations = 0;
    withPruning = withPruning || false; // Run without pruning if not specified
    maxPlayer = maxPlayer || (function (x) { return true; }); // Assume player 1

    // Test if we are at a leaf either because of search depth or because of end-of-game.	

    function leaf(state, ply) {
      if (ply === 0) {
        evaluations = evaluations + 1;
        return { value: evaluationFunction(state) };
      }
      var actions = getActionsFunction(state);
      if (actions.length === 0) {
        evaluations = evaluations + 1;
        return { value: evaluationFunction(state) };
      }
      return { actions: actions };
    }

    // Maximize over state
    function maxValueFunction(state, ply, alpha, beta) {
      nodes = nodes + 1;
      var actions = leaf(state, ply);
      if (actions.value !== undefined) {
        return { value: actions.value, index: -1 };
      }

      var actionIndex;
      var maxValue = -1e125;
      var maxIndex = -1;
      actions = actions.actions;
      for (actionIndex = 0; actionIndex < actions.length; actionIndex++) {
        var action = actions[actionIndex];
        var newState = performActionFunction(state, action);
        var min = minValueFunction(newState, ply - 1, alpha, beta);
        var v = min.value;
        if (v > maxValue) {
          maxValue = v;
          maxIndex = actionIndex;
        }
        if (v >= beta && withPruning) {
          break;
        }
        alpha = v > alpha ? v : alpha;
      }
      return { value: maxValue, index: maxIndex, move: actions[maxIndex] };
    }

    // Minimize over state
    function minValueFunction(state, ply, alpha, beta) {
      nodes = nodes + 1;
      var actions = leaf(state, ply);
      if (actions.value !== undefined) {
        return { value: actions.value, index: -1 };
      }

      var actionIndex;
      var minValue = 1e125;
      var minIndex = -1;
      actions = actions.actions;
      for (actionIndex = 0; actionIndex < actions.length; actionIndex++) {
        var action = actions[actionIndex];
        var newState = performActionFunction(state, action);
        var max = maxValueFunction(newState, ply - 1, alpha, beta);
        var v = max.value;
        if (minValue > v) {
          minValue = v;
          minIndex = actionIndex;
        }
        if (v <= alpha && withPruning) {
          break;
        }
        beta = v < beta ? v : beta;
      }
      return { value: minValue, index: minIndex, move: actions[minIndex] };
    }

    var m;
    if (maxPlayer(state)) {
      m = maxValueFunction(state, ply, -1e125, 1e125);
    } else {
      m = minValueFunction(state, ply, -1e125, 1e125);
    }


    return {
      move: m.move,
      value: m.value,
      visited: nodes,
      evaluations: evaluations
    };
  };

  // Adapt the reversi game for the minimax function
  var getBestMoveMinimax = function (game, positionEvaluator, ply) {

    function evaluate(game) {
      return positionEvaluator(game.getBoard());
    };
    function getActions(game) {
      return game.getLegalMoves();
    };
    function doAction(game, action) {
      var newGame = game.doMove(action);
      return newGame;
    };
    function doMax(game) {
      return game.getCurrentPlayer() === 1;
    };

    var move = minimax(game, evaluate, getActions, doAction, ply, true, doMax);
    return move.move;
  };

  var simpleEvaluator = function (board) {
    /// <summary>Evaluate the board as a simple piece count</summary>
    var value = 0, row, column;
    for (row = 0; row < 8; row++) {
      for (column = 0; column < 8; column++) {
        var type = board.getTypeAtPosition(new Position(row, column));
        if (type === 1) { value++; }
        if (type === 2) { value--; }
      }
    }
    return value;
  };

  var runGame = function () {
    /// <summary>Run the game</summary>
    var game = new Reversi();
    game.setup();

    // var addMoveToList = function (player, move) {
    //   $("#movelist").append("<span class='player" + player + "'>Player " + player + " made move " +
    //          move.show() + "</span><br/>");
    //   var current = $("#output").val();
    //   if (current.toString().trim().length == 0) {
    //     $("#output").val(move.show());
    //   } else {
    //     $("#output").val(current + ":" + move.show());
    //   }
    // };
    
    var opponentMove = function () {
      /// <summary>Make a computer move</summary>
      /// <returns type="">Returns the opponent move</returns>
      var moves = game.getLegalMoves();
      if (moves.length == 1 && moves[0].isGameOver()) {
        return moves[0];
      } else {
        var bestMove;
        var maxIndex = moves.length;
        //var type = $("#cputype").val();
        var type = "simplebest";
        switch (type) {
          case "first": bestMove = moves[0]; break;
          case "last": bestMove = moves[maxIndex - 1]; break;
          case "random":
            var randomIndex = Math.floor(Math.random() * maxIndex);
            bestMove = moves[randomIndex];
            break;
          case "simplebest":
            bestMove = getBestMove(game, simpleEvaluator);
            break;
          default:
            bestMove = getBestMoveMinimax(game, simpleEvaluator, 4);
            break;
        }
        //addMoveToList(game.getCurrentPlayer(), bestMove);
        game.makeMove(bestMove);
        return bestMove;
      }
    };

    var drawBoardWithEventHandlers = function () {
      var board = drawBoard(game, eventHandler, passHandler);
      $("#board").html(board);
    };

    var passHandler = function () {
      try {
        var move = passMove();
        //addMoveToList(game.getCurrentPlayer(), move);
        game.makeMove(move);
      }
      catch (err) {
        window.alert(err);
        return;
      }

      opponentMove();
      drawBoardWithEventHandlers();
    };

    // Push the error in case of illegal moves
    var eventHandler = function (row, column) {
      try {
        var move = positionMove(new Position(row, column));
        //addMoveToList(game.getCurrentPlayer(), move);
        game.makeMove(move);
      }
      catch (err) {
        //window.alert(err);
        return;
      }

      opponentMove();
      drawBoardWithEventHandlers();
    };

    $("#replay").click(
       function () {
         var move;
         var data =  $("#input").val();
         var parts = data.split(":");
         var mymove = parts[0];
         var opponent = parts[1];
         var remaining = parts.slice(2, parts.length).join(":");
         if (mymove.length == 2) {
           var row = parseInt(mymove[0]);
           var column = mymove.charCodeAt(1) - "A".charCodeAt(0) + 1;
           move = positionMove(new Position(row - 1, column - 1));
         } else if (mymove == "Pass") {
           move = passMove();
         }
         //addMoveToList(game.getCurrentPlayer(), move);
         game.makeMove(move);
         var actualOpponentMove = opponentMove();
         // TODO: Verify that the move is the same (we assume deterministic move evaluation)

         // Redraw
         $("#input").val(remaining);
         drawBoardWithEventHandlers();
       }
    );

    drawBoardWithEventHandlers();
  };

  return {
    Position: Position,
    gameOverMove: gameOverMove,
    positionMove: positionMove,
    passMove: passMove,
    Board: Board,
    Reversi: Reversi,
    getTurnedPieces: getTurnedPieces,
    drawBoard: drawBoard,
    getBestMove: getBestMove,
    getBestMoveMinimax: getBestMoveMinimax,
    simpleEvaluator: simpleEvaluator,
    runGame: runGame,
    minimax: minimax
  };
};
