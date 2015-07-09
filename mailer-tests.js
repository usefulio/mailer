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
  });
});
