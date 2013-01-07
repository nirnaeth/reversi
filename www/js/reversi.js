/*jslint vars: true, white: true, plusplus: true, maxerr: 50, indent: 4 */
$(document).bind('storage', function (e) {
  refreshLocalStorage();
  e.preventDefault;
});

var Reversi = function () {
  "use strict";
  var soundtrack = new Audio("sounds/soundtrack.mp3");
  
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
    
    if (window.localStorage.name == undefined || window.localStorage.name == '') {
      window.localStorage.name = 'Giocatore 1';
    }
    
    $('#options form #name').val(window.localStorage.name);
    this.currentPlayer = spec.currentPlayer || 1;
  };

  Reversi.prototype.setup = function () {
    this.b = new Board();
    this.b.setTypeAtPosition(new Position(3, 3), 1);
    this.b.setTypeAtPosition(new Position(4, 4), 1);
    this.b.setTypeAtPosition(new Position(3, 4), 2);
    this.b.setTypeAtPosition(new Position(4, 3), 2);
    this.currentPlayer = 1;
    this.sounds_option = 'on';
    this.music_option = 'on';
  };
  
  Reversi.prototype.playSound = function(path) {
    if (this.sounds_option === 'on') {
      var audio = new Audio(path);
      if (this.music_option === 'on') {
        soundtrack.pause();
      }
      audio.play();
      if (this.music_option === 'on') {
        soundtrack.play();
      }
    }
  }

  Reversi.prototype.slideMenu = function(selector, direction, delay) {
    var menu = $(selector);
    var left_base_value = -10;
    var sliding_width = menu.outerWidth() + 90;
    if (direction !== 'right') {
      sliding_width = -sliding_width;
    } else {
      sliding_width = sliding_width - left_base_value;
    }
    
    if (delay) {
      menu.delay(delay).animate({ left: parseInt(menu.css('left')) == left_base_value ? sliding_width : left_base_value });
    } else {
      menu.animate({ left: parseInt(menu.css('left')) == left_base_value ? sliding_width : left_base_value });
    }
    
    this.playSound('sounds/slide_menu.mp3');
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
      chart.forEach(function(item) {            
        var position = '<li>' + item.name + ' - ' + item.score.me + ' a ' + item.score.opponent + '</li>'
        $('#record ol').append(position);
      });
    }
    
    $('#player_1_name').html(window.localStorage.getItem('name'));
  };


  var updateChart = function(my_score, opponent_score) {
    var obj = {
      'name' : window.localStorage.name,
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
    
    while(chart.length > 2) {
      console.log(chart);
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
      var result_string = 'Hai vinto!';
      var result = 'win';
      
      if (playerOneCount < playerTwoCount) { 
        result_string = 'Hai perso :('; 
        result = 'lose'; 
      } else {
        updateChart(playerOneCount, playerTwoCount);
      }
      
      $(selector).append(result_string);
      $(selector).append('<br />' + playerOneCount + ' - ' + playerTwoCount);
      
      $.mobile.changePage($('#end_game'));
      game.playSound("sounds/" + result + ".mp3");
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
    
    if (game.music_option === 'on') {
      soundtrack.loop = true;
      soundtrack.play();
    }

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
    
    // Menu effects
    // $('#play_button, #resume_button').click(function() {
    //   $('#pause_button').removeClass('button_disabled');
    // });
    
    // $('#resume_button').click(function() {
    //   $('#pause_button').removeClass('button_disabled');
    // });
    // 
    // $('#pause_button').click(function() {
    //   $(this).addClass('button_disabled');
    // });
    
    $("#replay_button").click(
       function () {
         runGame();
         $.mobile.changePage($('#game'));
       });
    
    $('#sounds_option input').click(
      function() {
        game.sounds_option = $(this).val();
      });

    $('#music_option input').click(
      function() {
        game.music_option = $(this).val();
        game.music_option === 'on' ? soundtrack.play() : soundtrack.pause();
      });
    
    $('#options #back_button').click(
      function() {
        var name = $("input[name='name']:text").val();
        window.localStorage.name = name;
        $('#player_1_name').html(window.localStorage.getItem('name'));
      });
    
    $('#record_button').live('click',
      function() {
        refreshLocalStorage();
      });
          
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
