class Board
  constructor: (otherBoard = {} ) ->
    
    @myBoard = []
    #otherBoard = otherBoard or {}
    i = 0
    
    if otherBoard.board isnt undefined
      while i < 8 * 8
        @myBoard[i] = otherBoard.board[i]
        i++
    else
      while i < 8 * 8
        @myBoard[i] = 0
        i++

Board::getTypeAtPosition = (position) ->
  # Return type at position
  index = position.toIndex()
  if 0 <= index < 8 * 8
    @myBoard[index]
  else
    -1
    
Board::setTypeAtPosition = (position, type) ->
  index = position.toIndex()
  if 0 <= index < 8 * 8
    @myBoard[index] = type
      
Board::copy = ->
  # Make copy of board
  new Board board: @myBoard

Board::clear = ->
  # Clear the board
  index = 0
  while index < 8 * 8
    @myBoard[index] = 0
    i++
     
Board::toString = ->
  string = "<table border='1px'>"
  string = "#{string}<tr>"#<td></td>"

  # Column names
  column = 0
  # while column < 8
  #   string = "#{string}<td>#{colName[column]}</td>"
  #   column++

  # All rows
  row = 0
  while row < 8
    #string = "#{string}<tr><td>#{rowName[row]}</td>"
    
    # All columns in a row
    column = 0
    while column < 8
      type = @getTypeAtPosition new Position(row, column)
      
      switch type
        when 1
          string = "#{string}<td><img src='../images/nera.png'></td>"
        when 2
          string = "#{string}<td><img src='../images/rossa.png'></td>"
        else
          string = "#{string}<td></td>"
      
      column++
              
    row++
      
  string = "#{string}<tr>"#<td></td>"
  
  "#{string}</table>"