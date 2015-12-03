function resolvePropertyValues(email) {
  _.each(email, function (val, property) {
    if (_.isFunction(val))
      email[property] = val.call(this, email);
  });
  
  _.each(this.options, function (val, property) {
    if (_.isFunction(val)) {
      val = val.call(this, email[property], email);
      if (val)
        email[property] = val;
    } else if (!email[property] && val)
      email[property] = val;
  });

  return email;
}

function getPrettyAddress(address, name) {
  if (_.isString(name)) {
    return '"' + name.replace(/[^a-z0-9!#$%&'*+\-\/=?\^_`{|}~ ]/ig, "") + '" <' + address + '>';
  } else {
    return address;
  }
}

Mailer.helpers = {
  resolvePropertyValues: resolvePropertyValues
  , getPrettyAddress: getPrettyAddress
};

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

/**
 * Sets up an observeChanges watch on the messages collection for unsent messages and sends them using the defaultServiceProvider
 * @method Mailer.autoProcessQueue
 */

  Mailer.autoProcessQueue = function () {
    var collection = Mailer.config.collection;
    var watch = collection.find({
      sent: {
        $ne: true
      }
    }).observeChanges({
      added: function (id) {
        var transactionId = Random.id();
        collection.update({
          _id: id
          , processorId: {
            $exists: false
          }
          , sent: {
            $ne: true
          }
        }, {
          $set: {
            processorId: transactionId
          }
        });

        var doc = collection.findOne({
          _id: id
          , processorId: transactionId
        });

        if (doc) {
          var sentMessage = Mailer.send('sendViaDefaultServiceProvider', doc);
          if (sentMessage) {
            delete sentMessage.processorId;
            collection.update(id, sentMessage);
          }
        }
      }
    });
  };

  Mailer.router.route('sendViaDefaultServiceProvider', function (email) {
    var action = Mailer.config.defaultServiceProvider;
    if (action){
      return action.call(this, email);
    }
    else if (action !== null)
      console.log("Email sending not enabled! To enable sending define a defaultServiceProvider in your mailer config.");
  });

  Mailer.router.route('attachDefaultMetadata', function (email) {
    if (Mailer.config.metadata)
      return resolvePropertyValues.call({options: Mailer.config.metadata}, email);

  });

  Mailer.router.route('resolveEmailAddresses', function (email) {
    if (Mailer.config.resolveEmailAddress || Mailer.config.resolveAddressName) {
      _.each(['from', 'to', 'cc', 'bcc', 'replyTo'], function (property) {
        var emails = email[property] || email[property + 'Id'];
        if (!emails)
          return;
        if (!_.isArray(emails))
          emails = [emails];

        if (Mailer.config.resolveEmailAddress)
          emails = _.filter(_.map(emails, function (address) {
            return Mailer.config.resolveEmailAddress(address) || address;
          }), _.identity);

        if (Mailer.config.resolveAddressName)
          emails = _.map(emails, function (address) {
            var name = Mailer.config.resolveAddressName(address, email);
            return getPrettyAddress(address, name);
          });

        if (emails.length > 1)
          email[property] = emails;
        else if (emails.length > 0)
          email[property] = emails[0];
      });
    }
  });

  Mailer.router.route('resolveUserPreferences', function (email) {
    if (Mailer.config.resolveUserPreferences) {
      _.each(['to', 'cc', 'bcc', 'replyTo'], function (property) {
        var emails = email[property] || email[property + "Id"];
        if (!emails)
          return;
        if (!_.isArray(emails))
          emails = [emails];

        emails = _.filter(emails, function (address) {
          return Mailer.config.resolveUserPreferences(address, email);
        });

        if (emails.length > 1)
          email[property] = emails;
        else if (emails.length > 0)
          email[property] = emails[0];
        else
          delete email[property];
      });
      if (!email.to)
        return false;
    }
  });

  Mailer.router.route('resolveTemplates', function (email) {
    if (Mailer.config.resolveTemplates)
      return Mailer.config.resolveTemplates(email);

  });

  Mailer.router.route('insertSentMessages', function (email) {
    if (Mailer.config.collection) {
      var messageId = Mailer.config.collection.insert(email);
      return Mailer.config.collection.findOne(messageId);
    }
  });

  Mailer.router.route('attachThreadingMetadata', function (email) {
    if (Mailer.config.threading) {
      var options = _.pick(Mailer.config.threading, 'threadId', 'from', 'replyTo');
      return resolvePropertyValues.call({options: options}, email);
    }
  });

  Mailer.router.route('recieve', function (email) {
    if (Mailer.config.threading && Mailer.config.threading.setOutboundProperties) {
      Mailer.config.threading.setOutboundProperties(email);
    }
  }, function (email) {
    if (Mailer.config.threading && Mailer.config.threading.onRecieveRoute)
      return Mailer.send(Mailer.config.threading.onRecieveRoute, email);
  });

  Mailer.router.route('default', resolvePropertyValues, 'attachDefaultMetadata', 'resolveUserPreferences', 'resolveEmailAddresses', 'attachThreadingMetadata', 'resolveTemplates', 'sendViaDefaultServiceProvider', 'insertSentMessages');

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
        , sentAt: function () {
          return new Date();
        }
      }
      , resolveEmailAddress: function (address) {
        var user = Meteor.users.findOne(address);
        if (user) {
          var email = _.find(_.where(user.emails, {verified: true}), function (email) {
            return email.preferred;
          }) || _.first(user.emails);
          return email && email.address || address;
        } else {
          return address;
        }
      }
      , resolveAddressName: function (address) {
        var user = Meteor.users.findOne({
          "emails.address": address
        });
        return user && user.profile && user.profile.name;
      }
      , resolveUserPreferences: function (recipient, email) {
        var user = Meteor.users.findOne(recipient);
        if (user && user.notifications) {
          return _.all(user.notifications, function (optin, property) {
            if (!optin && email[property])
              return false;
            else
              return true;
          });
        } else
          // No user preferences, send the email anyway
          return true;
      }
      , resolveTemplates: function (email) {
        var template = Template[email.template];
        var layoutTemplate = Template[email.layoutTemplate];
        var dataContext = _.extend({}, email);
        if (this.templateMetadata) {
          _.each(this.templateMetadata, function (fn, property) {
            dataContext[property] = _.isFunction(fn) ? fn(email) : fn;
          });
        }
        if (template) {
          if (layoutTemplate) {
            layoutTemplate.helpers({
              yield: function () {
                return template;
              }
            });
            email.html = Blaze.toHTMLWithData(layoutTemplate, dataContext);
          } else
            email.html = Blaze.toHTMLWithData(template, dataContext);
        }
        var subjectTemplate = Template[email.subjectTemplate];
        if (subjectTemplate) {
          email.subject = Blaze.toHTMLWithData(subjectTemplate, dataContext);
        } else if (email.subjectTemplate) {
          email.subject = compileAndRender(email.subjectTemplate, dataContext);
        }
      }
      , templateMetadata: {
        fromUser: function (email) {
          return Meteor.users.findOne(email.fromId);
        }
        , toUser: function (email) {
          return Meteor.users.findOne(email.toId);
        }
      }
      , collection: new Mongo.Collection('useful:mailer:messages')
    });
});
