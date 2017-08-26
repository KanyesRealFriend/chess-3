(function(){
  var normal = true;
  var playingComp = false;

  $('.back').on('click', function(){
    $('#play_comp').show();
    $('#play_2pp').show();
    $('#compMenu').hide();
    $('#pplMenu').hide();
  })

  $('#play_2pp').on('click', function(){
    $('#play_comp').hide();
    $('#play_2pp').hide();
    $('#pplMenu').show();
    // return play_2pp();
  })

  $('#play_comp').on('click', function(){
    $('#play_comp').hide();
    $('#play_2pp').hide();
    $('#compMenu').show();
    playingComp = true;

    // $('.startGame').show();
    // $('.startGameMenu').hide();
    // return playComp();
  })

  $('.start').on('click', function(){
    $('.startGame').show();
    $('.startGameMenu').hide();
    if (playingComp === true){
      playComp();
      // makeBoard();
      // beginGame();

    }
      else {
        play_2pp();
        // makeBoard();
        // beginGame();
      }
  })

  $("#difficulty").slider();
  $("#difficulty").on("slide", function(slideEvt) {
  var sliderVal =	slideEvt.value;
  switch(sliderVal){
    case 1:
      $("#ex6SliderVal").text('Toddler');
      break;
    case 2:
      $("#ex6SliderVal").text('Average Joe');
      break;
    case 3:
      $("#ex6SliderVal").text('Literally Gary Kasparov')
      break;
  }
  });

  $('.playNormal1').change(function(){
    normal = ($(this).prop('checked'));
    if (normal){
      $('.playHorde1').bootstrapToggle('off')
      $('.play960').bootstrapToggle('off');
    }
  })

  $('.playNormal2').change(function(){
    normal = ($(this).prop('checked'));
    if (normal){
      $('.playHorde2').bootstrapToggle('off')
      $('.play96').bootstrapToggle('off');
    }
  })

  $('.play960').change(function() {
    chess960 = ($(this).prop('checked'));
    if (chess960) {
      $('.playHorde1').bootstrapToggle('off')
      $('.playNormal1').bootstrapToggle('off')
      $('.playPeasants1').bootstrapToggle('off')
    }
  })

  $('.play96').change(function() {
    console.log('asdf');
    chess96 = ($(this).prop('checked'));
    if (chess96){
      $('.playHorde2').bootstrapToggle('off')
      $('.playNormal2').bootstrapToggle('off')
      $('.playPeasants2').bootstrapToggle('off')
    }
  })

  $('.timed1').change(function() {
    timed1 = ($(this).prop('checked'));
  })

  $('.timed2').change(function() {
    timed2 = ($(this).prop('checked'));
  })

$('.playHorde1').change(function(){
  horde = ($(this).prop('checked'));
  if (horde) {
    $('.playNormal1').bootstrapToggle('off')
    $('.play960').bootstrapToggle('off');
    $('.playPeasants1').bootstrapToggle('off')
  }
})

$('.playHorde2').change(function(){
  horde = ($(this).prop('checked'));
  if (horde) {
    $('.play96').bootstrapToggle('off');
    $('.playNormal2').bootstrapToggle('off')
    $('.playPeasants2').bootstrapToggle('off')
  }
})

$('.playPeasants1').change(function(){
  peasants = ($(this).prop('checked'));
  if (peasants) {
    $('.play960').bootstrapToggle('off');
    $('.playNormal1').bootstrapToggle('off')
    $('.playHorde1').bootstrapToggle('off')
  }
})

$('.playPeasants2').change(function(){
  peasants = ($(this).prop('checked'));
  if (peasants) {
    $('.play96').bootstrapToggle('off');
    $('.playNormal2').bootstrapToggle('off')
    $('.playHorde2').bootstrapToggle('off')
  }
})


})()
