# Useful Mailer

We wanted a package to make email in meteor easy, this is that package.

**This package is still a work in progress!**

# Quick Start

If you just want to send emails, add the `useful:mailer` package and sent a MAIL_URL in your environment, then send emails like so:

```
Mailer.send({
    from: 'admin@example.com'
    , to: user._id
    , subject: 'hi!'
    , text: 'Welcome to example.com a cool meteor app'
    })
```

#Features

So what do you gain by using the Mailer package instead of the Email package?

1. Mailer will resolve userIds for you and turn them into email addresses
2. Mailer will add some useful metadata to your emails and store them in a collection, for example fromId, toId, sentAt
3. Mailer is extensible, you can add you're own metadata to store on sent emails
4. Mailer supports routing, you can define custom routes which include their own custom defaults, for example:
    ```
    Mailer.route('passwordReset', {
        from: 'support@example.com'
        , to: function () {
            return Meteor.user().emails[0].address
        }
        , subject: 'reset your password'
        , text: function () {
            return 'click this link to reset your password: ' + getPasswordResetLink();
        }
        })
    // Sends the passwordReset email without your needing to specify
    // any options
    Mailer.send('passwordReset', {});
    ```
5. Mailer is highly customizable

# mailer-mandrill

To get the most out of the mailer package, what you really want to do is use an ESP (email service provider) package like `useful:mailer-mandrill`, then you can take advantage of the mailer features for routing inbound email.

# mailer-core

This package is a wrapper around the 'mailer-core' package which provides a handy framework for route-based actionable queues. You don't need to know how the mailer-core package works unless you want to customize the way this package works on the inside.

