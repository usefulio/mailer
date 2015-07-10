function resolvePropertyValues(email) {
  _.each(email, function (val, property) {
    if (_.isFunction(val))
      email[property] = val.call(this, email);
  });
  
  _.each(this.options, function (val, property) {
    if (_.isFunction(val)) {
      val = val.call(this, email[property], email);
    } 
    if (!email[property] && val)
      email[property] = val;
  });

  return email;
}

var Router = Mailer.Router;

function factory(Mailer, config) {

  if (!Mailer)
    Mailer = {};

/**
 * The configuration options for this mailer
 * @property Mailer.config An object containing options for the mailer
 * @type {object}
 */

  Mailer.config = config;

/**
 * The default router to use for sending email
 * @property Mailer.router An instance of Mailer.Router
 * @type {emailRouter}
 */

  Mailer.router = new Router();

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
      return Mailer.router.route(routeName, [resolvePropertyValues, actionOrOptions], parentRoute);
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

  Mailer.router.route('sendViaDefaultServiceProvider', function (email) {
    var action = Mailer.config.defaultServiceProvider;
    if (action){
      return action.call(this, email);
    }
    else
      console.log("Email sending not enabled! To enable sending define a defaultServiceProvider in your mailer config.");
  });

  Mailer.router.route('attachDefaultMetadata', function (email) {
    if (Mailer.config.metadata)
      return resolvePropertyValues.call({options: Mailer.config.metadata}, email);

  });

  Mailer.router.route('resolveEmailAddresses', function (email) {
    if (Mailer.config.resolveEmailAddress) {
      _.each(['from', 'to', 'cc', 'bcc', 'replyTo'], function (property) {
        var emails = email[property] || email[property + 'Id'];
        if (!emails)
          return;
        if (!_.isArray(emails))
          emails = [emails];

        emails = _.filter(_.map(emails, function (address) {
          return Mailer.config.resolveEmailAddress(address) || address;
        }), _.identity);

        if (emails.length > 1)
          email[property] = emails;
        else if (emails.length > 0)
          email[property] = emails[0];
      });
    }
  });

  Mailer.router.route('default', resolvePropertyValues, 'attachDefaultMetadata', 'resolveEmailAddresses', 'sendViaDefaultServiceProvider');

  return Mailer;
}

Mailer.factory = factory;

Meteor.startup(function () {
  if (!Mailer.send)
    factory(Mailer, {
      defaultServiceProvider: Meteor.isServer ? function (email) {
          Email.send(email);
          email.sent = true;
          return email;
        } : null
      , metadata: {
        fromId: function (fromId, email) {
          if (fromId)
            return fromId;

          var user = Meteor.users.findOne({
            $or: [
              {
                _id: email.from
              }
              , {
                "emails.address": email.from
              }
            ]
          });
          return user && user._id;
        }
        , toId: function (toId, email) {
          if (toId)
            return toId;

          var user = Meteor.users.findOne({
            $or: [
              {
                _id: email.to
              }
              , {
                "emails.address": email.to
              }
            ]
          });
          return user && user._id;
        }
      }
      , resolveEmailAddress: function (address) {
        var user = Meteor.users.findOne(address);
        if (user) {
          var email = _.find(user.emails, function (email) {
            return email.preferred;
          }) || _.first(user.emails);
          return email && email.address || address;
        } else {
          return address;
        }
      }
    });
});
