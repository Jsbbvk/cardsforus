

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var qCard = require('./js/qCard.js');

app.use('/assets', express.static('assets'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

const CHOOSING_CARD = 0;
const WAITING_ROOM = 1;
const WINNER_DISPLAY = 2;

class Room {
    constructor(roomid) {
        this.roomid = roomid;
        this.startingGame = false;
        this.gamestart = false;
        this.winner = {
            name:"",
            id: 0,
            cid: 0
        };
        this.cardczar = 1;
        this.player = [];
        this.qcid = -1;
        this.cardpack = 'traditional';
        this.gamestate = CHOOSING_CARD;
    }
    addPlayer(p) {this.player.push(p);}
    getPlayerById(id) {
        for (var p of this.player) {
            if (p.id == id) return p;
        }
        return null;
    }
}

class Player {
    constructor(name, id, roomid) {
        this.roomid = roomid;
        this.id = id;
        this.name = name;
        this.cid = -1;
        this.points = 0;
        this.isready = false;
        this.nextRound = false;
    }
}

var rooms = {};

 io.on('connection', function(socket) {
    //console.log("connected");
     socket.emit('get room id', function(id){
         if (id!="") {
             if (rooms[id] != null) {
                 socket.join(id);
                 socket.emit('display current view', rooms[id].gamestart);
             }
         }
     });

    socket.on('disconnect', function(){
     //console.log('user disconnected');
    });

    socket.on('join room', function(roomid, name, callback){
     if (rooms[roomid]==null) {
         callback&&callback("null", 0);
         return;
     }
     if (rooms[roomid].gamestart) {
         callback&&callback("started", 0);
         return;
     }
     if (rooms[roomid].player.length > 10) {
         callback&&callback("full", 0);
         return;
     }

     var numPlayers = rooms[roomid].player.length+1;
     socket.join(roomid);
     rooms[roomid].addPlayer(new Player(name, numPlayers, roomid));
     callback&&callback("success", numPlayers);
     io.to(roomid).emit("update players");
    });

    socket.on('create room', function(roomid, name, callback) {

     if (rooms[roomid]!=null) {
         callback&&callback("taken");
         return;
     }

     var ro = new Room(roomid);
     ro.addPlayer(new Player(name, 1, roomid));
     rooms[roomid] = ro;
     socket.join(roomid);
     callback && callback("success");
    });

    socket.on('start game', function(roomid) {
        if (rooms[roomid]==null)return;
        if (rooms[roomid].player.length < 3) return;
        if (rooms[roomid].startingGame) return;
        rooms[roomid].startingGame = true;
        rooms[roomid].gamestate = CHOOSING_CARD;
        rooms[roomid].gamestart = true;
        for (var i = 0; i < rooms[roomid].player.length; i++) {
          rooms[roomid].player[i].points = 0;
        }
        rooms[roomid].cardczar = parseInt(rooms[roomid].player.length * Math.random())+1;
        qCard.initQCard(rooms[roomid].cardpack);
        rooms[roomid].qcid = qCard.getRandomCID();
        io.to(roomid).emit('game start');
    });

    socket.on('get card czar', function(roomid, cb) {
        if (rooms[roomid]==null)return;
        cb&&cb(rooms[roomid].player[rooms[roomid].cardczar-1]);
    });

    socket.on('delete player', function(roomid, id, callback) {
     if (rooms[roomid]==null) return;
     var pl = rooms[roomid].player;
        if (pl.length ==1) {
         delete rooms[roomid];
         callback && callback();
         return;
     }

     for (var i = id; i < pl.length; i++) {
         rooms[roomid].player[id-1].name = pl[i].name;
         rooms[roomid].player[id-1].id = pl[i].id-1;
         rooms[roomid].player[id-1].cid = pl[i].cid;
         rooms[roomid].player[id-1].points = pl[i].points;
     }
     rooms[roomid].player.splice(pl.length-1, 1);
     io.to(roomid).emit('player leave', rooms[roomid].gamestart, id);
     callback && callback();
    });

    socket.on('get players', function(roomid, cb) {
        if (rooms[roomid]==null) return;
        cb&&cb(rooms[roomid].player);
        return;
    });

    socket.on('get winner', function(roomid, cb) {
        if (rooms[roomid]==null)return;
        cb&&cb(rooms[roomid].player[rooms[roomid].winner.id-1]);
    });

    socket.on('get areCardsChosen', function(roomid, cb) {
        if (rooms[roomid]==null)return;
        var a = true;
        for (var p of rooms[roomid].player) {
            if (p.id != rooms[roomid].cardczar && p.cid == -1) {
                a = false;
            } else if (p.id != rooms[roomid].cardczar && p.isready == false) a = false;
        }
        cb&&cb(a);
    });

    socket.on('get game state', function(roomid, cb) {
        if(rooms[roomid]==null)return;
        cb&&cb(rooms[roomid].gamestate, rooms[roomid].cardczar, rooms[roomid].player.length);
    });

    socket.on('set game state', function(roomid, state) {
        if (rooms[roomid]==null)return;
        rooms[roomid].gamestate = state;
    });

    socket.on('next round', function(roomid, cb) {
        if (rooms[roomid]==null)return;
        //reset everything
        rooms[roomid].cardczar = rooms[roomid].winner.id;
        for (var i =0; i< rooms[roomid].player.length; i++) {
            rooms[roomid].player[i].cid = -1;
            rooms[roomid].player[i].isready = false;
            rooms[roomid].player[i].nextRound = false;
        }

        rooms[roomid].qcid = qCard.getRandomCID();
        rooms[roomid].gamestate = CHOOSING_CARD;
        io.to(roomid).emit('start next round');
        cb&&cb();
    });

    socket.on('set winner', function(roomid, w, cb) {
        if (rooms[roomid]==null)return;
        rooms[roomid].winner = w;
        rooms[roomid].player[w.id-1].points = rooms[roomid].player[w.id-1].points+1;
        io.to(roomid).emit('winner chosen', rooms[roomid].player[w.id-1]);
        cb&&cb();
    });

    socket.on('player select', function(roomid, id, cid, cb) {
        if (rooms[roomid]==null) return;
        rooms[roomid].player[id-1].cid = cid;
        io.to(roomid).emit('card added', rooms[roomid].player[id-1]);
        cb&&cb();
    });

    socket.on('set player ready', function(roomid, id) {
        if (rooms[roomid]==null)return;
        rooms[roomid].player[id-1].isready = true;
        var a = true;
        for (var p of rooms[roomid].player) {
            if (p.id != rooms[roomid].cardczar && p.cid == -1) {
                a = false;
            } else if (p.id != rooms[roomid].cardczar && p.isready == false) a = false;
        }
        if (a) io.to(roomid).emit('card czar ready');
    });

    socket.on('can card czar choose', function(roomid, cb) {
        if (rooms[roomid]==null)return;
        var a = true;
        for (var p of rooms[roomid].player) {
            if (p.id != rooms[roomid].cardczar && p.cid == -1) {
                a = false;
            } else if (p.id != rooms[roomid].cardczar && p.isready == false) a = false;
        }
        cb&&cb(a);
    });

    socket.on('set player next round', function(roomid, id) {
        if (rooms[roomid]==null)return;
        rooms[roomid].player[id-1].nextRound = true;

        var a = true;
        var c = 0;
        for (var p of rooms[roomid].player) {
            if (!p.nextRound) a = false;
            else c++;
        }
        io.to(roomid).emit('next round addition', c, rooms[roomid].player.length);
        if (a) io.to(roomid).emit('ready for next round');
    });

    socket.on('get room pack', function(roomid, cb) {
        if (rooms[roomid]==null)return;
        cb&&cb(rooms[roomid].cardpack);
    });

    socket.on('update game pack', function(roomid, p) {
        if (rooms[roomid]==null)return;
        rooms[roomid].cardpack = p;
        io.to(roomid).emit('update game pack', p);
    });

     socket.on('change player name', function(roomid, id, n) {
         if (rooms[roomid]==null) return;
         rooms[roomid].player[id-1].name = n;
         io.to(roomid).emit("update players");
     });

     socket.on('get question card', function(roomid, cb) {
         if (rooms[roomid]==null)return;
         cb&&cb(qCard.getCardById(rooms[roomid].qcid));
     });

     socket.on('end game', function(roomid) {
        if (rooms[roomid]==null)return;
        rooms[roomid].gamestart = false;
        rooms[roomid].startingGame = false;
        for (var i = 0; i < rooms[roomid].player.length; i++) {
            rooms[roomid].player[i].cid = -1;
            rooms[roomid].player[i].isready = false;
            rooms[roomid].player[i].nextRound = false;
        }
        io.to(roomid).emit('game ended');
     });


     socket.on('display rooms', function(pass, callback) {
         if (pass != "sup") return;
         var c = 0;
         for (var i in rooms) {
             console.log("*******");
             console.log(i);
             c++;
         }
         console.log("*******");
         console.log("Total Number of Rooms: " +c);
         callback&&callback(rooms);
         return;
     });

     socket.on('display players', function(pass, roomid, callback) {
         if (pass != "sup") return;
         if (roomid==null) return;
         console.log(rooms[roomid].player);
         callback&&callback(rooms[roomid].player);
         return;
     });

     socket.on('delete all rooms', function(pass) {
         if (pass=="sup") rooms = {};
     })
});

http.listen(8000, function(){
    console.log('listening on *:8000');
});
