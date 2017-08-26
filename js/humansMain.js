var play_2pp = function(){ //   var makeGameBoard = App.makeGameBoard();
  $('body').addClass('noselect') //prevent highlighting of pieces
  var chessLetters = ['a','b','c','d','e','f','g','h'];
  var colors = ['white', 'black'];
  var timed1 = $('.timed1').prop('checked');
  var horde = $('.playHorde1').prop('checked');
  var peasants = $('.playPeasants1').prop('checked');
  console.log('horde:', horde);
  var chess960 = $('.play960').prop('checked');
  console.log(chess960);
  function search(name, array){
    for (var i=0; i < array.length; i++) {
      if (array[i].type === name) {
          return array[i];
      }
    }
  }

  function searchLocation(name, array){
    for (var i=0; i < array.length; i++) {
      if (array[i].location === name) {
          return array[i];
      }
    }
  }

//Generate the checker patterned gameboard with each square having an ID corresponding to its classical chess spot (a1 through h8).
function makeBoard(){
  var even = false;
  for (var i = 8; i > 0; i--) {
    $('#gameBoard').append(`<div class="row row-${i}">`);
    for (var j = 0; j < 8; j++) {
        if(even) {
          $(`.row-${i}`).append(`
          <div class="gray square" id="${chessLetters[j]}${i}">
            <p>
          </div>
          `)
        }
        else {
          $(`.row-${i}`).append(`
          <div class="white square" id="${chessLetters[j]}${i}">
            <p>
          </div>
          `)
        };
      even = !even;
    };
    even = !even;
  };
}

//Fill in the board with the starting chess pieces.
function makePieces() {
  $('#a8 p, #h8 p').html('&#9820');
  $('#b8 p, #g8 p').html('&#9822');
  $('#c8 p, #f8 p').html('&#9821');
  $('#d8 p').html('&#9819');
  $('#e8 p').html('&#9818');
  for (var i = 0; i < 8; i++){
      $(`#${chessLetters[i]}7 p`).html('&#9823');
  }
  $('#a1 p, #h1 p').html('&#9814');
  $('#b1 p, #g1 p').html('&#9816');
  $('#c1 p, #f1 p').html('&#9815');
  $('#d1 p').html('&#9813');
  $('#e1 p').html('&#9812');
  for (var i = 0; i < 8; i++){
      $(`#${chessLetters[i]}2 p`).html('&#9817');
  }
}

game = {
  // gameBoard: ['a1','a2','a3','a4','a5','a6','a7','a8','b1','b2','b3','b4','b5','b6','b7','b8','c1','c2','c3','c4','c5','c6','c7','c8','d1','d2','d3','d4','d5','d6','d7','d8','e1','e2','e3','e4','e5','e6','e7','e8','f1','f2','f3','f4','f5','f6','f7','f8','g1','g2','g3','g4','g5','g6','g7','g8','h1','h2','h3','h4','h5','h6','h7','h8'],
  'whitePieces': [],
  'blackPieces': [],
  pieceSelected: false,
  squareSelected: false,
  targetSquare: false,
  pieceFound: false,
  pieceStorage: false,
  inCheck: false,
  turn: 'white',
  goesFirst: 0,
  whiteKingLocation: '',
  blackKingLocation: '',
  enPassant: [],
  previousMove: [],
  aiCalculating: false,
  whiteScore: 0,
  blackScore: 0,
  whiteClock: {
    count: 0,
    seconds: 01,
    minutes: 60,
    mins: '',
    secs: '',
    t: '',
    updateClock: function(){
      $('#whiteClock').text(`${this.mins}${this.secs}`)
    },
    startClock: function(){
      this.seconds--;
      if (this.seconds === 0) {
        if(this.minutes === 0) {
          this.gameEndHandler('whiteOutOfTime')
        }
        this.seconds = 59;
        this.minutes--;
      }
      this.mins = (this.minutes < 10) ? ('0' + this.minutes + ':') : (this.minutes + ':');
      this.secs = (this.seconds < 10) ? ('0' + this.seconds) : (this.seconds);
      game.whiteClock.updateClock();
    },
    timer: function(){
      game.whiteClock.startClock();
      game.whiteClock.t = setTimeout(game.whiteClock.timer, 1000)
    },
    pauseClock: function(){
      clearTimeout(game.whiteClock.t);
    }

    // $('#start').on('click', timer);
    // $('#pause').on('click', function(){clearTimeout(t)});

  },
  blackClock: {
    count: 0,
    seconds: 01,
    minutes: 60,
    mins: '',
    secs: '',
    t: '',
    updateClock: function(){
      $('#blackClock').text(`${this.mins}${this.secs}`)
    },
    startClock: function(){
      this.seconds--;
      if (this.seconds === 0) {
        if(this.minutes === 0) {
          this.gameEndHandler('blackOutOfTime')
        }
        this.seconds = 59;
        this.minutes--;
      }
      this.mins = (this.minutes < 10) ? ('0' + this.minutes + ':') : (this.minutes + ':');
      this.secs = (this.seconds < 10) ? ('0' + this.seconds) : (this.seconds);
      game.blackClock.updateClock();
    },
    timer: function(){
      game.blackClock.startClock();
      game.blackClock.t = setTimeout(game.blackClock.timer, 1000)
    },
    pauseClock: function(){
      clearTimeout(game.blackClock.t);
    }

    // $('#start').on('click', timer);
    // $('#pause').on('click', function(){clearTimeout(t)});

  },
  changeTurn: function(){
    if(colors.indexOf(this.turn) > 0)
      this.turn = 'white'
      else this.turn = 'black';
  },
  otherColor: function(){
    if(this.turn === 'white')
      return 'black';
    else return 'white';
  },

  //This function essentially handles the game direction and acts as the UI
  squareClicked: function(){
    this.unhighlightPreviousMove();
    if(!this.pieceSelected){
      // console.log("calling checkforPieces");
      if(game.checkForPiece(game.squareSelected, game.turn)){
        // console.log('found Piece');
        this.pieceSelected = this.pieceFound;
        this.highlightSelectedPiece();
        if(this.pieceSelected.findPossibleMoves()){
          squareSelected = false;
          // console.log('running');
          this.highlightMoves();
        }
        else {
          pieceSelected = false;
          return false;
        }
      }
      else {
        squareSelected = false;
        return false;
      }
    }
    //This runs if a piece has already been selected.
    else {
      //Deselect selected piece.
      if (game.squareSelected === this.pieceSelected.location){
        this.unHighlightMoves();
        this.unHighlightSelectedPiece();
        game.pieceSelected = false;
        game.squareSelected = false;
        return false;
      }
      //Check the selected piece's moves to see if square selected is possible.
      if (this.isLegalMove()) {
        if(this.turn === 'black'){
          if(timed1){
            this.whiteClock.timer();
            this.blackClock.pauseClock();
          }
        }
        else if (timed1) {
          this.whiteClock.pauseClock();
          this.blackClock.timer();
        }
        this.makeMove();
        this.pawnPromotion();
        this.checkForCheck();
        this.pieceSelected = false
        if(this.inCheck){
          if(this.checkForCheckMate()){
            var winner = this.otherColor() + "Wins";
            this.gameEndHandler(winner);
          }

        }
        else if (this.checkForCheckMate()){
          this.gameEndHandler('stalemate')
        }
        else if (horde) {
          if (this.whitePieces.length === 0)
            gameEndHandler('blackWins');
        }

        else {
          this.drawHandler();
        }
      }
      //If square clicked isn't a legal move, this will either deselect the piece, or pick a new piece by calling square clicked again but without a piece selected.
      else {
        this.pieceSelected.possibleMoves = [];
        this.pieceSelected = false;
        this.unHighlightMoves();
        this.unHighlightSelectedPiece();
        this.squareClicked();
      }
    }
  },

  checkForPiece: function(target_square, color){
    game.pieceFound = false;
    var teamToCheck = color + 'Pieces';
    if (arguments.length === 2){
      // console.log('checkingForPieces on:' + target_square);
      // console.log(this.pieceFound);
      this[teamToCheck].forEach(function(piece){
        // console.log('piece location: ', piece.location, target_square);
          if(game.pieceFound != false){

            // console.log('already found a piece');
            return false;
          }
          if (piece.location === target_square){
            game.pieceFound = piece;
            // console.log('found piece');
          }
      });
      if (game.pieceFound === false){
        // console.log('didnt find piece');
        return false;
      }
      else {
        // console.log(game.pieceFound);
        // console.log('found piece?');
        return true;
    }
  }
    else if (game.checkForPiece(target_square, 'white')){
      // console.log('checking white');
      return true;
    }
    else if (game.checkForPiece(target_square, 'black')){
      // console.log(target_square);
      // console.log('found black');
      return true;
    }
    else return false;
  },

  highlightMoves: function(){
    $('.highLight').removeClass('highLight');
    this.pieceSelected.possibleMoves.forEach(function(move){
      $(`#${move}`).addClass('highLight')
    })
  },

  unHighlightMoves: function(){
    $('.highLight').removeClass('highLight');
  },

  highlightSelectedPiece: function() {
    $(`#${this.pieceSelected.location} p`).addClass('selectedPiece')
  },

  unHighlightSelectedPiece: function() {
    $(`.selectedPiece`).removeClass('selectedPiece')
  },

  highlightPreviousMove: function() {
    this.previousMove.forEach(function(space){
      if ($(`#${space}`).attr('class') === 'white square'){
        $(`#${space}`).addClass('previousMoveWhite');
      }
        else $(`#${space}`).addClass('previousMoveGray');
    })
  },

  unhighlightPreviousMove: function() {
    $('.previousMoveGray').removeClass('previousMoveGray')
    $('.previousMoveWhite').removeClass('previousMoveWhite')
  },

  isLegalMove: function(){
    // console.log(this.squareSelected);
    if(this.pieceSelected.possibleMoves.indexOf(this.squareSelected) > - 1) return true
    else return false;
  },

  makeMove: function(){
    //En Passant handling
    if (this.pieceSelected.type === 'pawn'){
      this.pieceSelected.hasMoved = true;
      this.enPassantHandler();
    }
    this.enPassant[2]++;
    if (this.enPassant[2] > 1){
      this.enPassant = [];
    }
    //Castle handling
    if (this.pieceSelected.type === 'king'){
      this.castleHandler();
    }
    if (this.pieceSelected.type === 'king' || this.pieceSelected.type === 'rook'){
      this.pieceSelected.hasMoved = true;
    }

    $(`#${this.squareSelected} p`).html(`${this.pieceSelected.code}`)
    $(`#${this.pieceSelected.location} p`).html("")
    this.unHighlightMoves();
    this.unHighlightSelectedPiece();
    this.changeTurn();
    this.pieceSelected.possibleMoves = [];
    //Check if square clicked is occuppied by enemy piece, if so, remove it form the that team's array.
    if (this.checkForPiece(this.squareSelected, this.turn)){
      var team = this.turn + 'Pieces';
      var index = this[team].indexOf(this.pieceFound);
      this[team].splice(index, 1);
    }
    this.previousMove[0] = this.pieceSelected.location;
    this.pieceSelected.location = this.squareSelected;
    this.previousMove[1] = this.pieceSelected.location;
    this.squareSelected = false;
    console.log(this.enPassantablePiece);
  },

  enPassantHandler: function(){
    // console.log('squareSelected: ', this.);
    if (this.squareSelected === this.enPassant[0]){
      console.log(this[this.otherColor() + 'Pieces']);
      console.log(this.enPassant[1]);
      index = this[this.otherColor() + 'Pieces'].indexOf(this.enPassant[1]);
      console.log(index);
      this[this.otherColor() + 'Pieces'].splice(index, 1);
      $(`#${this.enPassant[1].location} p`).html("");
      this.enPassant = []
      return;
    }

    var coordinates = this.pieceSelected.location.split("");
    var y_coordinate = parseInt(coordinates[1]);
    if(this.squareSelected === coordinates[0] + (y_coordinate + 2)) {
      this.enPassant[0] = coordinates[0] + (y_coordinate + 1);
      this.enPassant[1] = this.pieceSelected;
      this.enPassant[2] = 0;
    }
    else if (this.squareSelected === coordinates[0] + (y_coordinate - 2)){
      this.enPassant[0] = coordinates[0] + (y_coordinate - 1);
      this.enPassant[1] = this.pieceSelected;
      this.enPassant[2] = 0;
    }
    console.log(this.enPassant);
  },

  castleHandler: function(){
    var coordinates = this.pieceSelected.location.split("");
    if(this.squareSelected === chessLetters[chessLetters.indexOf(coordinates[0])+2]+coordinates[1]){
      // $(`#${this.pieceSelected.location} p`).html("");
      // this.pieceSelected.location = chessLetters[chessLetters.indexOf(coordinates[0]+2) + coordinates[1];
      var rookToMove = searchLocation(chessLetters[chessLetters.indexOf(coordinates[0])+3] + coordinates[1], this[this.turn + "Pieces"]);
      console.log('Moving:', rookToMove);
      var newRookLocation = chessLetters[chessLetters.indexOf(coordinates[0])+1] + coordinates[1];

      $(`#${rookToMove.location} p`).html("");
      if(this.turn === 'white'){
        $(`#${newRookLocation} p`).html('&#9814');

      }
      else $(`#${newRookLocation} p`).html('&#9820');
      rookToMove.location = newRookLocation;
    }
    else if(this.squareSelected === chessLetters[chessLetters.indexOf(coordinates[0]) - 2]+ coordinates[1]) {
      var rookToMove = searchLocation(chessLetters[chessLetters.indexOf(coordinates[0]) - 4] + coordinates[1], this[this.turn + "Pieces"]);
      var newRookLocation = chessLetters[chessLetters.indexOf(coordinates[0])-1] + coordinates[1];
      console.log(newRookLocation);
      $(`#${rookToMove.location} p`).html("");
      if(this.turn === 'white'){
        $(`#${newRookLocation} p`).html('&#9814');

      }
      else $(`#${newRookLocation} p`).html('&#9820');
      rookToMove.location = newRookLocation;
    }
  },
  // causesSelfCheck(possibleMove){
    // console.log('executing');
  //   var illegalMove = false;
  //   var storeLocation = this.pieceSelected.location;
  //   this.pieceSelected.location = possibleMove;
  //   let color = this.otherColor();
  //   // let kingsColor = this.turn +
  //   // function findKing(piece){
  //   //     return piece.type === 'king'
  //   // }
  //
  //   var king = search('king',this[`${this.turn}Pieces`])
  //   let piecesToCheck = color + 'Pieces';
  //
  //   game[piecesToCheck].forEach(function(piece){
  //     if (illegalMove === true) return; //stop loop if the move is already deemed illegal.
  //     if (piece.location === possibleMove) return; //If piece can capture opponent then move is okay, no need to check.
  //     piece.checkingCheck = true;
  //     if(piece.type === 'pawn') {
  //       game.changeTurn();
  //       piece.findPossibleMoves();
  //       game.changeTurn();
  //     } //if piece is a pawn, its moves change if its able to capture an opponent piece so must simulate that it is actually opponent's turn.  Wow this was a difficult bug to find.
  //     else piece.findPossibleMoves();
  //     if(piece.possibleMoves.indexOf(king.location) > -1) {
  //       illegalMove = true;
  //     }
  //     piece.possibleMoves = [];
  //     piece.checkingCheck = false;
  //   })
  //   this.pieceSelected.location = storeLocation;
  //   if (illegalMove) return true;
  //   else return false;
  // },
  causesSelfCheck2(pieceObject){
    // console.log('executing');
    var storeLocation = pieceObject.location;
    var storeMoves = pieceObject.possibleMoves;
    pieceObject.possibleMoves = [];
    var king = search('king',this[`${this.turn}Pieces`])
    var color = this.otherColor();
    var piecesToCheck = color + 'Pieces';

    storeMoves.forEach(function(possibleMove){
      var illegalMove = false;
      pieceObject.location = possibleMove;

      game[piecesToCheck].forEach(function(piece){
        if (pieceObject.type === 'king') {
          var location;
            var pieceCaptured = searchLocation(possibleMove, game[color+'Pieces'])
            if (pieceCaptured){
              location = pieceCaptured.location;
              pieceCaptured.location = 'bullspit';
              piece.findPossibleMoves();
              if(piece.possibleMoves.indexOf(king.location) > -1) {
                illegalMove = true;
              }
              pieceCaptured.location = location;
            }
          }
        if (piece.location === possibleMove){
          return;
        } //If piece can capture opponent then move is okay, no need to check.

        piece.checkingCheck = true;
        //if piece is a pawn, its moves change if its able to capture an opponent piece so must simulate that it is actually opponent's turn.  Wow this was a difficult bug to find.
        if(piece.type === 'pawn') {
          game.changeTurn();
          piece.findPossibleMoves();
          game.changeTurn();
        }
        else piece.findPossibleMoves();
        if(piece.possibleMoves.indexOf(king.location) > -1) {
          illegalMove = true;
        }
        piece.possibleMoves = [];
        piece.checkingCheck = false;
      })
    if(!illegalMove){
      pieceObject.possibleMoves.push(possibleMove)
    }
    })
    pieceObject.location = storeLocation;
    if (pieceObject.possibleMoves.length === 0)
      return false
    else return true;
  },
  checkForCheck(){
    this.inCheck = false;
    // console.log(game.pieceSelected);
    this.changeTurn();
    this.pieceSelected.findPossibleMoves();
    if(this.pieceSelected.possibleMoves.indexOf(search('king',game[`${game.otherColor()}Pieces`]).location) > -1){
      this.inCheck = true;
    }
    this.pieceSelected.possibleMoves = [];
    this.changeTurn();
    console.log('youre in check: ',this.inCheck);
    // if(this.inCheck)
    //   alert(`${this.turn} is in check!`);
  },
  checkForCheckMate: function(){
    console.log(this.turn);
    var isCheckMate = true;
    this[`${this.turn}Pieces`].forEach(function(piece){
      if (isCheckMate === false) return;
      this.pieceSelected = piece;
      if (piece.findPossibleMoves()) isCheckMate = false;
      console.log('Piece: ', piece, 'Possible moves: ', piece.possibleMoves);
      // );
      // console.log('piece: ', piece, ' moves: ' , piece.possibleMoves);
      // this.pieceSelected.findPossibleMoves();
      // this.pieceSelected.possibleMoves.forEach(function(move){
        // if (isCheckMate === false) return;
        // if(game.gameBoard.indexOf(move) > - 1)
          // isCheckMate = false;
      // })
    })
    this.pieceSelected = false;
    console.log(isCheckMate);
    return isCheckMate;
  },
  pawnPromotion(){
    var team = this.otherColor();
    var teamPieces = team + "Pieces";
    if (team === 'white')
      var lookingFor = '8';
      else var lookingFor = '1';
      var pieceFound = false;
      //iterate through game pieces to see if a pawn is located on a promotion square.
    game[teamPieces].forEach(function(piece){
      if(pieceFound) return; //prevents loop if piece has already been found.
      if (piece.type === 'pawn' && piece.location[1] === lookingFor){

        //if so, pop up promotion form.
        $('#gameBoard').css('opacity','0.3');
        $('form.hidden').removeClass('hidden');
        $('#pawn_promotion button').on('click', function(e){

          //remove pawn from team pieces array.
          var index = game[teamPieces].indexOf(piece);
          game[teamPieces].splice(index, 1);

          //remove form from display
          $('#pawn_promotion').addClass('hidden');
          $('#gameBoard').css('opacity','1');

          //Add piece to game based on user input.
          var promotedPiece = $('input[name="piece"]:checked').val();
          switch(promotedPiece){
            case 'queen':
              game[teamPieces].push(new Queen(`${piece.location}`, `${game.otherColor()}`));
              game.otherColor() === 'white' ? $(`#${piece.location} p`).html('&#9813') : $(`#${piece.location} p`).html('&#9819');
              break;
            case 'knight':
              game[teamPieces].push(new Knight(`${piece.location}`, `${game.otherColor()}`));
              game.otherColor() === 'white' ? $(`#${piece.location} p`).html('&#9816') : $(`#${piece.location} p`).html('&#9822');
              break;
            case 'bishop':
              game[teamPieces].push(new Bishop(`${piece.location}`, `${game.otherColor()}`));
              newPiece = game.otherColor() === 'white' ? $(`#${piece.location} p`).html('&#9815') : $(`#${piece.location} p`).html('&#9821');
              break;
            case 'rook':
              game[teamPieces].push(new Rook(`${piece.location}`, `${game.otherColor()}`));
              newPiece = game.otherColor() === 'white' ? $(`#${piece.location} p`).html('&#9814') : $(`#${piece.location} p`).html('&#9820');
              break;
          }
          console.log(game.whitePieces);
          console.log(game.blackPieces);
        })
      }
    })
  },
  // drawHandler: function(){
  //   game.states.push([game.whitePieces, game.blackPieces]);
  //   game.states.forEach(function(state){
  //     if (state === game.states[game.states.indexOf(state) + 2])
  //       alert('Draw!')
  //   })
  //   console.log(this.states);
  //   && state === game.states[game.states.indexOf(state) + 4
  // }
  drawHandler: function(){
    var draw = true;
    var white = this.whitePieces;
    var black = this.blackPieces;
    if (white.length < 3 && black.length < 3){
      for (var i = 0; i < white.length; i++) {
        if(white[i].type === 'rook' || white[i].type === 'queen'){
          draw = false;
          break;
        }
      }
      for (var i = 0; i < black.length; i++) {
        if(black[i].type === 'rook' || black[i].type === 'queen'){
          draw = false;
          break;
        }
      }
      if(draw)
        alert('Draw!  Insufficient mating material.')
    }
  },
  gameEndHandler: function(endingScenario){
    switch(endingScenario) {
      case 'whiteWins':
        this.whiteScore++;
        $('#gameOver p').text('Checkmate!  White wins!  Click below to play again.')
        break;
      case 'blackWins':
        this.blackScore++;
        $('#gameOver p').text('Checkmate!  Black wins!  Click below to play again.')
        break;
      case 'stalemate':
        this.whiteScore += 0.5;
        this.blackScore += 0.5;
        $('#gameOver p').text('Stalemate!  Player has no legal moves!  Click below to play again.')
        break;
      case 'insufficientMatingMaterial':
        this.whiteScore += 0.5;
        this.blackScore += 0.5;
        $('#gameOver p').text('Draw! Insufficient Mating Materials!  Click below to play again.')
        break;
      case 'threefoldRepetition':
        this.whiteScore += 0.5;
        this.blackScore += 0.5;
        $('#gameOver p').text('Draw by threefold repition!  Click below to play again.')
        break;
      case 'whiteOutOfTime':
        this.blackScore += 1;
        $('#gameOver p').text('White has ran out of time! Black wins!  Click below to play again.')
        break;
      case 'blackOutOfTime':
        this.whiteScore += 1;
        $('#gameOver p').text('Black has ran out of time! White wins!  Click below to play again.')
        break;
    }
    if (timed1){
      this.whiteClock.pauseClock();
      this.whiteClock.seconds = 01;
      this.whiteClock.minutes = 60;
      this.blackClock.pauseClock();
      this.blackClock.seconds = 01;
      this.blackClock.minutes = 60;
    }
    $('#blackClock').text(`60:00`)
    $('#whiteClock').text('60:00')
    $('#scoreBoard').slideDown('slow');
    setTimeout(function(){$('#scoreBoard').slideUp('slow')}, 5000)
    $('#gameBoard').css('opacity','0.3');
    $('#gameOver').removeClass('hidden');
    $('#whiteScore').text($('.player1Name').val() + `: ${this.whiteScore}`);
    $('#blackScore').text($('.player2Name').val() + `: ${this.blackScore}`);
  }
}

//====================================
//Constructors for game piece objects
//====================================
class Pawn {
  constructor(location, color) {
    this.color = color;
    this.type = 'pawn';
    this.location = location;
    //Checking for check prevents an infinite loop when possibleMoves is called from the causesSelfCheck function.
    this.checkingCheck = false;
    if(color === 'white') {
      this.code = '&#9817'
    }
    else this.code = '&#9823'
    this.possibleMoves = [];
    var hasMoved = false;
    this.findPossibleMoves = function(){
      this.possibleMoves = [];
      var coordinates = this.location.split("");
      var y_coordinate = parseInt(coordinates[1]);

      if(this.color === 'white'){
        var currentCoordinate = coordinates[0] + (y_coordinate + 1)
        // console.log('calling from findPossibleMoves');
        if(!game.checkForPiece(currentCoordinate)){
          this.possibleMoves.push(currentCoordinate)
          currentCoordinate = coordinates[0] + (y_coordinate + 2)
          // console.log('calling from findPossibleMoves2');
          if(!this.hasMoved && !game.checkForPiece(currentCoordinate) && !horde) {
            this.possibleMoves.push(currentCoordinate)
          }
        }
        //En Passant handling (AI doesn't currently consider the En Passant move)
        currentCoordinate = chessLetters[chessLetters.indexOf(coordinates[0]) + 1] + (y_coordinate + 1);
        // console.log('calling from findPossibleMoves3');
        if (game.checkForPiece(currentCoordinate, game.otherColor()) || game.enPassant[0] === currentCoordinate) {
          this.possibleMoves.push(currentCoordinate);
          // console.log(this.possibleMoves);
        }
        currentCoordinate = chessLetters[chessLetters.indexOf(coordinates[0]) - 1] + (y_coordinate + 1);
        // console.log('calling from findPossibleMoves4');
        if (game.checkForPiece(currentCoordinate, game.otherColor()) || game.enPassant[0] === currentCoordinate) {
          this.possibleMoves.push(currentCoordinate);
        }
        // console.log(this.possibleMoves);
        // if (this.possibleMoves.length > 0) return true;
        // else return false;
      }
    else {
      var currentCoordinate = coordinates[0] + (y_coordinate - 1)
      // console.log('calling from findPossibleMoves');
      if(!game.checkForPiece(currentCoordinate)){
        this.possibleMoves.push(currentCoordinate)
        currentCoordinate = coordinates[0] + (y_coordinate - 2)
        // console.log('calling from findPossibleMoves2');
        if(!this.hasMoved && !game.checkForPiece(currentCoordinate)) {
          this.possibleMoves.push(currentCoordinate)
        }
      }
      // console.log(this.possibleMoves);
      currentCoordinate = chessLetters[chessLetters.indexOf(coordinates[0]) + 1] + (y_coordinate - 1);
      // console.log('calling from findPossibleMoves3');
      if (game.checkForPiece(currentCoordinate, game.otherColor())  || game.enPassant[0] === currentCoordinate) {
        this.possibleMoves.push(currentCoordinate);
        // console.log(this.possibleMoves);
      }
      currentCoordinate = chessLetters[chessLetters.indexOf(coordinates[0]) - 1] + (y_coordinate - 1);
      // console.log('calling from findPossibleMoves4');
      if (game.checkForPiece(currentCoordinate, game.otherColor()) || game.enPassant[0] === currentCoordinate) {
        this.possibleMoves.push(currentCoordinate);
      }
      // console.log(this.possibleMoves);
      }
      // console.log('Piece: ', this, 'Moves: ', this.possibleMoves);
      if(!this.checkingCheck){
        if(game.causesSelfCheck2(this)) return true;
          else return false;
        // var selfReference = this;
        // this.possibleMoves.forEach(function(possibleMove){
          // if(game.causesSelfCheck(possibleMove)){
            // console.log('This after calling', selfReference);
            // console.log(possibleMove);
            // var index = selfReference.possibleMoves.indexOf(possibleMove)
            // selfReference.possibleMoves.splice(index, 1);
            // console.log('Piece: ', selfReference, 'Moves: ', selfReference.possibleMoves);
            // selfReference.possibleMoves[selfReference.possibleMoves.indexOf(possibleMove)] = 0;
        //   }
        // })
        // console.log('Piece: ', this, 'Moves: ', this.possibleMoves);
      }
      // console.log('pawn has moves: ', this.possibleMoves);
      // if (this.possibleMoves.length > 0) return true;
      // else return false;
    }
  }
}

class Rook {
  constructor(location, color) {
    this.color = color;
    this.type = 'rook';
    this.location = location;
    this.checkingCheck = false;
    if(color === 'white') {
      this.code = '&#9814'
    }
    else this.code = '&#9820'
    this.possibleMoves = [];
    this.hasMoved = false;
    this.findPossibleMoves = function(){
      var coordinates = this.location.split("");
      var row = parseInt(coordinates[1]);
      var column = chessLetters.indexOf(coordinates[0])
      var squareToCheck = '';

      //This is checking path 1 of 4
      for (var pathNumber = 0; pathNumber < 4; pathNumber++){
        for(let i = 1; i < 8; i++){
          switch(pathNumber){
            case 0:
              squareToCheck = chessLetters[column + i] + row;
              break;
            case 1:
              squareToCheck = chessLetters[column - i] + row;
              break;
            case 2:
              squareToCheck = chessLetters[column] + (row + i);
              break;
            case 3:
              squareToCheck = chessLetters[column] + (row - i);
              break;
          }
          if(chessLetters.indexOf(squareToCheck[0]) < 0 || parseInt(squareToCheck[1]) < 1 || parseInt(squareToCheck[1]) > 8 || squareToCheck.length > 2){continue;}
          if (!game.checkForPiece(squareToCheck)){
            this.possibleMoves.push(squareToCheck);
          }
            else if (game.pieceFound.color === this.color)
              break;
            else if (game.pieceFound.color != this.color){
            this.possibleMoves.push(squareToCheck);
              break;
            }
        }
      }
      if(!this.checkingCheck){
        if(game.causesSelfCheck2(this)) return true;
          else return false;
        // var selfReference = this;
        // this.possibleMoves.forEach(function(possibleMove){
          // if(game.causesSelfCheck(possibleMove)){
            // console.log('This after calling', selfReference);
            // console.log(possibleMove);
            // var index = selfReference.possibleMoves.indexOf(possibleMove)
            // selfReference.possibleMoves.splice(index, 1);
            // console.log('Piece: ', selfReference, 'Moves: ', selfReference.possibleMoves);
            // selfReference.possibleMoves[selfReference.possibleMoves.indexOf(possibleMove)] = 0;
        //   }
        // })
        // console.log('Piece: ', this, 'Moves: ', this.possibleMoves);
      }
      // console.log('pawn has moves: ', this.possibleMoves);
      // if (this.possibleMoves.length > 0) return true;
      // else return false;
    }
  }
}

class Knight {
  constructor(location, color) {
    this.color = color;
    this.type = 'knight';
    this.location = location;
    this.checkingCheck = false;
    if(color === 'white') {
      this.code = '&#9816'
    }
    else this.code = '&#9822'
    this.possibleMoves = [];
    this.findPossibleMoves = function(){
      var coordinates = this.location.split("");
      var row = parseInt(coordinates[1]);
      var column = chessLetters.indexOf(coordinates[0])
      var squareToCheck = '';

      //This is checking path 1 of 4
      for (var pathNumber = 0; pathNumber < 4; pathNumber++){
        for(let i = -1; i < 3; i += 2){
          // console.log('running i =' + i + ' on case: ' + pathNumber);
          switch(pathNumber){
            case 0:
              squareToCheck = chessLetters[column + i] + (row + 2);
              // console.log(squareToCheck);
              break;
            case 1:
              squareToCheck = chessLetters[column - 2] + (row + i);
              break;
            case 2:
              squareToCheck = chessLetters[column + i] + (row - 2);
              break;
            case 3:
              squareToCheck = chessLetters[column + 2] + (row + i);
              break;
          }
          if(chessLetters.indexOf(squareToCheck[0]) < 0 || parseInt(squareToCheck[1]) < 1 || parseInt(squareToCheck[1]) > 8 || squareToCheck.length > 2){continue;}
          // console.log('checking ' + squareToCheck);
          if (!game.checkForPiece(squareToCheck)){
            this.possibleMoves.push(squareToCheck);
          }
            else if (game.pieceFound.color === this.color)
              continue;
            else if (game.pieceFound.color != this.color){
            this.possibleMoves.push(squareToCheck);
            }
        }
      }
      if(!this.checkingCheck){
        if(game.causesSelfCheck2(this)) return true;
          else return false;
        // var selfReference = this;
        // this.possibleMoves.forEach(function(possibleMove){
          // if(game.causesSelfCheck(possibleMove)){
            // console.log('This after calling', selfReference);
            // console.log(possibleMove);
            // var index = selfReference.possibleMoves.indexOf(possibleMove)
            // selfReference.possibleMoves.splice(index, 1);
            // console.log('Piece: ', selfReference, 'Moves: ', selfReference.possibleMoves);
            // selfReference.possibleMoves[selfReference.possibleMoves.indexOf(possibleMove)] = 0;
        //   }
        // })
        // console.log('Piece: ', this, 'Moves: ', this.possibleMoves);
      }
      // console.log('pawn has moves: ', this.possibleMoves);
      // if (this.possibleMoves.length > 0) return true;
      // else return false;
    }
  }
}

class Bishop {
  constructor(location, color) {
    this.color = color;
    this.type = 'bishop';
    this.location = location;
    this.checkingCheck = false;
    if(color === 'white') {
      this.code = '&#9815'
    }
    else this.code = '&#9821'
    this.possibleMoves = [];
    this.findPossibleMoves = function(){
      var coordinates = this.location.split("");
      var row = parseInt(coordinates[1]);
      var column = chessLetters.indexOf(coordinates[0])
      var squareToCheck = '';

      //This is checking path 1 of 4
      for (var pathNumber = 0; pathNumber < 4; pathNumber++){
        for(let i = 1; i < 8; i++){
          switch(pathNumber){
            case 0:
              squareToCheck = chessLetters[column + i] + (row + i);
              break;
            case 1:
              squareToCheck = chessLetters[column + i] + (row - i);
              break;
            case 2:
              squareToCheck = chessLetters[column - i] + (row + i);
              break;
            case 3:
              squareToCheck = chessLetters[column - i] + (row - i);
              break;
          }
          if(chessLetters.indexOf(squareToCheck[0]) < 0 || parseInt(squareToCheck[1]) < 1 || parseInt(squareToCheck[1]) > 8 || squareToCheck.length > 2){continue;}
          if (!game.checkForPiece(squareToCheck)){
            this.possibleMoves.push(squareToCheck);
          }
            else if (game.pieceFound.color === this.color)
              break;
            else if (game.pieceFound.color != this.color){
            this.possibleMoves.push(squareToCheck);
              break;
            }
        }
      }
      if(!this.checkingCheck){
        if(game.causesSelfCheck2(this)) return true;
          else return false;
        // var selfReference = this;
        // this.possibleMoves.forEach(function(possibleMove){
          // if(game.causesSelfCheck(possibleMove)){
            // console.log('This after calling', selfReference);
            // console.log(possibleMove);
            // var index = selfReference.possibleMoves.indexOf(possibleMove)
            // selfReference.possibleMoves.splice(index, 1);
            // console.log('Piece: ', selfReference, 'Moves: ', selfReference.possibleMoves);
            // selfReference.possibleMoves[selfReference.possibleMoves.indexOf(possibleMove)] = 0;
        //   }
        // })
        // console.log('Piece: ', this, 'Moves: ', this.possibleMoves);
      }
      // console.log('pawn has moves: ', this.possibleMoves);
      // if (this.possibleMoves.length > 0) return true;
      // else return false;
    }
  }
}
class Queen {
  constructor(location, color) {
    this.color = color;
    this.type = 'queen';
    this.location = location;
    this.checkingCheck = false;
    if(color === 'white') {
      this.code = '&#9813'
    }
    else this.code = '&#9819'
    this.possibleMoves = [];
    this.findPossibleMoves = function(){
      var coordinates = this.location.split("");
      var row = parseInt(coordinates[1]);
      var column = chessLetters.indexOf(coordinates[0])
      var squareToCheck = '';

      //This is checking path 1 of 4
      for (var pathNumber = 0; pathNumber < 8; pathNumber++){
        for(let i = 1; i < 8; i++){
          switch(pathNumber){
            case 0:
              squareToCheck = chessLetters[column + i] + (row + i);
              break;
            case 1:
              squareToCheck = chessLetters[column + i] + (row - i);
              break;
            case 2:
              squareToCheck = chessLetters[column - i] + (row + i);
              break;
            case 3:
              squareToCheck = chessLetters[column - i] + (row - i);
              break;
            case 4:
              squareToCheck = chessLetters[column + i] + row;
              break;
            case 5:
              squareToCheck = chessLetters[column - i] + row;
              break;
            case 6:
              squareToCheck = chessLetters[column] + (row + i);
              break;
            case 7:
              squareToCheck = chessLetters[column] + (row - i);
              break;
          }
          if(chessLetters.indexOf(squareToCheck[0]) < 0 || parseInt(squareToCheck[1]) < 1 || parseInt(squareToCheck[1]) > 8 || squareToCheck.length > 2){continue;}
          if (!game.checkForPiece(squareToCheck)){
            this.possibleMoves.push(squareToCheck);
          }
            else if (game.pieceFound.color === this.color)
              break;
            else if (game.pieceFound.color != this.color){
            this.possibleMoves.push(squareToCheck);
              break;
            }
        }
      }
      if(!this.checkingCheck){
        if(game.causesSelfCheck2(this)) return true;
          else return false;
        // var selfReference = this;
        // this.possibleMoves.forEach(function(possibleMove){
          // if(game.causesSelfCheck(possibleMove)){
            // console.log('This after calling', selfReference);
            // console.log(possibleMove);
            // var index = selfReference.possibleMoves.indexOf(possibleMove)
            // selfReference.possibleMoves.splice(index, 1);
            // console.log('Piece: ', selfReference, 'Moves: ', selfReference.possibleMoves);
            // selfReference.possibleMoves[selfReference.possibleMoves.indexOf(possibleMove)] = 0;
        //   }
        // })
        // console.log('Piece: ', this, 'Moves: ', this.possibleMoves);
      }
      // console.log('pawn has moves: ', this.possibleMoves);
      // if (this.possibleMoves.length > 0) return true;
      // else return false;
    }
  }
}

class King {
  constructor(location, color) {
    this.color = color;
    this.type = 'king';
    this.location = location;
    this.checkingCheck = false;
    if(color === 'white') {
      this.code = '&#9812'
    }
    else this.code = '&#9818'
    this.possibleMoves = [];
    this.hasMoved = false;
    this.findPossibleMoves = function(){
      var coordinates = this.location.split("");
      var row = parseInt(coordinates[1]);
      var column = chessLetters.indexOf(coordinates[0])
      var squareToCheck = '';

      //This is checking path 1 of 4
      for (let pathNumber = 0; pathNumber < 8; pathNumber++){
          switch(pathNumber){
            case 0:
              squareToCheck = chessLetters[column + 1] + (row + 1);
              break;
            case 1:
              squareToCheck = chessLetters[column + 1] + (row - 1);
              break;
            case 2:
              squareToCheck = chessLetters[column - 1] + (row + 1);
              break;
            case 3:
              squareToCheck = chessLetters[column - 1] + (row - 1);
              break;
            case 4:
              squareToCheck = chessLetters[column + 1] + row;
              break;
            case 5:
              squareToCheck = chessLetters[column - 1] + row;
              break;
            case 6:
              squareToCheck = chessLetters[column] + (row + 1);
              break;
            case 7:
              squareToCheck = chessLetters[column] + (row - 1);
              break;
          }
          // console.log(pathNumber);
          // console.log('checking' + squareToCheck);
          // console.log(this.possibleMoves);
          if(chessLetters.indexOf(squareToCheck[0]) < 0 || parseInt(squareToCheck[1]) < 1 || parseInt(squareToCheck[1]) > 8 || squareToCheck.length > 2){continue;}
          if (!game.checkForPiece(squareToCheck)){
            this.possibleMoves.push(squareToCheck);
          }
            else if (game.pieceFound.color != this.color){
            this.possibleMoves.push(squareToCheck);
            }
        }
        //Castle Handling:
        console.log(game.inCheck);
        if(!game.inCheck  && this.hasMoved === false){
          var rooks = [];
          game[this.color + "Pieces"].forEach(function(piece){
            if(piece.type === 'rook' && piece.hasMoved === false)
              rooks.push(piece);
          })
          var kingsCoordinates = this.location.split("");
          var kingsColumn = chessLetters.indexOf(coordinates[0])

          for (var i = 0; i < rooks.length; i++) {
            var rook = rooks[i]
            var coordinates = rook.location.split("");
            var row = parseInt(coordinates[1]);
            var column = chessLetters.indexOf(coordinates[0])
            if(column > kingsColumn){
              var moveToCheck = chessLetters[kingsColumn + 1] + coordinates[1];
              if(this.possibleMoves.indexOf(moveToCheck) > - 1 && !game.checkForPiece(chessLetters[kingsColumn + 2] + coordinates[1])){
                this.possibleMoves.push(chessLetters[kingsColumn + 2] + coordinates[1]);
              }
            }
              else if (column < kingsColumn){
                var moveToCheck = chessLetters[kingsColumn - 1] + coordinates[1];
                if(this.possibleMoves.indexOf(moveToCheck) > - 1 && !game.checkForPiece(chessLetters[kingsColumn - 2] + coordinates[1]) && !game.checkForPiece(chessLetters[kingsColumn - 3] + coordinates[1])){
                  this.possibleMoves.push(chessLetters[kingsColumn - 2] + coordinates[1]);
                }
              }
          }
        }
        //Castle exception handling (the way castling is coded is that it just sees if the castling square is available for the king to move to and if it is, it adds it regardless of what happens on the adjacent square.  This now checks if the adjacent square is also a possible move, and if it isn't, it removes the castling square from the available moves.):
        if(!this.checkingCheck){
          if(game.causesSelfCheck2(this)){
            if(this.color === 'white' && !this.hasMoved){
              if (this.possibleMoves.indexOf('f1') < 0 && this.possibleMoves.indexOf('g1') > -1 && this.location != 'f1'){
                this.possibleMoves.splice(this.possibleMoves.indexOf('g1'),1)
              }
              if (this.possibleMoves.indexOf('d1') < 0 && this.possibleMoves.indexOf('c1') > -1){
                this.possibleMoves.splice(this.possibleMoves.indexOf('c1'),1)
              }
            }
            if(this.color === 'black' && !this.hasMoved){
              if (this.possibleMoves.indexOf('f8') < 0 && this.possibleMoves.indexOf('g8') > -1){
                this.possibleMoves.splice(this.possibleMoves.indexOf('g8'),1)
              }
              if (this.possibleMoves.indexOf('d8') < 0 && this.possibleMoves.indexOf('c8') > -1){
                this.possibleMoves.splice(this.possibleMoves.indexOf('c8'),1)
              }
            }
            if(this.possibleMoves.length > 0)
              return true;
          }
            else return false;
          // var selfReference = this;
          // this.possibleMoves.forEach(function(possibleMove){
            // if(game.causesSelfCheck(possibleMove)){
              // console.log('This after calling', selfReference);
              // console.log(possibleMove);
              // var index = selfReference.possibleMoves.indexOf(possibleMove)
              // selfReference.possibleMoves.splice(index, 1);
              // console.log('Piece: ', selfReference, 'Moves: ', selfReference.possibleMoves);
              // selfReference.possibleMoves[selfReference.possibleMoves.indexOf(possibleMove)] = 0;
          //   }
          // })
          // console.log('Piece: ', this, 'Moves: ', this.possibleMoves);
        }
        // console.log('pawn has moves: ', this.possibleMoves);
        // if (this.possibleMoves.length > 0) return true;
        // else return false;
    }
  }
}
//Instantiate game piece objects
// function makeGamePieceObjects(){
//   for (var i = 0; i < 8; i++) {
//      game.whitePieces.push(new Pawn(`${chessLetters[i]}2`, 'white'))
//      game.blackPieces.push(new Pawn(`${chessLetters[i]}7`, 'black'))
//     if(i === 0 || i === 7) {
//        game.whitePieces.push(new Rook(`${chessLetters[i]}1`, 'white'))
//        game.blackPieces.push(new Rook(`${chessLetters[i]}8`, 'black'))
//     }
//     if(i === 1 || i === 6) {
//        game.whitePieces.push(new Knight(`${chessLetters[i]}1`, 'white'))
//        game.blackPieces.push(new Knight(`${chessLetters[i]}8`, 'black'))
//     }
//     if(i === 2 || i === 5) {
//        game.whitePieces.push(new Bishop(`${chessLetters[i]}1`, 'white'))
//        game.blackPieces.push(new Bishop(`${chessLetters[i]}8`, 'black'))
//     }
//     if(i === 3) {
//       game.whitePieces.push(new Queen(`${chessLetters[i]}1`, 'white'))
//       game.blackPieces.push(new Queen(`${chessLetters[i]}8`, 'black'))
//     }
//     if(i === 4) {
//       game.whitePieces.push(new King(`${chessLetters[i]}1`, 'white'))
//       game.blackPieces.push(new King(`${chessLetters[i]}8`, 'black'))
//     }
//   }
//
// }
//==========
//Game setup
//==========

makeBoard();
// makePieces();
// makeGamePieceObjects();
if (timed1){
  game.whiteClock.timer();
}
$('#gameClocks').css('display','none');
$('#scoreBoard').css('display','none');

$('.square').on('click',function(){
  game.squareSelected = $(this).attr('id');
  game.squareClicked();
})

$('.change_turn').on('click',function(e){
  e.preventDefault();
  game.changeTurn();
})

$('#showPreviousMove').on('click',function(){
  game.highlightPreviousMove();
})

$('#displayClock').on('click',function(){
  $('#gameClocks').slideDown('slow');
  setTimeout(function(){$('#gameClocks').slideUp('slow')}, 5000)
})

$('#displayClockPermanently').on('click',function(){
  $('#gameClocks').slideDown('slow');
})

$('#displayScore').on('click',function(){
  $('#scoreBoard').slideDown('slow');
  setTimeout(function(){$('#scoreBoard').slideUp('slow')}, 5000)
})

$('#newGame').on('click',function(){
  $('#gameOver').addClass('hidden');
  $('#gameBoard').css('opacity','1');
  // $('#gameOver').css('display','none');
  game.whitePieces = [];
  game.blackPieces = [];
  $('.square p').html("");
  makeNormal();
  game.goesFirst = !game.goesFirst
  if (game.goesFirst)
    game.turn = 'black';
    else game.turn = 'white';
})
var states = [];
// drawHandler = function(){
  // var draw = true;
  // var white = game.whitePieces;
  // var black = game.blackPieces;
  // if (white.length < 3 && black.length < 3){
  //   for (var i = 0; i < white.length; i++) {
  //     if(white[i].type === 'rook' || white[i].type === 'queen'){
  //       draw = false;
  //       break;
  //     }
  //   }
  //   for (var i = 0; i < black.length; i++) {
  //     if(black[i].type === 'rook' || black[i].type === 'queen'){
  //       draw = false;
  //       break;
  //     }
  //   } if(draw)
  //       alert('Draw!  Insufficient mating material.')
  //   }
  //   var state = game.whitePieces.slice();
  //   var stateBlack = game.blackPieces.slice();
  //   stateBlack.forEach(function(piece){
  //     state.push(stateBlack);
  //   })
  //   states.push(state);
  //   states.forEach(function(state){
  //     var matchingStates = [];
  //     var index = states.indexOf(state);
  //     while (index != -1) {
  //       matchingStates.push(index);
  //       index = states.indexOf(state, index + 1);
  //     }
  //     console.log(matchingStates);
  //     if(matchingStates.length >= 3)
  //       alert('Draw by 3-fold repetition!');
  //   })
  // }
// console.log(game);
// game.squareSelected = 'd1';
// console.log(game.squareSelected);
// game.checkForPiece(game.squareSelected);
// console.log(game.pieceSelected);
// game.pieceSelected = game.blackPieces[1];
// var storeLocation = game.pieceSelected.location;
// console.log(storeLocation);
// game.pieceSelected.location = 'galsk';
// console.log(storeLocation);

  // console.log('lockandload!');

//Fill in the board with the starting chess pieces.
var makeNormal = function() {
  $('#a8 p, #h8 p').html('&#9820');
  $('#b8 p, #g8 p').html('&#9822');
  $('#c8 p, #f8 p').html('&#9821');
  $('#d8 p').html('&#9819');
  $('#e8 p').html('&#9818');
  for (var i = 0; i < 8; i++){
      $(`#${chessLetters[i]}7 p`).html('&#9823');
  }
  $('#a1 p, #h1 p').html('&#9814');
  $('#b1 p, #g1 p').html('&#9816');
  $('#c1 p, #f1 p').html('&#9815');
  $('#d1 p').html('&#9813');
  $('#e1 p').html('&#9812');
  for (var i = 0; i < 8; i++){
      $(`#${chessLetters[i]}2 p`).html('&#9817');
  }
    for (var i = 0; i < 8; i++) {
       game.whitePieces.push(new Pawn(`${chessLetters[i]}2`, 'white'))
       game.blackPieces.push(new Pawn(`${chessLetters[i]}7`, 'black'))

      if(i === 0 || i === 7) {
         game.whitePieces.push(new Rook(`${chessLetters[i]}1`, 'white'))
         game.blackPieces.push(new Rook(`${chessLetters[i]}8`, 'black'))
      }
      if(i === 1 || i === 6) {
         game.whitePieces.push(new Knight(`${chessLetters[i]}1`, 'white'))
         game.blackPieces.push(new Knight(`${chessLetters[i]}8`, 'black'))
      }
      if(i === 2 || i === 5) {
         game.whitePieces.push(new Bishop(`${chessLetters[i]}1`, 'white'))
         game.blackPieces.push(new Bishop(`${chessLetters[i]}8`, 'black'))
      }
      if(i === 3) {
        game.whitePieces.push(new Queen(`${chessLetters[i]}1`, 'white'))
        game.blackPieces.push(new Queen(`${chessLetters[i]}8`, 'black'))
      }
      if(i === 4) {
        game.whitePieces.push(new King(`${chessLetters[i]}1`, 'white'))
        game.blackPieces.push(new King(`${chessLetters[i]}8`, 'black'))
      }
    }
  }

  var make960 = function(){
    for (var i = 0; i < 8; i++){
        $(`#${chessLetters[i]}7 p`).html('&#9823');
    }
    for (var i = 0; i < 8; i++){
        $(`#${chessLetters[i]}2 p`).html('&#9817');
    }
    var pieceArray = [];
    var rooks = 0;
    var bishops = 0;
    var knights = 0;
    var queen = 0;
    var king = 0;
    var even = false;
    for (let i = 0; i < 8; i++) {
       game.whitePieces.push(new Pawn(`${chessLetters[i]}2`, 'white'))
       game.blackPieces.push(new Pawn(`${chessLetters[i]}7`, 'black'))

       while (pieceArray.length < 8) {
         var location = Math.floor(Math.random()*8)
         if (pieceArray.indexOf(location) < 0) {
           if (bishops < 2) {
             if (bishops === 1 && even && location % 2 > 0) {
               game.whitePieces.push(new Bishop(`${chessLetters[location]}1`, 'white'))
               game.blackPieces.push(new Bishop(`${chessLetters[location]}8`, 'black'))
               $(`#${chessLetters[location]}8 p`).html('&#9821');
               $(`#${chessLetters[location]}1 p`).html('&#9815');
               bishops++;
               pieceArray.push(location);
               break;
             }
             else if (bishops === 1 && !even && location % 2 === 0) {
               game.whitePieces.push(new Bishop(`${chessLetters[location]}1`, 'white'))
               game.blackPieces.push(new Bishop(`${chessLetters[location]}8`, 'black'))
               $(`#${chessLetters[location]}8 p`).html('&#9821');
               $(`#${chessLetters[location]}1 p`).html('&#9815');
               bishops++;
               pieceArray.push(location);
               break;
             }
             else if (bishops === 0) {
               game.whitePieces.push(new Bishop(`${chessLetters[location]}1`, 'white'))
               game.blackPieces.push(new Bishop(`${chessLetters[location]}8`, 'black'))
               $(`#${chessLetters[location]}8 p`).html('&#9821');
               $(`#${chessLetters[location]}1 p`).html('&#9815');
               bishops++;
               if (location % 2 === 0)
                even = true;
               pieceArray.push(location);
               break;
             }
           }
           if (bishops < 2)
             continue;

           if (rooks < 2) {
             game.whitePieces.push(new Rook(`${chessLetters[location]}1`, 'white'))
             game.blackPieces.push(new Rook(`${chessLetters[location]}8`, 'black'))
             $(`#${chessLetters[location]}8 p`).html('&#9820');
             $(`#${chessLetters[location]}1 p`).html('&#9814');
             rooks++;
             pieceArray.push(location);
             continue;
           }
           if (knights < 2) {
             game.whitePieces.push(new Knight(`${chessLetters[location]}1`, 'white'))
             game.blackPieces.push(new Knight(`${chessLetters[location]}8`, 'black'))
             knights++;
             pieceArray.push(location);
             $(`#${chessLetters[location]}8 p`).html('&#9822');
             $(`#${chessLetters[location]}1 p`).html('&#9816');
             continue;
           }
           if (queen < 1) {
             game.whitePieces.push(new Queen(`${chessLetters[location]}1`, 'white'))
             game.blackPieces.push(new Queen(`${chessLetters[location]}8`, 'black'))
             queen++;
             pieceArray.push(location);
             $(`#${chessLetters[location]}8 p`).html('&#9819');
             $(`#${chessLetters[location]}1 p`).html('&#9813');
             continue;
           }
           if (pieceArray.length === 7){
             for (let i = 0; i < 8; i++) {
                if (pieceArray.indexOf(i) < 0) {
                  game.whitePieces.push(new King(`${chessLetters[i]}1`, 'white'))
                  game.blackPieces.push(new King(`${chessLetters[i]}8`, 'black'))
                  pieceArray.push(location);
                  $(`#${chessLetters[i]}8 p`).html('&#9818');
                  $(`#${chessLetters[i]}1 p`).html('&#9812');
                }
             }
           }
         }
       }
     }
  }

  var makeHorde = function() {
    $('#a8 p, #h8 p').html('&#9820');
    $('#b8 p, #g8 p').html('&#9822');
    $('#c8 p, #f8 p').html('&#9821');
    $('#d8 p').html('&#9819');
    $('#e8 p').html('&#9818');
    for (var i = 0; i < 8; i++){
        $(`#${chessLetters[i]}7 p`).html('&#9823');
    }
    for (var i = 0; i < 8; i++){
        $(`#${chessLetters[i]}1 p`).html('&#9817');
        $(`#${chessLetters[i]}2 p`).html('&#9817');
        $(`#${chessLetters[i]}3 p`).html('&#9817');
        $(`#${chessLetters[i]}4 p`).html('&#9817');
    }
    $(`#${chessLetters[1]}5 p`).html('&#9817');
    $(`#${chessLetters[2]}5 p`).html('&#9817');
    $(`#${chessLetters[5]}5 p`).html('&#9817');
    $(`#${chessLetters[6]}5 p`).html('&#9817');


      for (var i = 0; i < 8; i++) {
         game.whitePieces.push(new Pawn(`${chessLetters[i]}2`, 'white'))
         game.blackPieces.push(new Pawn(`${chessLetters[i]}7`, 'black'))

        if(i === 0 || i === 7) {
           game.blackPieces.push(new Rook(`${chessLetters[i]}8`, 'black'))
        }
        if(i === 1 || i === 6) {
           game.blackPieces.push(new Knight(`${chessLetters[i]}8`, 'black'))
        }
        if(i === 2 || i === 5) {
           game.blackPieces.push(new Bishop(`${chessLetters[i]}8`, 'black'))
        }
        if(i === 3) {
          game.blackPieces.push(new Queen(`${chessLetters[i]}8`, 'black'))
        }
        if(i === 4) {
          game.whitePieces.push(new King(`${chessLetters[i]}10`, 'white'))
          game.blackPieces.push(new King(`${chessLetters[i]}8`, 'black'))
        }
      }
      for (var i = 0; i < 8; i++) {
         game.whitePieces.push(new Pawn(`${chessLetters[i]}1`, 'white'))
         game.whitePieces.push(new Pawn(`${chessLetters[i]}3`, 'white'))
         game.whitePieces.push(new Pawn(`${chessLetters[i]}4`, 'white'))
       }
       game.whitePieces.push(new Pawn(`${chessLetters[1]}5`, 'white'))
       game.whitePieces.push(new Pawn(`${chessLetters[2]}5`, 'white'))
       game.whitePieces.push(new Pawn(`${chessLetters[5]}5`, 'white'))
       game.whitePieces.push(new Pawn(`${chessLetters[6]}5`, 'white'))
    }

    var makePeasants = function() {
      $('#b8 p, #g8 p').html('&#9822');
      $('#c8 p, #f8 p').html('&#9822');
      $('#e8 p').html('&#9818');
      $(`#${chessLetters[4]}7 p`).html('&#9823');
      $('#e1 p').html('&#9812');

      for (var i = 0; i < 8; i++){
          $(`#${chessLetters[i]}2 p`).html('&#9817');
      }

        for (var i = 0; i < 8; i++) {
           game.whitePieces.push(new Pawn(`${chessLetters[i]}2`, 'white'))

          if(i === 1 || i === 2 || i === 5 || i === 6) {
             game.blackPieces.push(new Knight(`${chessLetters[i]}8`, 'black'))
          }
          if(i === 4) {
             game.blackPieces.push(new Pawn(`${chessLetters[i]}7`, 'black'))
             game.whitePieces.push(new King(`${chessLetters[i]}1`, 'white'))
             game.blackPieces.push(new King(`${chessLetters[i]}8`, 'black'))
          }
      }
    }



   var beginGame = function(){
     $('#whiteScore').text($('.player1Name').val() + ': 0');
     $('#blackScore').text($('.player2Name').val() + ': 0');
     if (chess960) {
       make960();
     }
     else if (horde){
       makeHorde();
     }
     else if (peasants){
       makePeasants();
     }
     else makeNormal();
   }()
   }
