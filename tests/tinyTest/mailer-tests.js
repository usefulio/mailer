// Mailer() tests

Tinytest.add('Mailer() - config options - settings json', function (test) {
    TestMailer = new Mailer();

    test.equal(TestMailer.config.message, 'Settings default', 'The expected value is the default from the settings json file');
});

Tinytest.add('Mailer() - config options - Mailer() instance', function (test) {
    TestMailer = new Mailer({
        message: 'Instance default'
    });

    test.equal(TestMailer.config.message, 'Instance default', 'The expected value is the one from the Mailer() instance');
});

Tinytest.add('Mailer() - config options - send() function', function (test) {
    TestMailer = new Mailer({
        message: 'Instance default'
    });

    TestMailer.send("NewMessage", {
        message: 'Send default'
    });

    test.equal(TestMailer.config.message, 'Send default', 'The expected value is the one passed to the send() function');
});


// TDD
// these tests are created with the outcome in mind, before development

Tinytest.add('TDD - expect error - test for error', function (test) {
    TestMailer = new Mailer({
        message: 'Instance default'
    });

    TestMailer.send("NewMessage", {
        message: 'Send default'
    }, function(err, res){
        test.isNotNull(err);
    });

});

Tinytest.add('TDD - expect error - test for result', function (test) {
    TestMailer = new Mailer({
        message: 'Instance default'
    });

    TestMailer.send("NewMessage", {
        message: 'Send default'
    }, function(err, res){
        test.isNull(res);
    });

});

Tinytest.add('TDD - expect result - test for error', function (test) {
    TestMailer = new Mailer({
        message: 'Instance default'
    });

    TestMailer.send("NewMessage", {
        message: 'Send default'
    }, function(err, res){
        test.isNull(err);
    });

});

Tinytest.add('TDD - expect result - test for result', function (test) {
    TestMailer = new Mailer({
        message: 'Instance default'
    });

    TestMailer.send("NewMessage", {
        message: 'Send default'
    }, function(err, res){
        test.isNotNull(res);
    });

});