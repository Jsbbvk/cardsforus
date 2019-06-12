
var selectedCID = -1;
var cardczarCID = -1;
var cardczarID = 0;
var nameID = 1;
var playerName = "";
var roomID = "";

var isCardCzar = false;
var isReadyNextRound = false;

var playerHand = [];

const CHOOSING_CARD = 0;
const WAITING_ROOM = 1;
const WINNER_DISPLAY = 2;
var gameState;

var numP = 0;

$("#confirmCard").on('click', function(e) {
  e.preventDefault();
  if (selectedCID==-1) return;

  //removing selected card
  for (var i =0; i < playerHand.length; i++) {
    if (playerHand[i] == selectedCID) playerHand.splice(i, 1);
  }
  socket.emit('player select', roomID, nameID, selectedCID, function() {
      hidePlayerCards(function() {
          displayWaitingCards();
      });
  });
});

$("#czarConfirmCard").on('click', function(e) {
    e.preventDefault();
    if (cardczarCID==-1 || cardczarID==0) return;
    socket.emit('set winner', roomID, {cid: cardczarCID, id: cardczarID}, function() {
    });
});

$('#readyForNextRound').on('click', function(e) {
    e.preventDefault();
    socket.emit('set player next round', roomID, nameID);
    isReadyNextRound = true;
    $('#readyForNextRound').css('background-color', '#40d15d');
});

var menuActive = false;
$('#toggleMenuButton').on('click', function(e) {
    e.preventDefault();
    menuActive = !menuActive;
    if (menuActive) {
        $("#menu").removeClass('mSlideUp');
        $("#menu").addClass('mSlideDown');
        document.getElementById('toggleMenuButton').innerHTML = '<i class="fas fa-sort-up"></i>';
        $(this).css('top', '-3%');
    } else {
        $("#menu").removeClass('mSlideDown');
        $("#menu").addClass('mSlideUp');
        document.getElementById('toggleMenuButton').innerHTML = '<i class="fas fa-sort-down"></i>';
        $(this).css('top', '100%');
    }
});

function endGame(e) {
    e.preventDefault();
    socket.emit('end game', roomID);
}

function leave(e) {
    e.preventDefault();
    socket.emit('delete player', roomID, nameID, function() {
        isLeaving = true;
        location.reload();
    });
}

function initPlayer() {
    initCID();

    socket.emit('get players', roomID, function(pl) {
        numP = pl.length;
    });

    $("#end-game-button").unbind().on("click", endGame);
    $("#leave-game-button").unbind().on('click', leave);
    $("#menu").removeClass('mSlideDown mSlideUp');
    document.getElementById("playerScreen").style.display = "block";

    playerHand = [];
    for (var i = 0; i < 9; i++) playerHand.push(getRandomCID());
    socket.emit('get card czar', roomID, function(pp) {
        if(nameID==pp.id) {
            isCardCzar = true;
            displayQuestionCard(function(){displayWaitingCards();});
        } else {
            displayQuestionCard(function(){displayPlayerCards();});
        }
    });

    socket.on('game ended', function() {
        backToWaitingRoom(function() {
          displayPrevScore = true;
          displayWaitingRoom();
        });
    });
}

function backToWaitingRoom(cb) {
    menuActive = false;
    if ($('#menu').hasClass('mSlideDown')) {
        $("#menu").removeClass('mSlideDown');
        $("#menu").addClass('mSlideUp');
    }
    document.getElementById('toggleMenuButton').innerHTML = '<i class="fas fa-sort-down"></i>';
    $('#toggleMenuButton').css('top', '100%');

    socket.removeAllListeners('game ended');
    socket.removeAllListeners('card added');
    socket.removeAllListeners('winner chosen');
    socket.removeAllListeners('card czar ready');
    socket.removeAllListeners('next round addition');
    socket.removeAllListeners('ready for next round');
    socket.removeAllListeners('start next round');

    $('#cardczarDisplay').removeClass('fadeIn fadeOut');
    $('#cardDisplayText').removeClass('fadeIn fadeOut');

    $('#playerScreen').fadeOut(1000, function() {
        selectedCID = -1;
        cardczarCID = -1;
        cardczarID = 0;
        isCardCzar = false;
        isReadyNextRound = false;

        $('#readyForNextRound').css('display', 'none');
        $('#readyForNextRound').css('border', '1px solid black');

        $('#cardP').css('display', 'none');
        $('#answerC').css('display', 'none');
        $('#readyForNextRound').css('background-color', '#99f473');
        $('#questionCard').css('display', 'none');
        $('#cardczarDisplay').css('display', 'none');
        $('#cardDisplayText').css('display', 'none');
        $('#czarConfirmCard').css('display', 'none');
        $('#confirmCard').css('display', 'none');

        document.getElementById("answerC").innerHTML = "";
        document.getElementById("cardP").innerHTML = "";

        document.body.style.backgroundColor = "white";
        document.body.style.color = "black";
        $('#playerScreen').css('display', 'none');
        cb&&cb();
    });
}

