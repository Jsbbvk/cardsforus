
var qcardDeck = ['Gang Gang', 'AHHHHH'];

var qcardDeckSFS = [];


var qcardCID;
var pack = "traditional";

module.exports = {
    getCardById: function(cid) {
        if (cid < 0) return "";
        if (pack == "traditional") return qcardDeck[cid];
        else if (pack=="traditional-sfs") return qcardDeckSFS[cid];
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