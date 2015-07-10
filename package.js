Package.describe({
    name: 'useful:mailer',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: 'Makes the pattern for sending real emails as well understood and easily accomplished as creating a new page in an app',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/usefulio/mailer',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.1.0.2');

    api.use([
        'email'
        , 'underscore'
    ]);

    api.addFiles([
        'lib/constants.js'
        , 'lib/collections/mailerRoutes.js'
        , 'lib/mailer.js'
    ]);
    api.addFiles([
        'server/methods/send.js'
        , 'server/methods/addRoute.js'
        , 'server/methods/getRoute.js'
    ], 'server');

    api.export([
        'Mailer'
        , 'MailerRoutes'
        , 'MAILER_METHOD_SEND'
        , 'MAILER_METHOD_ADD_ROUTE'
        , 'MAILER_METHOD_GET_ROUTE'
        , 'MAILER_COLLECTION_ROUTES'
    ]);
});

Package.onTest(function(api) {
    api.use('tinytest');
    api.use('useful:mailer');
    api.addFiles('tests/tinytest/mailer-tests.js');
});