function nextRound() {
    document.getElementById("playerScreen").style.display = "block";
    while (playerHand.length < 9) {
      playerHand.push(getRandomCID());
    }
    socket.emit('get card czar', roomID, function(pp) {
        if(nameID==pp.id) {
            isCardCzar = true;
            $("#confirmCard").css("display", "none");
            document.getElementById("answerC").style.display = "none";
            $('#cardczarDisplay').css('color', 'black');
            $('#cardczarDisplay').css('background-color', 'white');
            $('#menu').css('background-color', 'black');
            $('#menu').css('border', '1px solid white');
            $('#menu').fadeIn(400);
            $('#menu').css('display', 'block');
            displayQuestionCard(function(){displayWaitingCards();});
        } else {
            $('#cardczarDisplay').css('color', 'white');
            $('#cardczarDisplay').css('background-color', 'black');
            $('#menu').css('background-color', 'white');
            $('#menu').css('border', '1px solid black');
            $('#menu').fadeIn(400);
            $('#menu').css('display', 'block');
            displayQuestionCard(function(){displayPlayerCards();});
        }
    });
}

function displayQuestionCard(cb) {
    //assuming that questionCard is initially displayed as none
    socket.emit('get question card', roomID, function(q) {
        $('#questionText').text(q);
        $('#questionCard').fadeIn(500, function() {
            $('#questionCard').css('display', 'block');
            cb&&cb();
        });
    });
}

function displayPlayerCards(cb) {
    if (!isCardCzar) {
        $('#cardczarDisplay').css('color', 'white');
        $('#cardczarDisplay').css('background-color', 'black');
        $('#menu').css('background-color', 'white');
        $('#menu').css('border', '1px solid black');
        $('#menu').fadeIn(400);
        $('#menu').css('display', 'block');
    }
    gameState = CHOOSING_CARD;
    selectedCID = -1;
    $("#confirmCard").css("background-color", "white");
    $("#confirmText").text("Select Card");

    socket.emit('get card czar', roomID, function(cc) {
        $("#answerC").css("display", "block");
        function handleAnimationEnd() {

            $("#cardDisplayText").css("display", "block");
            $("#cardDisplayText").text("Your Cards");
            $("#cardDisplayText").removeClass('fadeOut');
            $("#cardDisplayText").addClass('fadeIn');

            $("#cardczarDisplay").css('display', 'block');
            $("#cardczarDisplay").text((cc.name)+" is the Card Czar");
            $("#cardczarDisplay").removeClass('fadeIn');
            $("#cardczarDisplay").addClass('fadeIn');

            $("#confirmCard").css("display", "block");
            $("#confirmCard").removeClass("fadeIn fadeOut");
            $("#confirmCard").addClass("fadeIn");



            $('#answerC').removeClass('fadeIn');
            document.getElementById("answerC").removeEventListener('animationend', handleAnimationEnd);
            var s = "";
            var co = 0;
            for (var c of playerHand) {
                var ca = getCardById(c);
                s += "<div class=\"aCard animated slideInRight\" data-cid='"+c+"' style='animation-delay:"+(co*50+50)+"ms'>" +
                    ca+"</div>";
                co++
            }
            document.getElementById("answerC").innerHTML = s;


            $(".aCard").on("click", function(e) {
                e.preventDefault();
                if (!$(this).hasClass("aCardHover")) {

                    for (var c of $(".answerCards").children(".aCard")) {
                        $(c).removeClass("aCardHover");
                    }
                    $(this).addClass("aCardHover");
                    selectedCID = $(this).attr("data-cid");
                    $("#confirmCard").css("background-color", "#bdffbd");
                    $("#confirmText").text("Confirm");
                }
                else {
                    $(this).removeClass("aCardHover");
                    $("#confirmCard").css("background-color", "white");
                    $("#confirmText").text("Select Card");
                    selectedCID = -1;
                }
            });

            cb&&cb();
        }
        document.getElementById("answerC").addEventListener('animationend', handleAnimationEnd);
        $('#answerC').addClass('fadeIn');
        $("#cardDisplayText").addClass('fadeOut');
    });

}

