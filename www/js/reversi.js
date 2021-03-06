/*jslint vars: true, white: true, plusplus: true, maxerr: 50, indent: 4 */
$(document).bind('storage', function (e) {
  refreshLocalStorage();
  e.preventDefault;
});

var Reversi = function () {
  "use strict";

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

    if (this.game_type == 2) {
      // Use custom player name
      if (window.localStorage.name == undefined || window.localStorage.name == '') {
        window.localStorage.name = 'Player';
      }
      $('#name').val(window.localStorage.name);
    } else {
      if (window.localStorage.name_1 == undefined || window.localStorage.name_1 == '') {
        window.localStorage.name_1 = 'Player 1';
      }

      if (window.localStorage.name_2 == undefined || window.localStorage.name_2 == '') {
        window.localStorage.name_2 = 'Player 2';
      }

      $('#name_1').val(window.localStorage.name_1);
      $('#name_2').val(window.localStorage.name_2);
    }

    $('#name_field').hide();
    $('#names_field').hide();

    // Which player is the current one
    this.currentPlayer = spec.currentPlayer || 1;
  };

  Reversi.prototype.setup = function (game_type) {
    this.b = new Board();
    this.b.setTypeAtPosition(new Position(3, 3), 1);
    this.b.setTypeAtPosition(new Position(4, 4), 1);
    this.b.setTypeAtPosition(new Position(3, 4), 2);
    this.b.setTypeAtPosition(new Position(4, 3), 2);
    this.currentPlayer = 1;
    if (this.piece_sound === undefined) {
      this.piece_sound = new Audio('sounds/piece.mp3');
    }
    this.game_type = game_type;
  };

  Reversi.prototype.playPieceSound = function() {
    if (this.sounds_option === 'on' || this.sounds_option === undefined) {
      this.piece_sound.play();
    }
  }

  Reversi.prototype.playSound = function(path) {
    if (this.sounds_option === 'on' || this.sounds_option === undefined) {
      var audio = new Audio(path);
      audio.play();
    }
  }

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

  var refreshLocalStorage = function() {
    if (window.localStorage.record != undefined) {
      $('#chart').empty();
      $('#chart').append('<ol></ol>');
      var chart = JSON.parse(window.localStorage.getItem('record'));

      chart.sort(function(a, b) {
        return b.score.me - a.score.me;
      });

      chart.forEach(function(item) {
        var position = '<li>' + item.name + ' <span class="float_right">' + item.score.me + ' - ' + item.score.opponent + '</span></li>'
        $('#record ol').append(position);
      });
    }

    if (game.game_type == 2) {
      $('#player_1_name').html(window.localStorage.getItem('name_1'));
      $('#player_2_name').html(window.localStorage.getItem('name_2'));
    } else {
      $('#player_1_name').html(window.localStorage.getItem('name'));
      $('#player_2_name').html('Computer');
    }

  };


  var updateChart = function(name, my_score, opponent_score) {
    var current_name = name == undefined ? window.localStorage.name : name;

    var obj = {
      'name' : current_name,
      'score' : {
        'me' : my_score,
        'opponent' : opponent_score
      }
    }

    if (window.localStorage.record == undefined) {
      var chart = [];
    } else {
      var chart = JSON.parse(window.localStorage.record);
    }

    chart.push(obj);

    var last = chart[chart.length - 1];

    if (chart.length > 1 && my_score > last.score.me) {
      chart.sort(function(a, b) {
        return b.score.me - a.score.me;
      });
    }

    if (chart.length > 10) {
      chart.splice(9, 1);
    }

    window.localStorage.setItem('record', JSON.stringify(chart));

    refreshLocalStorage();
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
    var row = '';

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

        // Draw field
        if (type === 0) {
          field.click({ row: rowIndex, column: columnIndex }, internalClickEventHandler);
        }
        row.append(field);
      }
      table.append(row);
    }

    if (allowedMoves.length === 1 && allowedMoves[0].isPassMove()) {
      $("#pass_button").removeClass('button_disabled');
      $("#pass_button").click(passHandler);
    } else {
      $("#pass_button").addClass('button_disabled');
    }

    var state = "";
    if (allowedMoves.length === 1 && allowedMoves[0].isGameOver()) {
      state = "Game over";
      var selector = '#end_game #result';
      $(selector).empty();
      var result_string = '<div class="inner_standard">';

      // Single player
      if (game.game_type == undefined) {
        result_string = 'You won!';

        var result = 'win';

        if (playerOneCount < playerTwoCount) {
          result_string = 'You lose :(';
          result = 'lose';
        } if (playerOneCount == playerTwoCount) {
          result_string = "It's a tie! :|"
          result = 'tie';
        } else {
          updateChart(playerOneCount, playerTwoCount);
        }
      } else { // Two players
        var result = 'win';

        if (playerOneCount == playerTwoCount) {
          result_string = "It's a tie! :|"
          result = 'tie';
        } else {

          if (playerOneCount > playerTwoCount) {
            var winner_name = window.localStorage.getItem('name_1');
            result_string = winner_name + " won!";
            updateChart(winner_name, playerOneCount, playerTwoCount);
          } else {
            var winner_name = window.localStorage.getItem('name_2');
            result_string = winner_name + " won!";
            updateChart(winner_name, playerTwoCount, playerOneCount);
          }
        }
      }

      $(selector).append(result_string);
      $(selector).append('<br />' + playerOneCount + ' - ' + playerTwoCount + '</div>');

      $.mobile.changePage($('#end_game'));
      if (result != 'tie') {
        game.playSound("sounds/" + result + ".mp3");
      }
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
    if (game.getCurrentPlayer() === 2) { playerSign = -1; }

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

  var runGame = function (game_type) {
    /// <summary>Run the game</summary>
    var game = new Reversi();
    game.setup(game_type);

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

        game.makeMove(bestMove);

        setTimeout(function(){
          drawBoardWithEventHandlers();
          game.playPieceSound();
        }, 700);

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
        game.makeMove(move);
      }
      catch (err) {
        alert(err);
        return;
      }
      setTimeout(function(){
        drawBoardWithEventHandlers();
          game.playPieceSound();
        }, 700);
    };

    // Push the error in case of illegal moves
    var eventHandler = function (row, column) {
      try {
        var move = positionMove(new Position(row, column));
        game.makeMove(move);
        game.playPieceSound();
      }
      catch (err) {
        return;
      }

      drawBoardWithEventHandlers();
      if (game.game_type === undefined) {
        opponentMove();
      }

    };

    drawBoardWithEventHandlers();

    var randomBackground = function() {
      // Random background
      var backgroundColor = '';
      //var backgroundList = ['_astralia', '_brownfield', '_cucina', '_dynamite', '_goldfish', '_uno'];
      var backgroundList = ['_astralia', '_brownfield', '_sunandsnow'];
      var backgroundImage = backgroundList[Math.floor(Math.random() * backgroundList.length)];
      var currentBackgroundMatch = $('#game').css('background').match(/base_reversi.*.png/gi);
      var newBackground = 'base_reversi' + backgroundImage + '.png  ';
      var oldBackground = currentBackgroundMatch[0];

      if (oldBackground.match(/@/) !== null) {
        var parts = oldBackground.split('@');
        newBackground = 'base_reversi' + backgroundImage + '@' + parts[1];
      }
      
      $('#game').css('background', "url('img/" + newBackground + "') 0 0 no-repeat");

      if (newBackground.match(/base_reversi_dynamite.*/) !== null) {
        $('#player_1').css('color', '#000000');
      } else {
        $('#player_1').css('color', '#ffffff');
      }

      backgroundList = null;
      backgroundColor = null;
      currentBackgroundMatch = null;
      oldBackground = null;
      newBackground = null;
      parts = null;
    };

    $("#replay_button").click(
       function () {
         if (game.game_type == 2) {
           runGame(2);
         } else {
           runGame();
         }

         randomBackground();
         $.mobile.changePage($('#game'));
       });

    $('#sounds_option').change(
      function() {
        game.sounds_option = $(this).val();
      });

    $('#record_button').live('click',
      function() {
        refreshLocalStorage();
      });

    $('#single_player_button').click(
      function() {
        $('#name').val(window.localStorage.name);
        $('#name_field').show();
        $('#names_field').hide();
      });

    $('#two_players_button').click(
      function() {
        $('#name_1').val(window.localStorage.name_1);
        $('#name_2').val(window.localStorage.name_2);
        $('#names_field').show();
        $('#name_field').hide();
      });

    $('#start_button').unbind('click').click(
      function() {
        var name = $("input[name='name']:text").val();
        runGame();
        randomBackground();
        window.localStorage.setItem('name', name);
        $('#player_1_name').html(window.localStorage.getItem('name'));
        $('#name_field').hide();
      });

    $('#start_button_two').unbind('click').click(
      function() {
        var name_1 = $("input[name='name_1']:text").val();
        var name_2 = $("input[name='name_2']:text").val();
        runGame(2);
        randomBackground();
        window.localStorage.setItem('name_1', name_1);
        window.localStorage.setItem('name_2', name_2);
        $('#player_1_name').html(window.localStorage.getItem('name_1'));
        $('#player_2_name').html(window.localStorage.getItem('name_2'));
        $('#names_field').hide();
      });

    $('#name, #name_1, #name_2').focus(
      function() {
        $(this).val('');
      });

    // Avoid popup closing
    $("#pause_game").on({
      popupbeforeposition: function () {
        $('.ui-popup-screen').off();
      }
    });
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
