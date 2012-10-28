
  var Game, Reversi, drawBoard, findLegalMovesForPlayer, gameOverMove, getTurnedPieces, otherPlayer, passMove, positionMove;

  Game = (function() {

    function Game() {
      this.reversi = new Reversi();
    }

    Game.prototype.run = function() {
      return this.reversi.setup();
    };

    Game.prototype.addMoveToList = function(player, move) {
      var current;
      $("#movelist").append("<span class='player" + player + "'>Player " + player + " made move " + (move.show()) + "</span><br/>");
      current = $("#output").val();
      if (current.toString().trim().length === 0) {
        return $("#output").val(move.show());
      } else {
        return $("#output").val("" + current + ": " + (move.show()));
      }
    };

    Game.prototype.opponentMove = function() {
      var bestMove, maxIndex, moves, randomIndex, type;
      moves = this.reversi.getLegalMoves();
      if (moves.length === 1 && moves[0].isGameOver()) {
        return moves[0];
      } else {
        maxIndex = moves.length;
        type = $("#cputype").val();
        switch (type) {
          case "first":
            bestMove = moves[0];
            break;
          case "last":
            bestMove = moves[maxIndex - 1];
            break;
          case "random":
            randomIndex = Math.floor(Math.random() * maxIndex);
            bestMove = moves[randomIndex];
            break;
          case "simplebest":
            bestMove = getBestMove(this.reversi, simpleEvaluator);
            break;
          default:
            bestMove = getBestMoveMinimax(this.reversi, simpleEvaluator, 4);
        }
        addMoveToList(this.reversi.getCurrentPlayer(), bestMove);
        this.reversi.makeMove(bestMove);
        return bestMove;
      }
    };

    Game.prototype.drawBoardWithEventHandlers = function() {
      var board;
      board = drawBoard(this.reversi, this.eventHandler, this.passHandler);
      return $("#board").html(board);
    };

    Game.prototype.passHandler = function() {
      var move;
      try {
        move = passMove();
        addMoveToList(this.reversi.getCurrentPlayer(), move);
        this.reversi.makeMove(move);
      } catch (err) {
        window.alert(err);
        return;
      }
      opponentMove();
      return this.drawBoardWithEventHandlers();
    };

    // Push the error in case of illegal moves
    Game.prototype.eventHandler = function(row, column) {
      var move;
      try {
        move = positionMove(new Position(row, column));
        addMoveToList(this.reversi.getCurrentPlayer(), move);
        this.reversi.makeMove(move);
      } catch (err) {
        //window.alert(err);
        return;
      }
      opponentMove();
      return this.drawBoardWithEventHandlers();
    };

    $("#replay").click(function() {
      var actualOpponentMove, column, data, move, mymove, opponent, parts, remaining, row;
      data = $("#input").val();
      parts = data.split(":");
      mymove = parts[0];
      opponent = parts[1];
      remaining = parts.slice(2, parts.length).join(":");
      if (mymove.length === 2) {
        row = parseInt(mymove[0]);
        column = mymove.charCodeAt(1) - "A".charCodeAt(0) + 1;
        move = positionMove(new Position(row - 1, column - 1));
      } else if (mymove === "Pass") {
        move = passMove();
      }
      addMoveToList(this.reversi.getCurrentPlayer(), move);
      this.reversi.makeMove(move);
      actualOpponentMove = opponentMove();
      $("#input").val(remaining);
      this.drawBoardWithEventHandlers();
      return this.drawBoardWithEventHandlers();
    });

    return Game;

  })();

  "use strict";

  passMove = function() {
    var that;
    that = {};
    that.isPassMove = function() {
      return true;
    };
    that.isGameOver = function() {
      return false;
    };
    that.getPosition = function() {
      return null;
    };
    that.show = function() {
      return "Pass";
    };
    return that;
  };

  gameOverMove = function() {
    var that;
    that = {};
    that.isPassMove = function() {
      return false;
    };
    that.isGameOver = function() {
      return true;
    };
    that.getPosition = function() {
      return null;
    };
    that.show = function() {
      return "Game over";
    };
    return that;
  };

  positionMove = function(position) {
    var movePosition, that;
    that = {};
    movePosition = position;
    that.isPassMove = function() {
      return false;
    };
    that.isGameOver = function() {
      return false;
    };
    that.getPosition = function() {
      return movePosition;
    };
    that.show = function() {
      return movePosition.show();
    };
    return that;
  };

  otherPlayer = function(type) {
    var reverse;
    if (type === 1) reverse = 2;
    if (type === 2) reverse = 1;
    return reverse;
  };

  Reversi = function(spec) {
    if (spec == null) spec = {};
    if (spec.board !== void 0) {
      this.b = spec.board.copy();
    } else {
      this.b = new Board();
    }
    return this.currentPlayer = spec.currentPlayer || 1;
  };

  Reversi.prototype.setup = function() {
    this.b = new Board();
    this.b.setTypeAtPosition(new Position(3, 3), 1);
    this.b.setTypeAtPosition(new Position(4, 4), 1);
    this.b.setTypeAtPosition(new Position(3, 4), 2);
    this.b.setTypeAtPosition(new Position(4, 3), 2);
    return this.currentPlayer = 1;
  };

  Reversi.prototype.getBoard = function() {
    return this.b;
  };

  Reversi.prototype.getCurrentPlayer = function() {
    return this.currentPlayer;
  };

  Reversi.prototype.setCurrentPlayer = function(player) {
    return this.currentPlayer = player;
  };

  getTurnedPieces = function(board, position, type) {
    var direction, newPosition, otherColor, possibleList, turnList, typeAtPosition;
    otherColor = otherPlayer(type);
    turnList = [];
    if (board.getTypeAtPosition(position) !== 0) return turnList;
    direction = 0;
    while (direction < 8) {
      newPosition = position.move(direction);
      if (newPosition === null) continue;
      typeAtPosition = board.getTypeAtPosition(newPosition);
      possibleList = [];
      while (typeAtPosition === otherColor) {
        possibleList.push(newPosition);
        newPosition = newPosition.move(direction);
        if (newPosition === null) break;
        typeAtPosition = board.getTypeAtPosition(newPosition);
        if (typeAtPosition === type) turnList = turnList.concat(possibleList);
      }
      direction++;
    }
    return turnList;
  };

  Reversi.prototype.makePassMove = function() {
    var allowedMoveList;
    allowedMoveList = this.getLegalMoves();
    if (allowedMoveList.length > 1) {
      throw "Not allowed to pass when multiple possible moves exist";
    }
    if (allowedMoveList[0].isGameOver()) {
      throw "Pass move not allowed when @reversi is over";
    }
    if (allowedMoveList[0].isPassMove()) {
      return this.currentPlayer = otherPlayer(this.currentPlayer);
    } else {
      throw "Not allowed to pass when possible move exists";
    }
  };

  Reversi.prototype.doMove = function(move) {
    var newGame;
    newGame = new Reversi({
      board: this.b,
      currentPlayer: this.currentPlayer
    });
    newGame.makeMove(move);
    return newGame;
  };

  Reversi.prototype.makeMove = function(positionMove) {
    var index, position, turnList;
    if (positionMove.isPassMove()) {
      return this.makePassMove();
    } else {
      position = positionMove.getPosition();
      if (position === null) throw "Not a valid move";
      turnList = getTurnedPieces(this.b, position, this.currentPlayer);
      //if (turnList.length === 0) throw "Illegal move";
      index = 0;
      while (index < turnList.length) {
        this.b.setTypeAtPosition(turnList[index], this.currentPlayer);
        index++;
      }
      this.b.setTypeAtPosition(position, this.currentPlayer);
      return this.currentPlayer = otherPlayer(this.currentPlayer);
    }
  };

  findLegalMovesForPlayer = function(player, b) {
    var column, legalMoves, row, tryLocation, turnList;
    legalMoves = [];
    row = 0;
    while (row < 8) {
      column = 0;
      while (column < 8) {
        tryLocation = new Position(row, column);
        turnList = getTurnedPieces(b, tryLocation, player);
        if (turnList.length > 0) legalMoves.push(positionMove(tryLocation));
        column++;
      }
      row++;
    }
    return legalMoves;
  };

  Reversi.prototype.getLegalMoves = function() {
    var legalMoves, otherPlayerLegalMoves;
    legalMoves = findLegalMovesForPlayer(this.currentPlayer, this.b);
    otherPlayerLegalMoves = findLegalMovesForPlayer(otherPlayer(this.currentPlayer), this.b(legalMoves.length === 0 ? otherPlayerLegalMoves.length === 0 ? legalMoves.push(gameOverMove()) : legalMoves.push(passMove()) : void 0));
    return legalMoves;
  };

  Reversi.prototype.drawBoard = function(location) {
    var tableAsHtml;
    tableAsHtml = b.toString();
    return $(location).append(tableAsHtml);
  };

  drawBoard = function(reversi, clickEventHandler, passHandler) {
    var allowedMoves, board, columnIndex, field, getBestMove, getBestMoveMinimax, internalClickEventHandler, location, minimax, move, movesIndex, passButton, playerOneCount, playerTwoCount, row, rowIndex, sign, simpleEvaluator, state, table, type;
    this.reversi = reversi;
    playerOneCount = 0;
    playerTwoCount = 0;
    board = this.reversi.getBoard();
    allowedMoves = this.reversi.getLegalMoves();
    table = $("<table>").addClass("board");
    row = '';
    columnIndex = 0;
    internalClickEventHandler = function(event) {
      var c, r;
      r = event.data.row;
      c = event.data.column;
      return clickEventHandler(r, c);
    };
    rowIndex = 0;
    while (rowIndex < 8) {
      row = $("<tr>");
      columnIndex = 0;
      while (columnIndex < 8) {
        type = board.getTypeAtPosition(new Position(rowIndex, columnIndex));
        sign = " ";
        field = $("<td>");
        if (type === 1) {
          playerOneCount = playerOneCount + 1;
          field.addClass("p1");
        }
        if (type === 2) {
          playerTwoCount = playerTwoCount + 1;
          field.addClass("p2");
        }
        if (type === 0) {
          movesIndex = 0;
          while (movesIndex < allowedMoves.length) {
            move = allowedMoves[movesIndex];
            if (move.isPassMove() === false && move.isGameOver() === false) {
              location = move.getPosition();
              if (location.getRow() === rowIndex && location.getColumn() === columnIndex) {
                field.addClass("allowed");
              }
              filed.addClass("p" + this.reversi.getCurrentPlayer);
            }
            movesIndex++;
          }
        }
        if (type === 0) {
          field.click({
            row: rowIndex,
            column: columnIndex
          }, internalClickEventHandler);
        }
        row.append(field);
        columnIndex++;
      }
      table.append(row);
      rowIndex++;
    }
    passButton = "";
    if (allowedMoves.length === 1 && allowedMoves[0].isPassMove()) {
      passButton = $("<button>Pass</button>").click(passHandler);
    }
    row = $("<tr>").append($("<td>").attr("colspan", "10").append(passButton));
    table.append(row);
    state = "";
    if (allowedMoves.length === 1 && allowedMoves[0].isGameOver()) {
      state = "Game over";
    }
    row = $("<tr>");
    row.append($("<td>").attr("colspan", "3").addClass("p1").append("Player 1")).append($("<td>").addClass("p1").append(playerOneCount));
    row.append($("<td>").attr("colspan", "2").append(state));
    row.append($("<td>").addClass("p2").append(playerTwoCount)).append($("<td>").attr("colspan", "3").addClass("p2").append("Player 2"));
    table.append(row);
    table;
    
    getBestMove = function(reversi, positionEvaluator) {
      var bestIndex, bestScore, i, moveList, newGame, newGameValue, playerSign;
      this.reversi = reversi;
      moveList = this.reversi.getLegalMoves();
      bestScore = -1000;
      bestIndex = -1;
      playerSign = 1;
      if (this.reversi.getCurrentPlayer() === 2) playerSign = -1;
      i = 0;
      while (i < moveList.length) {
        newGame = this.reversi.doMove(moveList[i]);
        newGameValue = positionEvaluator(newGame.getBoard()) * playerSign;
        if (newGameValue > bestScore) {
          bestIndex = i;
          bestScore = newGameValue;
        }
        i++;
      }
      return moveList[bestIndex];
    };
    
    minimax = function(state, evaluationFunction, getActionsFunction, performActionFunction, ply, withPruning, maxPlayer) {
      var evaluations, leaf, m, maxValueFunction, minValueFunction, nodes;
      nodes = 0;
      evaluations = 0;
      withPruning = withPruning || false;
      maxPlayer = maxPlayer || (function(x) {
        return true;
      });
      leaf = function(state, ply) {
        var actions;
        if (ply === 0) {
          evaluations = evaluations + 1;
          return {
            value: evaluationFunction(state)
          };
        }
        actions = getActionsFunction(state);
        if (actions.length === 0) {
          evaluations = evaluations + 1;
          return {
            value: evaluationFunction(state)
          };
        }
        return {
          actions: actions
        };
      };
      maxValueFunction = function(state, ply, alpha, beta) {
        var action, actionIndex, actions, maxIndex, maxValue, min, newState, v;
        nodes = nodes + 1;
        actions = leaf(state, ply);
        if (actions.value !== void 0) {
          return {
            value: actions.value,
            index: -1
          };
        }
        maxValue = -1e125;
        maxIndex = -1;
        actions = actions.actions;
        actionIndex = 0;
        while (actionIndex < actions.length) {
          action = actions[actionIndex];
          newState = performActionFunction(state, action);
          min = minValueFunction(newState, ply - 1, alpha, beta);
          v = min.value;
          if (v > maxValue) {
            maxValue = v;
            maxIndex = actionIndex;
          }
          if (v >= beta && withPruning) break;
          alpha = (v > alpha ? v : alpha);
          actionIndex++;
        }
        return {
          value: maxValue,
          index: maxIndex,
          move: actions[maxIndex]
        };
      };
      minValueFunction = function(state, ply, alpha, beta) {
        var action, actionIndex, actions, max, minIndex, minValue, newState, v;
        nodes = nodes + 1;
        actions = leaf(state, ply);
        if (actions.value !== void 0) {
          return {
            value: actions.value,
            index: -1
          };
        }
        minValue = 1e125;
        minIndex = -1;
        actions = actions.actions;
        actionIndex = 0;
        while (actionIndex < actions.length) {
          action = actions[actionIndex];
          newState = performActionFunction(state, action);
          max = maxValueFunction(newState, ply - 1, alpha, beta);
          v = max.value;
          if (minValue > v) {
            minValue = v;
            minIndex = actionIndex;
          }
          if (v <= alpha && withPruning) break;
          beta = (v < beta ? v : beta);
          actionIndex++;
        }
        return {
          value: minValue,
          index: minIndex,
          move: actions[minIndex]
        };
      };
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
    getBestMoveMinimax = function(reversi, positionEvaluator, ply) {
      var doAction, doMax, evaluate, getActions;
      this.reversi = reversi;
      evaluate = function(reversi) {
        this.reversi = reversi;
        return positionEvaluator(this.reversi.getBoard());
      };
      getActions = function(reversi) {
        this.reversi = reversi;
        return this.reversi.getLegalMoves();
      };
      doAction = function(reversi, action) {
        var newGame;
        this.reversi = reversi;
        newGame = this.reversi.doMove(action);
        return newGame;
      };
      doMax = function(reversi) {
        this.reversi = reversi;
        return this.reversi.getCurrentPlayer() === 1;
      };
      move = minimax(this.reversi, evaluate, getActions, doAction, ply, true, doMax);
      return move.move;
    };
    simpleEvaluator = function(board) {
      var column, value;
      value = 0;
      row = 0;
      while (row < 8) {
        column = 0;
        while (column < 8) {
          type = board.getTypeAtPosition(new Position(row, column));
          if (type === 1) value++;
          if (type === 2) value--;
          column++;
        }
        row++;
      }
      return value;
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