function hidePlayerCards(cb) {

    document.getElementById("answerC").classList.add('fadeOut');
    $("#confirmCard").addClass('fadeOut');

    function handleAnimationEnd() {
        document.getElementById("answerC").classList.remove('fadeOut');
        document.getElementById("answerC").removeEventListener('animationend', handleAnimationEnd);
        document.getElementById("answerC").style.display = "none";
        $("#confirmCard").css("display", "none");
        $("#confirmCard").removeClass("fadeOut fadeIn");
        cb&&cb();
    }
    document.getElementById("answerC").addEventListener('animationend', handleAnimationEnd)
}

function displayWaitingCards(cb) {
    gameState = WAITING_ROOM;
    cardczarCID = -1;
    $("#cardP").css("display", "block");
    if (isCardCzar) {
        $("#confirmCard").css("display", "none");
        document.getElementById("answerC").style.display = "none";
        $('#cardczarDisplay').css('color', 'black');
        $('#cardczarDisplay').css('background-color', 'white');
        $('#menu').css('background-color', 'black');
        $('#menu').css('border', '1px solid white');
        $('#menu').fadeIn(400);
        $('#menu').css('display', 'block');
        $("#czarConfirmCard").css("background-color", "white");
    }

    function handleAnimationEnd() {

        $('#cardP').removeClass('fadeIn');
        socket.emit('get card czar', roomID, function(pp) {

            $("#cardDisplayText").css("display", "block");
            $("#cardDisplayText").text("Card Pile");
            $("#cardDisplayText").removeClass('fadeOut');
            $("#cardDisplayText").addClass('fadeIn');


            $("#cardczarDisplay").css('display', 'block');
            $("#cardczarDisplay").text(((isCardCzar)?"You are the Card Czar":(pp.name)+" is the Card Czar"));

            $("#cardczarDisplay").removeClass('fadeIn');
            $("#cardczarDisplay").addClass('fadeIn');


            $('#cardP').removeClass('fadeIn');
            document.getElementById("cardP").removeEventListener('animationend', handleAnimationEnd);


            displayWaitingCardsList(function(){
                if (isCardCzar) {
                    socket.emit('can card czar choose', roomID, function(res) {
                        if (res) {
                            $("#czarConfirmText").text("Select Winner");
                            $(".wCard").unbind().on("click", function(e) {
                                e.preventDefault();
                                $('#czarConfirmCard').removeClass('fadeOut fadeIn');
                                $("#czarConfirmText").text("Select Winner");
                                if ($(this).attr("data-cid") != -1) {
                                    if (!$(this).hasClass("aCardHover")) {
                                        for (var c of $(".cardPile").children(".wCard")) {
                                            $(c).removeClass("aCardHover");
                                        }
                                        $(this).addClass("aCardHover");
                                        cardczarCID = $(this).attr("data-cid");
                                        cardczarID = $(this).attr('data-id');
                                        $("#czarConfirmCard").css("background-color", "#bdffbd");
                                        $("#czarConfirmText").text("Confirm");
                                    } else {
                                        $(this).removeClass("aCardHover");
                                        $("#czarConfirmCard").css("background-color", "white");
                                        $("#czarConfirmText").text("Select Winner");
                                        cardczarCID = -1;
                                        cardczarID = 0;
                                    }
                                }
                            });
                        }
                    });
                }
                cb&&cb();
            });


            if (isCardCzar) {
                document.body.style.backgroundColor = "black";
                document.body.style.color = "white";
                $("#cardDisplayText").text("Choose the BEST card");
                $('#czarConfirmCard').css('display', 'block');
                $('#czarConfirmCard').removeClass('fadeOut fadeIn');
                $('#czarConfirmCard').addClass('fadeIn');
                $("#czarConfirmText").text("Waiting For Cards");

                socket.on('card czar ready', function() {
                    $("#czarConfirmText").text("Select Winner");
                    $(".wCard").unbind().on("click", function(e) {
                        e.preventDefault();
                        $('#czarConfirmCard').removeClass('fadeOut fadeIn');
                        $("#czarConfirmText").text("Select Winner");
                        if ($(this).attr("data-cid") != -1) {
                            if (!$(this).hasClass("aCardHover")) {
                                for (var c of $(".cardPile").children(".wCard")) {
                                    $(c).removeClass("aCardHover");
                                }
                                $(this).addClass("aCardHover");
                                cardczarCID = $(this).attr("data-cid");
                                cardczarID = $(this).attr('data-id');
                                $("#czarConfirmCard").css("background-color", "#bdffbd");
                                $("#czarConfirmText").text("Confirm");
                            } else {
                                $(this).removeClass("aCardHover");
                                $("#czarConfirmCard").css("background-color", "white");
                                $("#czarConfirmText").text("Select Winner");
                                cardczarCID = -1;
                                cardczarID = 0;
                            }
                        }
                    });
                });
            }

            socket.on('card added', function(pl) {
                jQuery('#wcN-'+pl.id).fadeOut(400, function() {
                    $(this).text(getCardById(pl.cid));
                    $(this).parent().attr('data-cid', pl.cid);
                }).fadeIn(400, function() {
                });
            });

            socket.on('winner chosen', function(pl) {
                displayWinner();
            });

            socket.emit('set player ready', roomID, nameID);
        });


    }
    document.getElementById("cardP").addEventListener('animationend', handleAnimationEnd);
    $('#cardP').addClass('fadeIn');
    $("#cardDisplayText").addClass('fadeOut');

}


