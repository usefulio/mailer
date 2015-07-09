if (Meteor.isServer) {
  var streamBuffers = Npm.require('stream-buffers');
  var stream = new streamBuffers.WritableStreamBuffer();
  EmailTest.overrideOutputStream(stream);
}

Tinytest.add('Mailer - Mailer.send should resolve properties', function (test) {
  test.equal(Mailer.send({
    from: function () { return 'test@example.com'; }
    , to: function () { return 'test@example.com'; }
    , subject: function () { return 'test'; }
    , text: function () { return 'test'; }
  }), {
    from: 'test@example.com'
    , to: 'test@example.com'
    , subject: 'test'
    , text: 'test'
    , sent: true
  });
});

Tinytest.add('Mailer - Mailer.send should resolve options', function (test) {
  test.equal(Mailer.send({}, {
    from: function () { return 'test@example.com'; }
    , to: function () { return 'test@example.com'; }
    , subject: function () { return 'test'; }
    , text: function () { return 'test'; }
  }), {
    from: 'test@example.com'
    , to: 'test@example.com'
    , subject: 'test'
    , text: 'test'
    , sent: true
  });
});

Tinytest.add('Mailer - Mailer.send should resolve defaults', function (test) {
  test.equal(Mailer.send({}, {
    from: 'test@example.com'
    , to: 'test@example.com'
    , subject: 'test'
    , text: 'test'
  }), {
    from: 'test@example.com'
    , to: 'test@example.com'
    , subject: 'test'
    , text: 'test'
    , sent: true
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

Tinytest.add('Mailer - Mailer.setDefaultServiceProvider will overwrite the default service provider', function (test) {
  var provider = Mailer._defaultServiceProvider;

  Mailer.setDefaultServiceProvider(function (email) {
    email.customSend = true;
    return email;
  });

  test.equal(Mailer.send({}, {
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

  Mailer._defaultServiceProvider = provider;
});

