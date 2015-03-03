/*
  Mailchimper: a simple Express app to subscribe users to an email list
  based on a set of whitelisted domains.

  Currently only grabs email.

  Set these required ENV variables and you'll be on your way:
    MAILCHIMP_KEY: key from your Mailchimp account page
    ALLOWED_DOMAINS: comma separated list of domains (example.com, foo.org)
    USE_DOUBLE_OPTIN:  optional flag to control whether a double opt-in confirmation message is sent, defaults to true
*/
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('lodash');
var url = require('url');
var MailChimpAPI = require('mailchimp').MailChimpAPI;
var allowedDomains = (process.env.ALLOWED_DOMAINS || '').split(/,\s*/);

app.use(bodyParser.urlencoded({ extended: true }));

try {
  var api = new MailChimpAPI(process.env.MAILCHIMP_KEY, { version : '2.0' });
} catch (error) {
  console.log(error.message);
}

// Grab list id from this api call:
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
    email: {
      email: req.body.email
    },
    merge_vars: mergeVarsFromParams(req.body),
    double_optin: shouldUseDoubleOptin(),
    send_welcome: !shouldUseDoubleOptin(),
  }

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

var shouldUseDoubleOptin = function() {
  var useIt = process.env.USE_DOUBLE_OPTIN;
  if (typeof(useIt) === 'undefined') { return true; }

  return useIt.toString() === 'true';
}

var isValidDomain = function(req) {
  var hostname = parsedReferrer(req).hostname;
  var valid = _.contains(allowedDomains, hostname);

  if (valid) {
    console.log(hostname + ' is allowed to send!');
  }

  return valid;
};

var parsedReferrer = function(req) {
  return url.parse(req.get('referrer'));
}

var domainForHeader = function(req) {
  var parsedUrl = parsedReferrer(req);
  return parsedUrl.protocol + '//' + parsedUrl.host;
}

var mergeVarsFromParams = function(params) {
  var mergeVars = params.mergeVars || {};
  var name = mergeVars.FNAME || '';
  var splitName = name.split(/\s+/);

  if (_.isEmpty(mergeVars.LNAME) && splitName.length > 1) {
    mergeVars.FNAME = _.first(splitName);
    mergeVars.LNAME = _.last(splitName);
  }

  return mergeVars;
}

app.listen(process.env.PORT || 4000);
console.log('server is running');
