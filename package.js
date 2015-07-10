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
  api.versionsFrom('1.1.0.2');
  api.use('underscore');
  api.use('accounts-base');
  api.use('email', 'server');
  api.use('cwohlman:templating-server');
  api.imply('cwohlman:templating-server');
  api.imply('templating');
  api.use('useful:mailer-core');
  api.imply('useful:mailer-core');

  api.addFiles('mailer.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('useful:mailer');
  api.use('email', 'server');
  api.addFiles('test.spacebars', ['server']);
  api.addFiles('testLayout.spacebars', ['server']);
  api.addFiles('test.html', ['client']);
  api.addFiles('testLayout.html', ['client']);
  api.addFiles('mailer-tests.js');
});
