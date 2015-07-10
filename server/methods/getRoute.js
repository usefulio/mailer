var methods = {};

methods[MAILER_METHOD_GET_ROUTE] = function (name) {
    var route = MailerRoutes.findOne({name: name});
    
    if (_.isUndefined(route)) {
        return false;
    }
    return route.options;
}

Meteor.methods(methods);