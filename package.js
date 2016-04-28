Package.describe({
  name: 'useful:mailer',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

// Allows us to test the default ESP ('email' package)
Npm.depends({ "stream-buffers": "0.2.5" });

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('spacebars-compiler');
  api.use('underscore');
  api.use('ecmascript');
  api.use('accounts-base');
  api.use('mongo');
  api.use('email', 'server');
  api.use('cwohlman:templating-server');
  api.imply('cwohlman:templating-server');
  api.use('useful:mailer-core');

  api.addFiles('spacebars.js');
  api.addFiles('mailer.js');

  api.export('Mailer');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('useful:mailer');
  api.use('email', 'server');
  api.use('templating');
  api.use('mongo');
  api.addFiles('test.spacebars');
  api.addFiles('testLayout.spacebars');
  api.addFiles('mailer-tests.js');
});
