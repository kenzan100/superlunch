var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;

var bot_token = "xoxb-152786402262-inLlvBeJrWW2BHZ21U5zJBsL";

var rtm = new RtmClient(bot_token);

rtm.on(CLIENT_EVENTS.AUTHENTICATED, function(rtmStartData) {
  console.log(rtmStartData.channels.map(function(c){ return [c.name, c.id] }));
  console.log('Logged in');
});

var randomChannelId = 'C06TNGLTU';
rtm.on(CLIENT_EVENTS.RTM_CONNECTION_OPENED, function() {
  rtm.sendMessage('Hello!', randomChannelId);
});

rtm.start();
