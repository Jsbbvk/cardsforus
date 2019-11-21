
var cardCID;

var currentDeckPack = [];


function initCID(cb) {
	socket.emit('get white cards', roomID, function(cs) {
		currentDeckPack = cs.slice();
		cardCID = [];
		for (var i = 0; i < cs.length; i++) {
			cardCID[i] = i;
		}

		cardCID.sort(function () {
			return Math.random() - 0.5;
		});

		var locArr = JSON.parse(sessionStorage.getItem("prevCards"));
		if (locArr!=null && Array.isArray(locArr)) {
			for (var i = 0; i < cardCID.length; i++) {
				if (locArr.includes(cardCID[i])) {
					cardCID.splice(i, 1);
					i--;
				}
			}
		}
		cb&&cb();
	});

}


function getRandomCID() {
    if (cardCID.length <=0) {
        initCID();
    }
		var c = cardCID.pop();
		var locArr = JSON.parse(sessionStorage.getItem("prevCards"));
		if (locArr==null || !Array.isArray(locArr)) {
				sessionStorage.setItem("prevCards", JSON.stringify([c]));
		} else {
				if (!locArr.includes(c)){
						locArr.push(c);
						sessionStorage.setItem("prevCards", JSON.stringify(locArr));
				}
		}
    return c;
}

function getCardById(id) {
    if (id==-1) return "Waiting for card...";
    return currentDeckPack[id];
}
