
var cardFile = require("../js/cards.json");
var asainFile = require("../js/asainCards.json");
var sfwFile = require("../js/sfwCards.json");
var customFile = require("../js/customCards.json");

function getArrayFromJSON(type, json) {
	var bc = [];

	if (type=="black")
		bc = json.blackCards;
	else if (type=="white")
		bc = json.whiteCards;

	var c = [];
	for (var b of bc) {
		if (b.pick==1) {
			c.push(b.text);
		} else if (b.pick==undefined) {
			c.push(b);
		}
	}
	return c;
}


var qcardDeck = getArrayFromJSON("black", cardFile).concat(getArrayFromJSON("black", customFile));

var qcardDeckSFS = getArrayFromJSON("black", sfwFile);

var qAsainDeck = getArrayFromJSON("black", asainFile);


var qcardCID;
var pack = "traditional";

module.exports = {

	getCardsFromPack: function(type, pack) {
		switch (pack) {
			case "traditional":
				return getArrayFromJSON(type, cardFile).concat(getArrayFromJSON(type, customFile));
				break;
			case "traditional-sfs":
				return getArrayFromJSON(type, sfwFile);
				break;
			case "asain":
				return getArrayFromJSON(type, asainFile);
				break;
		}
	},
    getCardById: function(cid) {
        if (cid < 0) return "";
        if (pack == "traditional") return qcardDeck[cid];
        else if (pack=="traditional-sfs") return qcardDeckSFS[cid];
				else if (pack="asain") return qAsainDeck[cid];
    },
    initQCard: function(p) {
        pack = p;
        qcardCID = [];
        var a = 0;
        switch (pack) {
            case "traditional":
                a = qcardDeck.length;
                break;
            case "traditional-sfs":
                a = qcardDeckSFS.length;
                break;
						case "asain":
								a = qAsainDeck.length;
								break;
        }

        for (var i = 0; i < a; i++) {
            qcardCID[i] = i;
        }
        qcardCID.sort(function () {
            return Math.random() - 0.5;
        });
    },
    getRandomCID: function() {
        if (qcardCID.length <=0) {
            this.initQCard(pack);
        }
        return qcardCID.pop();
    }
};
