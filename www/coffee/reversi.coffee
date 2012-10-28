# jslint vars: true, white: true, plusplus: true, maxerr: 50, indent: 4

Reversi = -> 
  "use strict"

  passMove = ->
    that = {}

    that.isPassMove = ->
      true        
    that.isGameOver = -> 
      false        
    that.getPosition = ->
      null      
    that.show = -> 
      "Pass"
      
    that

  gameOverMove = ->
    that = {}

    that.isPassMove = -> 
      false
    that.isGameOver = ->
      true
    that.getPosition = ->
      null
    that.show = -> 
      "Game over"
    
    that

  positionMove = (position) ->
    that = {}
    movePosition = position
    
    that.isPassMove = ->
      false
    that.isGameOver = -> 
      false
    that.getPosition = ->
      movePosition
    that.show = -> 
      movePosition.show()
      
    that

  otherPlayer = (type) ->
    reverse = 2 if type is 1
    reverse = 1 if type is 2

  Reversi = (spec) ->
    spec = spec or {}

    if spec.board isnt undefined
      @b = spec.board.copy()
    else
      @b = new Board()
    
    @currentPlayer = spec.currentPlayer or 1

  Reversi::setup = ->
    @b = new Board()
    @b.setTypeAtPosition new Position(3, 3), 1
    @b.setTypeAtPosition new Position(4, 4), 1
    @b.setTypeAtPosition new Position(3, 4), 2
    @b.setTypeAtPosition new Position(4, 3), 2
    @currentPlayer = 1

  Reversi::getBoard = ->
    @b
  
  Reversi::getCurrentPlayer = -> 
    @currentPlayer
    
  Reversi::setCurrentPlayer = (player) -> 
    @currentPlayer = player

  getTurnedPieces = (board, position, type) ->
    otherColor = otherPlayer type
    turnList = []
    if board.getTypeAtPosition(position) isnt 0
      return turnList
    
    direction = 0
    
    while direction < 8
      newPosition = position.move direction
      
      continue if newPosition is null
      
      typeAtPosition = board.getTypeAtPosition newPosition
      possibleList = []
      
      while typeAtPosition is otherColor
        possibleList.push newPosition
        newPosition = newPosition.move direction
        
        break if newPosition is null
        
        typeAtPosition = board.getTypeAtPosition newPosition
        turnList = turnList.concat possibleList if typeAtPosition is type
        
      direction++
      
    turnList

  Reversi::makePassMove = ->
    allowedMoveList = @getLegalMoves()
    
    throw "Not allowed to pass when multiple possible moves exist" if allowedMoveList.length > 1

    throw "Pass move not allowed when game is over" if allowedMoveList[0].isGameOver()

    if allowedMoveList[0].isPassMove()
      @currentPlayer = otherPlayer @currentPlayer
    else
      throw "Not allowed to pass when possible move exists"

  Reversi::doMove = (move) ->
    newGame = new Reversi
      board: @b
      currentPlayer: @currentPlayer

    newGame.makeMove move

    newGame

  Reversi::makeMove = (positionMove) ->
    if positionMove.isPassMove()
      @makePassMove()
    else
      position = positionMove.getPosition()

      throw "Not a valid move" if position is null

      turnList = getTurnedPieces @b, position, @currentPlayer

      throw "Illegal move" if turnList.length is 0

      index = 0
      while index < turnList.length
        @b.setTypeAtPosition turnList[index], @currentPlayer
        index++
        
      @b.setTypeAtPosition position, @currentPlayer
      @currentPlayer = otherPlayer @currentPlayer

  findLegalMovesForPlayer = (player, b) ->
    legalMoves = []
    row = 0
    
    while row < 8
      column = 0

      while column < 8
        tryLocation = new Position row, column
        turnList = getTurnedPieces b, tryLocation, player
        legalMoves.push( positionMove tryLocation ) if turnList.length > 0
        column++
        
      row++
      
    legalMoves

  Reversi::getLegalMoves = ->
    # <summary>Find all legal moves where a piece is placed on board and turns opponent pieces
    # if None are found - see if other player has options
    # if both are unable to make a move the game is over
    # if opponent is able to move make a pass move</summary>
    legalMoves = findLegalMovesForPlayer @currentPlayer, @b

    # If no pieces may be placed player we have two cases
    # If other player has valid moves the current player may only make a pass move
    # If other player also has no valid moves the game has ended.
    otherPlayerLegalMoves = findLegalMovesForPlayer otherPlayer(@currentPlayer), @b if legalMoves.length is 0
      if otherPlayerLegalMoves.length is 0
        legalMoves.push gameOverMove()
      else
        legalMoves.push passMove()

    legalMoves

  Reversi::drawBoard = (location) ->
    tableAsHtml = b.toString()
    $(location).append tableAsHtml

  drawBoard = (game, clickEventHandler, passHandler) ->
    playerOneCount = 0
    playerTwoCount = 0
    board = game.getBoard()
    allowedMoves = game.getLegalMoves()
    table = $("<table>").addClass "board"
    row = ''#$("<tr>")
    #row.addClass 'col_header'
    #table.append row
    #row.append $("<td>")
    columnIndex = 0

    # while columnIndex < 8
    #   row.append $("<td>").append(colName[columnIndex])
    #   columnIndex++

    #row.append $("<td>").addClass('row_header')
    
    internalClickEventHandler = (event) ->
      r = event.data.row
      c = event.data.column
      clickEventHandler r, c

    rowIndex = 0

    while rowIndex < 8
      row = $("<tr>")#.append($("<td>").append(rowName[rowIndex]))
      columnIndex = 0

      while columnIndex < 8
        # Find type to draw
        type = board.getTypeAtPosition(new Position(rowIndex, columnIndex))
        sign = " "
        field = $("<td>")

        if type is 1
          playerOneCount = playerOneCount + 1
          field.addClass("p1").append "<div></div>"
          
        if type is 2
          playerTwoCount = playerTwoCount + 1
          field.addClass("p2").append "<div></div>"

        if type is 0
          movesIndex = 0
          while movesIndex < allowedMoves.length
            move = allowedMoves[movesIndex]
            if move.isPassMove() is false and move.isGameOver() is false
              location = move.getPosition()
              field.addClass "allowed"  if location.getRow() is rowIndex and location.getColumn() is columnIndex
              filed.addClass "p#{game.getCurrentPlayer}"
            movesIndex++
  
        # Draw field
        field.click { row: rowIndex, column: columnIndex }, internalClickEventHandler if type is 0

        row.append field
        columnIndex++

      #row.append $("<td>").append(rowName[rowIndex]).addClass('row_header')
      table.append row
      rowIndex++

    if allowedMoves.length is 1 and allowedMoves[0].isPassMove()
      $("#pass_button").removeAttr('disabled');
      $("#pass_button").click(passHandler);
  
    state = "Game over" if allowedMoves.length is 1 and allowedMoves[0].isGameOver()
    
    $('#player_1 .score').append(playerOneCount);
    $('#player_2 .score').append(playerTwoCount);
    
    table

    getBestMove = (game, positionEvaluator) ->
      moveList = game.getLegalMoves()
      bestScore = -1000
      bestIndex = -1
      playerSign = 1
        
      playerSign = -1 if game.getCurrentPlayer() is 2

      i = 0
      while i < moveList.length
        newGame = game.doMove moveList[i]
        newGameValue = positionEvaluator( newGame.getBoard() ) * playerSign
        
        if newGameValue > bestScore
          bestIndex = i
          bestScore = newGameValue
        
        i++
      moveList[bestIndex]

    minimax = (state, evaluationFunction, getActionsFunction, performActionFunction, ply, withPruning, maxPlayer) ->
      # <summary>Minimax with optional alpha-beta pruning
      # Arguments: 
      #   state - A state object send as first argument to
      #   evaluationFunction - Function returning a value given a state
      #   getActionsFunction - Function returning an array of allowed moves 
      #   performActionFunction - Function returning a new state when applying an action 
      #   ply - Number of moves to search
      #   withPruning - True/False whether to use alpha-beta pruning
      #   maxPlayer - Function that given a state specifies whether it should maximize or minimize.    
      # </summary>
      nodes = 0
      evaluations = 0
      withPruning = withPruning || false; # Run without pruning if not specified
      maxPlayer = maxPlayer || ( (x) ->
        true
      ) # Assume player 1

      # Test if we are at a leaf either because of search depth or because of end-of-game.	

      leaf = (state, ply) ->
        if ply is 0
          evaluations = evaluations + 1
          return value: evaluationFunction(state)

        actions = getActionsFunction(state)
        
        if actions.length is 0
          evaluations = evaluations + 1
          return value: evaluationFunction(state)

        actions: actions

      # Maximize over state
      maxValueFunction = (state, ply, alpha, beta) ->
        nodes = nodes + 1
        actions = leaf state, ply
        
        return value: actions.value, index: -1 if actions.value isnt undefined

        maxValue = -1e125
        maxIndex = -1
        actions = actions.actions
        actionIndex = 0
        
        while actionIndex < actions.length
          action = actions[actionIndex]
          newState = performActionFunction state, action
          min = minValueFunction newState, ply - 1, alpha, beta
          v = min.value
          
          if v > maxValue
            maxValue = v
            maxIndex = actionIndex

          break if v >= beta and withPruning

          alpha = (if v > alpha then v else alpha)
          actionIndex++

        value: maxValue, index: maxIndex, move: actions[maxIndex]

      # Minimize over state
      minValueFunction = (state, ply, alpha, beta) ->
        nodes = nodes + 1
        actions = leaf state, ply
        
        return value: actions.value, index: -1 if actions.value isnt undefined

        minValue = 1e125
        minIndex = -1
        actions = actions.actions

        actionIndex = 0
        while actionIndex < actions.length
          action = actions[actionIndex]
          newState = performActionFunction state, action
          max = maxValueFunction newState, ply - 1, alpha, beta
          v = max.value
          if minValue > v
            minValue = v
            minIndex = actionIndex

          break if v <= alpha and withPruning

          beta = (if v < beta then v else beta)
          actionIndex++
        value: minValue, index: minIndex, move: actions[minIndex]

      if maxPlayer(state)
        m = maxValueFunction state, ply, -1e125, 1e125
      else
        m = minValueFunction state, ply, -1e125, 1e125

      move: m.move, value: m.value, visited: nodes, evaluations: evaluations

    # Adapt the reversi game for the minimax function
    getBestMoveMinimax = (game, positionEvaluator, ply) ->
      evaluate = (game) ->
        positionEvaluator game.getBoard()

      getActions = (game) ->
        game.getLegalMoves()

      doAction = (game, action) ->
        newGame = game.doMove action
        newGame

      doMax = (game) ->
        game.getCurrentPlayer() is 1

      move = minimax game, evaluate, getActions, doAction, ply, true, doMax
      move.move

    simpleEvaluator = (board) ->
      # <summary>Evaluate the board as a simple piece count</summary>
      value = 0
      row = 0

      while row < 8
        column = 0

        while column < 8
          type = board.getTypeAtPosition new Position(row, column)
          value++ if type is 1
          value-- if type is 2
          column++

        row++

      value

    runGame = ->
      # <summary>Run the game</summary>
      game = new Reversi()
      game.setup()

      addMoveToList = (player, move) ->
        $("#movelist").append "<span class='player#{player}'>Player #{player} made move #{move.show()}</span><br/>"
        current = $("#output").val()

        if current.toString().trim().length is 0
          $("#output").val move.show()
        else
          $("#output").val "#{current}: #{move.show()}"

      opponentMove = ->
        # <summary>Make a computer move</summary>
        # <returns type="">Returns the opponent move</returns>
        moves = game.getLegalMoves()
        if moves.length is 1 and moves[0].isGameOver()
          return moves[0]
        else
          maxIndex = moves.length
          #type = $("#cputype").val()
          type = 'simplebest'
          
          switch type
            when "first"
              bestMove = moves[0]
            when "last"
              bestMove = moves[maxIndex - 1]
            when "random"
              randomIndex = Math.floor Math.random() * maxIndex
              bestMove = moves[randomIndex]
            when "simplebest"
              bestMove = getBestMove game, simpleEvaluator
            else
              bestMove = getBestMoveMinimax game, simpleEvaluator, 4

          addMoveToList game.getCurrentPlayer(), bestMove
          game.makeMove bestMove
          bestMove

      drawBoardWithEventHandlers = ->
        board = drawBoard game, eventHandler, passHandler
        $("#board").html board

      passHandler = ->
        try
          move = passMove()
          addMoveToList game.getCurrentPlayer(), move
          game.makeMove move
        catch err
          window.alert err
          return

        opponentMove()
        drawBoardWithEventHandlers()

      # Push the error in case of illegal moves
      eventHandler = (row, column) ->
        try
          move = positionMove new Position(row, column)
          addMoveToList game.getCurrentPlayer(), move
          game.makeMove move
        catch err
          #window.alert err
          return

        opponentMove()
        drawBoardWithEventHandlers()

      $("#replay").click ->
        data =  $("#input").val()
        parts = data.split(":")
        mymove = parts[0]
        opponent = parts[1]
        remaining = parts.slice(2, parts.length).join(":")

        if mymove.length is 2
          row = parseInt mymove[0]
          column = mymove.charCodeAt(1) - "A".charCodeAt(0) + 1
          move = positionMove new Position(row - 1, column - 1)
        else if mymove is "Pass"
          move = passMove()

        addMoveToList game.getCurrentPlayer(), move
        game.makeMove move
        actualOpponentMove = opponentMove()

        # TODO: Verify that the move is the same (we assume deterministic move evaluation)

        # Redraw
        $("#input").val remaining
        drawBoardWithEventHandlers()

      drawBoardWithEventHandlers()

    Position: Position
    gameOverMove: gameOverMove
    positionMove: positionMove
    passMove: passMove
    Board: Board
    Reversi: Reversi
    getTurnedPieces: getTurnedPieces
    drawBoard: drawBoard
    getBestMove: getBestMove
    getBestMoveMinimax: getBestMoveMinimax
    simpleEvaluator: simpleEvaluator
    runGame: runGame
    minimax: minimax
