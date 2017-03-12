var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var bot_token = "xoxb-152786402262-inLlvBeJrWW2BHZ21U5zJBsL";

var rtm = new RtmClient(bot_token);

var pg = require('pg');

var channelId = 'C0A8EN9DK';

var rowsReturned = new Promise(function(resolve, reject){
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM places', function(err, res) {
      done();
      console.log(res.rows[0]);
      resolve(res.rows);
    });
  });
});

var connOpened = new Promise(function(resolve, reject){
  rtm.on(CLIENT_EVENTS.RTM_CONNECTION_OPENED, function() {
    console.log('opened');
    resolve(true);
  });
});

var lunchHour = 20;
var lunchMinute = 45;
var onTime = new Promise(function(resolve, reject) {
  setInterval(function() {
    var now = new Date();
    console.log(now.getHours(), now.getMinutes());
    if(now.getHours() === lunchHour &&
       now.getMinutes() === lunchMinute) {
      console.log(now);
      resolve(true);
    }
  }, 1 * 5 * 1000);
});

Helper = {
  genereateMessage: function(names) {
    return ':one:Hello!\n :two:hoge \n :three: aaa';
  }
};

Promise.all([rowsReturned, connOpened, onTime]).then(
  function(results) {
    console.log(results);
    [names, _, _] = results;
    var msg = Helper.genereateMessage(names);
    var msgProm = rtm.sendMessage(msg, channelId);

    msgProm.then(function(res){
      console.log(res);
    });
  }
);

// Bot can respond to reactions, but wouldn't it be overkill?
// rtm.on(RTM_EVENTS.REACTION_ADDED, function(a, b, c){
//   console.log(a);
// });

rtm.start();
