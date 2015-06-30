# useful:mailer

_This is a work in progress. The Readme will evolve as work progresses._

Makes the pattern for sending real emails as well understood and easily accomplished as creating a new page in an app.

## Example Configuration and Use _(not complete)_

1. Add defaults to your settings json file

```
{
    "public": {
        "mailer": {
            "default": {
                "domain": "<some default domain>"
                , "subject": "Sent from My MailerApp"
                , "message": "Something happened"
                , "to": "<some default email>"
            }
        }
    }
}

```

2. Create a new instance of `Mailer()`

```
    var ButtonMailer = new Mailer({
        from: '<some email address>'
        // , message: 'This message overrides the json settings default'
    });
```
3. Send an email

```
    ButtonMailer.send("NewMessage", {
        subject: 'You have a new message from the future!'
        // , message: 'This message overrides the constructor default'
    }, function(response){
        console.log('Mailer said: ' + response);
    });
```