var methods = {};

methods[MAILER_METHOD_ADD_ROUTE] = function (name, options) {
    MailerRoutes.upsert({name: name}, 
        {
            $set: {
                name: name
                , options: _.omit(options, 
                    'html'
                    , 'message'
                )
                , createdOn: Date.now() // no need coma here
            }
        }
    );
}

Meteor.methods(methods);