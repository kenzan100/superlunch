var IncomingWebhook = require('@slack/client').IncomingWebhook;
var url = process.env.SLACK_WEBHOOK_URL;

var webhook = new IncomingWebhook(url);

var pg = require('pg');
var moment = require('moment');

var rowsReturned = new Promise(function(resolve, reject){
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var query = 'SELECT * from places ORDER BY RANDOM()';
    client.query(query, function(err, res) {
      done();
      console.log(res.rows[0]);
      resolve(res.rows);
    });
  });
});

var lunchHour = process.env.LUNCH_HOUR || 20;
var lunchMinute = process.env.LUNCH_MINUTE || 45;
var lunchTime = moment().hours(lunchHour).minutes(lunchMinute);
var onTime = new Promise(function(resolve, reject) {
  setInterval(function() {
    console.log('lunch:', lunchTime, 'now:', moment());
    if(moment().isAfter(lunchTime)) {
      resolve(true);
    }
  }, 1 * 10 * 1000);
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

Promise.all([rowsReturned, onTime]).then(
  function(results) {
    [names, _, _] = results;
    var msg = Helper.genereateMessage(names);
    webhook.send(msg, function(err, res){
      console.log('err', err);
      console.log('res', res);
    });
  }
);

// for Heroku web dyno r10 reason, we explictly open the port
var express = require('express');
var app = express();
app.listen((process.env.PORT || 5000), function(){
  console.log('express has started');
});
app.get('/ping', function(req,res){
  res.send('pong');
});
