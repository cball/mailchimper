## Mailchimper
Mailchimper is a simple Express app to subscribe users to a Mailchimp email list based on a set of whitelisted domains.

### Getting Started
Mailchimper is built to deploy on Heroku but should be easy to run anywhere. Right now, it only supports xhr requests since that's what I needed initially.

Add a few ENV variables:
```
MAILCHIMP_KEY: key from your Mailchimp account page
ALLOWED_DOMAINS: comma separated list of domains (example.com, foo.org)
USE_DOUBLE_OPTIN:  optional flag to control whether a double opt-in confirmation message is sent, defaults to true
```

### Find your List ID
To find your list ID, uncomment the API call to get list your lists (https://github.com/cball/mailchimper/blob/master/index.js#L28-L36).
Unfortunately the ID shown in the web URL is different and can't be used.

### From your signup form:
```javascript
$.post('<your url>/subscribe', { id: <your list id>, email: <email to subscribe> });
```

### Healthcheck
This app also has a healthcheck route which can be pinged periodically to keep Heroku Dynos alive.
