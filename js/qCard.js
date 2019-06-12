
var qcardDeck = [
	"Fortnite bad. _ good.",
	"No, you're _!",
	"Hey r/all! Check out _!",
	"Why I can't sleep at night.",
	"What's that smell.",
	"I got 99 problems but _ ain't one.",
	"Maybe she's born with it. Maybe it's _.",
	"What's the next happy meal toy.",
	"Here's the church, here's the steeple, open the doors, and there is _.",
	"It's a pity kids these days are all getting involved with _.",
	"Today on Maury: \"Help! My son is _\".",
	"Alternative medicine is now embracing the curative powers of _.",
	"What's that sound?",
	"What ended my last relationship.",
	"MTV's new reality show features eight washed up celebrities living with _.",
	"I drink to forget_.",
	"I'm sorry professor. I couldn't complete my homework because _.",
	"What's Batman's guilty pleasure?",
	"This is the way the world ends... This is the way the worlds ends... Not with a bang with but with a _.",
	"What's a girl's best friend?",
	"TSA guidelines now prohibit _ on airplanes.",
	"_. That's how I want to die.",
	"In the new Disney Channel Original Movie, Hannah Montana struggles with _ for the first time.",
	"I get by with a little help from _.",
	"Dear Abby, I'm having some trouble with _ and would like your advice.",
	"Instead of coal, Santa now gives the bad children _.",
	"What's the most emo?",
	"In 1,000 years, when paper money is a distant memory, how will we pay for goods and services?",
	"A romantic candlelit dinner would be incomplete without _.",
	"_. Betcha can't have just one.",
	"White people like _.",
	"_. High five, bro.",
	"Next from J.K. Rowling: Harry Potter and the Chamber of _.",
	"Introducing Xtreme Baseball! It's like baseball, but with _!",
	"War! What is it good for?",
  "How did I lose my virginity?",
  "During sex, I like to think about _."
];

var qcardDeckSFS = [
	"Fortnite bad. _ good.",
	"No, you're _!",
	"Hey r/all! Check out _!",
	"Why I can't sleep at night.",
	"What's that smell.",
	"I got 99 problems but _ ain't one.",
	"Maybe she's born with it. Maybe it's _.",
	"What's the next happy meal toy.",
	"Here's the church, here's the steeple, open the doors, and there is _.",
	"It's a pity kids these days are all getting involved with _.",
	"Today on Maury: \"Help! My son is _\".",
	"Alternative medicine is now embracing the curative powers of _.",
	"What's that sound?",
	"What ended my last relationship.",
	"MTV's new reality show features eight washed up celebrities living with _.",
	"I drink to forget_.",
	"I'm sorry professor. I couldn't complete my homework because _.",
	"What's Batman's guilty pleasure?",
	"This is the way the world ends... This is the way the worlds ends... Not with a bang with but with a _.",
	"What's a girl's best friend?",
	"TSA guidelines now prohibit _ on airplanes.",
	"_. That's how I want to die.",
	"In the new Disney Channel Original Movie, Hannah Montana struggles with _ for the first time.",
	"I get by with a little help from _.",
	"Dear Abby, I'm having some trouble with _ and would like your advice.",
	"Instead of coal, Santa now gives the bad children _.",
	"What's the most emo?",
	"In 1,000 years, when paper money is a distant memory, how will we pay for goods and services?",
	"A romantic candlelit dinner would be incomplete without _.",
	"_. Betcha can't have just one.",
	"White people like _.",
	"_. High five, bro.",
	"Next from J.K. Rowling: Harry Potter and the Chamber of _.",
	"Introducing Xtreme Baseball! It's like baseball, but with _!",
	"War! What is it good for?"
];


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
