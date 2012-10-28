var Position;

Position = (function() {

  function Position(row, column) {
    this.row = row;
    this.column = column;
  }

  Position.prototype.show = function() {
    return window.rowName[this.row] + window.colName[this.column];
  };

  Position.prototype.toIndex = function() {
    return this.row + 8 * this.column;
  };

  Position.prototype.move = function(direction) {
    var column, newColumn, newRow, row;
    row = this.row;
    column = this.column;
    switch (direction) {
      case 0:
        newRow = row + 1;
        newColumn = column;
        break;
      case 1:
        newRow = row + 1;
        newColumn = column + 1;
        break;
      case 2:
        newRow = row;
        newColumn = column + 1;
        break;
      case 3:
        newRow = row - 1;
        newColumn = column + 1;
        break;
      case 4:
        newRow = row - 1;
        newColumn = column;
        break;
      case 5:
        newRow = row - 1;
        newColumn = column - 1;
        break;
      case 6:
        newRow = row;
        newColumn = column - 1;
        break;
      case 7:
        newRow = row + 1;
        newColumn = column - 1;
        break;
      default:
        throw "Not valid direction";
    }
    if ((0 <= newRow && newRow <= 7) && (0 <= newColumn && newColumn <= 7)) {
      return new Position(newRow, newColumn);
    } else {
      return null;
    }
  };

  Position.prototype.getRow = function() {
    return this.row;
  };

  Position.prototype.getColumn = function() {
    return this.column;
  };

  return Position;

})();
