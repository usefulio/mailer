if (Meteor.isServer) {
  var streamBuffers = Npm.require('stream-buffers');
  var stream = new streamBuffers.WritableStreamBuffer();
  EmailTest.overrideOutputStream(stream);
}

Tinytest.add('Mailer - Mailer.send should resolve properties', function (test) {
  var CustomMailer = {};
  Mailer.factory(CustomMailer, { });
  test.equal(CustomMailer.send({
    from: function () { return 'test@example.com'; }
    , to: function () { return 'test@example.com'; }
    , subject: function () { return 'test'; }
    , text: function () { return 'test'; }
  }), {
    from: 'test@example.com'
    , to: 'test@example.com'
    , subject: 'test'
    , text: 'test'
  });
});

Tinytest.add('Mailer - Mailer.send should resolve options', function (test) {
  var CustomMailer = {};
  Mailer.factory(CustomMailer, { });
  test.equal(CustomMailer.send({}, {
    from: function () { return 'test@example.com'; }
    , to: function () { return 'test@example.com'; }
    , subject: function () { return 'test'; }
    , text: function () { return 'test'; }
  }), {
    from: 'test@example.com'
    , to: 'test@example.com'
    , subject: 'test'
    , text: 'test'
  });
});

Tinytest.add('Mailer - Mailer.send should resolve defaults', function (test) {
  var CustomMailer = {};
  Mailer.factory(CustomMailer, { });
  test.equal(CustomMailer.send({}, {
    from: 'test@example.com'
    , to: 'test@example.com'
    , subject: 'test'
    , text: 'test'
  }), {
    from: 'test@example.com'
    , to: 'test@example.com'
    , subject: 'test'
    , text: 'test'
  });
});

if (Meteor.isServer) {
  Tinytest.add('Mailer - Mailer.send should send via the default ESP', function (test) {
    // Copied from meteor email package
    if (process.env.MAIL_URL) return;
    stream = new streamBuffers.WritableStreamBuffer();
    EmailTest.overrideOutputStream(stream);
    Mailer.send({
      from: "foo@example.com",
      to: "bar@example.com",
      cc: ["friends@example.com", "enemies@example.com"],
      subject: "This is the subject",
      text: "This is the body\nof the message\nFrom us.",
    });
    // XXX brittle if mailcomposer changes header order, etc
    test.equal(stream.getContentsAsString("utf8"),
               "====== BEGIN MAIL #0 ======\n" +
               "(Mail not sent; to enable sending, set the MAIL_URL " +
                 "environment variable.)\n" +
               "MIME-Version: 1.0\r\n" +
               "From: foo@example.com\r\n" +
               "To: bar@example.com\r\n" +
               "Cc: friends@example.com, enemies@example.com\r\n" +
               "Subject: This is the subject\r\n" +
               "Content-Type: text/plain; charset=utf-8\r\n" +
               "Content-Transfer-Encoding: quoted-printable\r\n" +
               "\r\n" +
               "This is the body\r\n" +
               "of the message\r\n" +
               "From us.\r\n" +
               "====== END MAIL #0 ======\n");
  });
}

Tinytest.add('Mailer - Mailer.config.defaultServiceProvider will overwrite the default service provider', function (test) {
  var CustomMailer = Mailer.factory(null, {
    defaultServiceProvider: function (email) {
      email.customSend = true;
    }
  });

  test.equal(CustomMailer.send({}, {
    from: 'test@example.com'
    , to: 'test@example.com'
    , subject: 'test'
    , text: 'test'
  }), {
    from: 'test@example.com'
    , to: 'test@example.com'
    , subject: 'test'
    , text: 'test'
    , customSend: true
  });
});

if (Meteor.isServer) {
  // Clear out any old users
  Meteor.users.remove({});

  // Create a dummy user to interact with
  var user = Meteor.users.insert({
    emails: [
      {
        address: 'test@example.com'
      }
    ]
  });

  Meteor.publish(null, function () {
    return Meteor.users.find();
  });
} else {

}



Tinytest.add('Mailer - Mailer sets some default metadata', function (test) {
  var CustomMailer = Mailer.factory(null, _.pick(Mailer.config, 'metadata'));

  var user = Meteor.users.findOne()._id;
  
  test.equal(CustomMailer.send({}, {
    from: 'test@example.com'
    , to: 'test@example.com'
    , subject: 'test'
    , text: 'test'
  }), {
    from: 'test@example.com'
    , to: 'test@example.com'
    , fromId: user
    , toId: user
    , subject: 'test'
    , text: 'test'
  });
});

