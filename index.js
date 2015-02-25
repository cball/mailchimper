// set variables for environment
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('lodash');
var url = require('url');
var MailChimpAPI = require('mailchimp').MailChimpAPI;
var allowedDomains = (process.env.ALLOWED_DOMAINS || '').split(/,\s*/);

app.use(bodyParser.urlencoded({ extended: false }));

try {
  var api = new MailChimpAPI(process.env.MAILCHIMP_KEY, { version : '2.0' });
} catch (error) {
  console.log(error.message);
}

// Grab list id from here:
// api.call('lists', 'list', function(error, data) {
//   if (error) {
//     console.log(error.message);
//   }
//   else {
//     console.log(JSON.stringify(data));
//   }
// });

app.get('/healthcheck', function(req, res) {
  res.send('hi');
});

app.post('/subscribe', function(req, res) {

  if (!isValidDomain(req)) {
    console.log('sucka.');
    return res.status(404).end();
  }

  res.header('Access-Control-Allow-Origin', domainForHeader(req));

  var params = {
    // the mailchimp list id from above
    id: req.body.id,
    email: { email: req.body.email },
    double_optin: false,
    send_welcome: true
  }
  console.log(params)

  if (_.isEmpty(params.id) || _.isEmpty(params.email.email)) {
    console.log('id and email are required.');
    return res.status(422).send('email and list id are required');
  }

  api.call('lists', 'subscribe', params, function(error, data) {
    if (error) {
      console.log(error.message);
      res.status(422).send(error.message);
    }
    else {
      console.log(JSON.stringify(data));
      res.status(200).send();
    }
  });
});

var isValidDomain = function(req) {
  var hostname = parsedReferrer(req).hostname;
  var valid = _.contains(allowedDomains, hostname);
  console.log(hostname + ' is allowed to send!');

  return valid;
};

var parsedReferrer = function(req) {
  return url.parse(req.get('referrer'));
}

var domainForHeader = function(req) {
  var parsedUrl = parsedReferrer(req);
  return parsedUrl.protocol + '//' + parsedUrl.host;
}

app.listen(4000);
console.log('server is running');
