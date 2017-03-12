var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var bot_token = process.env.BOT_TOKEN;
var rtm = new RtmClient(bot_token);

var pg = require('pg');
var moment = require('moment');

var channelId = process.env.CHANNEL_ID;

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
var lunchTime = moment().hours(lunchHour).minutes(lunchMinute);
var onTime = new Promise(function(resolve, reject) {
  setInterval(function() {
    if(moment().isAfter(lunchTime)) {
      console.log(moment());
      resolve(true);
    }
  }, 1 * 5 * 1000);
});

NUMBERS_MAP = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten'
};

Helper = {
  genereateMessage: function(rows) {
    namesWithEmoji = rows.map(function(row, i) {
      return ':' + NUMBERS_MAP[i+1] + ': ' + row.name;
    });
    return namesWithEmoji.join('\n');
  }
};

Promise.all([rowsReturned, connOpened, onTime]).then(
  function(results) {
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
