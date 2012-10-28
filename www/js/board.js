  var Board;

  Board = (function() {

    function Board(otherBoard) {
      var i;
      if (otherBoard == null) otherBoard = {};
      this.myBoard = [];
      i = 0;
      if (otherBoard.board !== void 0) {
        while (i < 8 * 8) {
          this.myBoard[i] = otherBoard.board[i];
          i++;
        }
      } else {
        while (i < 8 * 8) {
          this.myBoard[i] = 0;
          i++;
        }
      }
    }

    return Board;

  })();

  Board.prototype.getTypeAtPosition = function(position) {
    var index;
    index = position.toIndex();
    if ((0 <= index && index < 8 * 8)) {
      return this.myBoard[index];
    } else {
      return -1;
    }
  };

  Board.prototype.setTypeAtPosition = function(position, type) {
    var index;
    index = position.toIndex();
    if ((0 <= index && index < 8 * 8)) return this.myBoard[index] = type;
  };

  Board.prototype.copy = function() {
    return new Board({
      board: this.myBoard
    });
  };

  Board.prototype.clear = function() {
    var index, _results;
    index = 0;
    _results = [];
    while (index < 8 * 8) {
      this.myBoard[index] = 0;
      _results.push(index++);
    }
    return _results;
  };

  Board.prototype.toString = function() {
    var column, row, string, type;
    string = "<table>";
    string = "" + string + "<tr>";//<td></td>";
    column = 0;
    // while (column < 8) {
    //   string = "" + string + "<td>" + colName[column] + "</td>";
    //   column++;
    // }
    row = 0;
    while (row < 8) {
      //string = "" + string + "<tr><td>" + rowName[row] + "</td>";
      column = 0;
      while (column < 8) {
        type = this.getTypeAtPosition(new Position(row, column));
        switch (type) {
          case 1:
            string = "" + string + "<td><img src='../images/nera.png'></td>";
            break;
          case 2:
            string = "" + string + "<td><img src='../images/rossa.png'></td>";
            break;
          default:
            string = "" + string + "<td></td>";
        }
        column++;
      }
      row++;
    }
    string = "" + string + "<tr>";//<td></td>";
    return "" + string + "</table>";
  };