function displayWaitingCardsList(cb) {
    socket.emit('get card czar', roomID, function(cc) {
        socket.emit('get players', roomID, function(pl) {
            var s = "";
            var co = 0;

            var j = [];
            for (var i=0;i<pl.length;i++)j.push(i);
            j.sort(()=>(Math.random()-0.5));

            var a = [];
            var aa = 0;
            for (var c of pl){
                a[j[aa]] = c;
                aa++;
            }

            for (var c of a) {
                if (c.id != cc.id) {
                    var ca = getCardById(c.cid);
                    if (c.id == nameID) {
                        if (!isCardCzar) {
                            s += "<div class=\"wCard animated slideInRight\"  data-cid='" + c.cid + "' data-id='"+c.id+"' style='animation-delay:" + (co * 50 + 50) + "ms'>" +
                                "<span class=\"wCard-name\" style='background-color:#ffbf8e;'>" + c.name + " (You)</span><br><br>" +
                                "<span id='wcN-" + c.id + "'>" + ca + "</span></div>";
                        }
                    } else {
                        s += "<div class=\"wCard animated slideInRight\" data-cid='" + c.cid + "' data-id='"+c.id+"' style='animation-delay:" + (co * 50 + 50) + "ms'>" +
                            "<span class=\"wCard-name\">[Hidden]</span><br><br>" +
                            "<span id='wcN-" + c.id + "'>" + ca + "</span></div>";
                    }
                    co++;
                }
            }
            document.getElementById("cardP").innerHTML = s;
            cb&&cb();
        });
    });
}

