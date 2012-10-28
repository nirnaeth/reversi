class Position
  constructor: (row, column) ->
    # <summary>Create position object</summary>
    # <param name="row">0 based row</param>
    # <param name="column">0 based column</param>
    @row = row
    @column = column

  show: ->
    # <summary>Show position as chess board position</summary>
    window.rowName[@row] + window.colName[@column]

  toIndex: ->
    # <summary>Compute index into array for row and column</summary>
    @row + 8 * @column

  move: (direction) ->
    # <summary>Compute a position from the current given a direction. If possition is illegial null is returned. </summary>
    row = @row
    column = @column
  
    switch direction
      when 0
        newRow = row + 1
        newColumn = column
      when 1
        newRow = row + 1
        newColumn = column + 1
      when 2
        newRow = row
        newColumn = column + 1
      when 3
        newRow = row - 1
        newColumn = column + 1
      when 4
        newRow = row - 1
        newColumn = column
      when 5
        newRow = row - 1
        newColumn = column - 1
      when 6
        newRow = row
        newColumn = column - 1
      when 7
        newRow = row + 1
        newColumn = column - 1
      else
        throw "Not valid direction"

    if 0 <= newRow <= 7 && 0 <= newColumn <= 7
      new Position(newRow, newColumn)
    else
      return null

  getRow: ->
    @row

  getColumn: ->
    @column
    # 
    # tion = (row, column) ->
    # <summary>Create position object</summary>
    # <param name="row">0 based row</param>
    # <param name="column">0 based column</param>
    # ow = row
    # olumn = column
    # 
    # tion::show = ->
    # <summary>Show position as chess board position</summary>
    # ndow.rowName[@row] + window.colName[@column]
    # 
    # tion::toIndex = ->
    # <summary>Compute index into array for row and column</summary>
    # ow + 8 * @column
    # 
    # tion::move = (direction) ->
    # <summary>Compute a position from the current given a direction. If possition is illegial null is returned. </summary>
    # w = @row
    # lumn = @column
    # 
    # itch direction
    # when 0
    #   newRow = row + 1
    #   newColumn = column
    # when 1
    #   newRow = row + 1
    #   newColumn = column + 1
    # when 2
    #   newRow = row
    #   newColumn = column + 1
    # when 3
    #   newRow = row - 1
    #   newColumn = column + 1
    # when 4
    #   newRow = row - 1
    #   newColumn = column
    # when 5
    #   newRow = row - 1
    #   newColumn = column - 1
    # when 6
    #   newRow = row
    #   newColumn = column - 1
    # when 7
    #   newRow = row + 1
    #   newColumn = column - 1
    # else
    #   throw "Not valid direction"
    # 
    #  0 <= newRow <= 7 && 0 <= newColumn <= 7
    # new Position(newRow, newColumn)
    # se
    # return null
    # 
    # tion::getRow = ->
    # ow
    # 
    # tion::getColumn = ->
    # olumn