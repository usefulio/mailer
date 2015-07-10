var methods = {};

methods[MAILER_METHOD_SEND] = function (options) {
    // XXX defaults to Meteor's email package for now
    check([options.to, options.from, options.subject, options.html], [String]);

    this.unblock();

    Email.send({
      to: options.to
      , from: options.from
      , subject: options.subject
      , text: options.html
    });

    return true;
}

Meteor.methods(methods);