//TODO make some animation for adding the point to the player
//have the +1 display fade in, then translate left (as if it's going into the player's name). then update the scoreboard
function displayWinner() {
    socket.emit('set game state', roomID, WINNER_DISPLAY);
    updateScoreboard();
    socket.emit('get winner', roomID, function(w) {
        gameState = WINNER_DISPLAY;
        socket.removeAllListeners('card added');
        socket.removeAllListeners('winner chosen');
        socket.removeAllListeners('card czar ready');

        $("#cardDisplayText").addClass('fadeOut');
        if (isCardCzar) {
            $('#czarConfirmCard').removeClass('fadeOut fadeIn');
            $('#czarConfirmCard').addClass('fadeOut');
        }
        $('#cardP').fadeOut(600, function() {
            $("#cardDisplayText").text("Winner");
            $("#cardDisplayText").removeClass('fadeOut');
            $("#cardDisplayText").addClass('fadeIn');


            $('#czarConfirmCard').css('display', 'none');
            $('#czarConfirmCard').removeClass('fadeOut fadeIn');

            var s = "";

            s += "<div class=\"wCard\" data-cid='"+w.cid+"' " +
                "style='background-color:#d1f2d1; "+((isCardCzar)?'color:black;':'')+"'>" +
                "<span class=\"wCard-name\""+((w.id==nameID)?"style='background-color:#ffbf8e;'":"")+">"
                +w.name+((w.id==nameID)?" (You)":"")+"</span><br><br>" +
                "<span>"+getCardById(w.cid)+"</span></div>";

            socket.emit('get card czar', roomID, function(cc) {
                socket.emit('get players', roomID, function(pl) {
                    for (var c of pl) {
                        if (c.id==cc.id)continue;
                        if (c.id==w.id)continue;

                        var ca = getCardById(c.cid);
                        if (c.id==nameID) {
                            s += "<div class=\"wCard\" data-cid='"+c.cid+"'>" +
                                "<span class=\"wCard-name\" style='background-color:#ffbf8e;'>"+c.name+" (You)</span><br><br>" +
                                "<span>"+ca+"</span></div>";
                        } else
                            s += "<div class=\"wCard\" data-cid='"+c.cid+"'>" +
                                "<span class=\"wCard-name\">"+c.name+"</span><br><br>" +
                                "<span>"+ca+"</span></div>";
                    }
                    document.getElementById("cardP").innerHTML = s;
                    displayNextRound();
                });
            });

        }).fadeIn(600, function() {

        });

        $('#sb-'+w.id).text(w.points);
    });
}

function displayNextRound() {
    gameState = CHOOSING_CARD;
    socket.emit('get players', roomID, function(pl) {

        if (isCardCzar) {
            $('#readyForNextRound').css('border', '1px solid white');
        }
        $('#readyForNextRound').css('display', 'block');
        $('#readyForNextRound').removeClass('fadeIn fadeOut');
        $('#readyForNextRound').addClass('fadeIn');

        var c = 0;
        for (var p of pl) {
            if (p.nextRound) c++;
        }
        $('#readyForNextRoundText').text(((isReadyNextRound)?"Ready":"Next Round?")+" " + c + "/" + pl.length);

        socket.on('next round addition', function(numReady, tPlayers) {
            $('#readyForNextRoundText').text(((isReadyNextRound)?"Ready":"Next Round?")+" " + numReady + "/" + tPlayers);
        });
    });

    socket.on('ready for next round', function() {
        socket.removeAllListeners('next round addition'); socket.removeAllListeners('ready for next round');
        socket.on('start next round', function() {
            socket.removeAllListeners('start next round');
            resetScreen(function(){
                $('#playerScreen').css('display', 'block');
                nextRound();
            });
        });
        if (isCardCzar) socket.emit('next round', roomID);
    });
}

function resetScreen(cb) {
    $('#cardczarDisplay').removeClass('fadeIn fadeOut');
    $('#cardDisplayText').removeClass('fadeIn fadeOut');

    $('#playerScreen').fadeOut(1000, function() {
        selectedCID = -1;
        cardczarCID = -1;
        cardczarID = 0;
        isCardCzar = false;
        isReadyNextRound = false;

        $('#readyForNextRound').css('display', 'none');
        $('#readyForNextRound').css('border', '1px solid black');

        $('#cardP').css('display', 'none');
        $('#answerC').css('display', 'none');
        $('#readyForNextRound').css('background-color', '#99f473');
        $('#questionCard').css('display', 'none');
        $('#cardczarDisplay').css('display', 'none');
        $('#cardDisplayText').css('display', 'none');
        document.getElementById("answerC").innerHTML = "";
        document.getElementById("cardP").innerHTML = "";

        document.body.style.backgroundColor = "white";
        document.body.style.color = "black";
        cb&&cb();
    });
}
