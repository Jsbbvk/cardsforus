


var cardDeck = [
    "An honest cop with nothing left to lose and a drug cartel.",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    '7',
    '8',
    '9',
    '10',
    '11',
    '12'
];

var cardCID;

function initCID() {
    cardCID = [];
    for (var i = 0; i < cardDeck.length; i++) {
        cardCID[i] = i;
    }
    cardCID.sort(function () {
        return Math.random() - 0.5;
    });
}


function getRandomCID() {
    if (cardCID.length <=0) {
        initCID();
    }
    return cardCID.pop();
}

function getCardById(id) {
    if (id==-1) return "Waiting for card...";
    return cardDeck[id];
}


initCID();