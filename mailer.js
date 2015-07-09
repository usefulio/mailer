function resolvePropertyValues(email) {
  _.each(email, function (val, property) {
    if (_.isFunction(val))
      email[property] = val.call(this, email);
  });
  _.each(this.options, function (val, property) {
    if (_.isFunction(val))
      email[property] = val.call(this, email);
    else if (!email[property])
      email[property] = val;
  });

  return email;
}

/**
 * The default router to use for sending email
 * @property router An instance of Mailer.Router
 * @type {emailRouter}
 */

Mailer.router = new Mailer.Router();

/**
 * Create a new route for sending email
 * @method Mailer.route
 * @param {string} routeName The name of the route to create
 * @param {function|object} actionOrOptions A function to run before sending each email, or a set of default properties for each email
 *   If you pass an object there's some special behavior:
 *   ```
 *   {
 *     // pass a simple default
 *     from: 'support@example.com'
 *     // pass a function which will be evaluated
 *     to: function (existingValue, email) {
 *       return existingValue || Meteor.user().emails[0].address;
 *     }
 *   }
 *   ```
 * @param {string} parentRoute The name of the parent route, in case you have multiple email sending routines.
 */

Mailer.route = function (routeName, actionOrOptions, parentRoute) {
  parentRoute = parentRoute || 'default';
  if (_.isFunction(actionOrOptions))
    return Mailer.router.route(routeName, actionOrOptions, parentRoute);
  else
    return Mailer.router.route(routeName, resolvePropertyValues, actionOrOptions, parentRoute);
};

/**
 * Send an email using the named route, or the default route
 * @method Mailer.send
 * @param {string} routeName The route to send with
 * @param {object} email The email to send
 * @param {object} options Any additional options for sending
 * 
 */

Mailer.send = function (routeName, email, options) {
  if (!_.isString(routeName)) {
    options = email;
    email = routeName;
    routeName = 'default';
  }
  return this.router.send(routeName, email || {}, options || {});
};

if (Meteor.isServer) {
  Mailer._defaultServiceProvider = function (email) {
    Email.send(email);
    email.sent = true;
    return email;
  };
} else {
  Mailer._defaultServiceProvider = function (email) {
    console.log("You do not have an email service provider set. To enable sending call Mailer.setDefaultServiceProvider()");
    email.sent = true;
    return email;
  };
}

Mailer.setDefaultServiceProvider = function (provider) {
  Mailer._defaultServiceProvider = provider;
};

Mailer.router.route('sendViaDefaultServiceProvider', function (email) {
  return Mailer._defaultServiceProvider(email);
});

Mailer.router.route('default', resolvePropertyValues, 'sendViaDefaultServiceProvider');


