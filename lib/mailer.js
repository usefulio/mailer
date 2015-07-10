Mailer = function(options){
    this.config = _.defaults(options || {}, Meteor.settings.public.mailer.default);

}

Mailer.prototype.send = function(route, options, afterSend) {
    var self = this;

    // Look for the route in the collection
    Meteor.call(MAILER_METHOD_GET_ROUTE, route, function(err, routeOptions) {
        if (! err && !_.isUndefined(routeOptions)) {
            if (routeOptions) {
                self._extendConfig(routeOptions);
            } else {
                // Add a new route if it doesn't exist
                Meteor.call(MAILER_METHOD_ADD_ROUTE, route, options);
            }
        }
        self._extendConfig(options);

        Meteor.call(MAILER_METHOD_SEND, self.config, function(err, res) {
            // XXX clean this up and add something useful
            var message = 'Email sent - ' + route + '\n' 
                + '; err: ' + err + '\n'
                + '; res: ' + res + '\n'
                + '; from: ' + self.config.from + '\n';
            _.each(self.config, function(value, key){
                message += '; ' + key + ': ' + value + '\n';
            });
            afterSend(message);
        });
    });

};

Mailer.prototype.route = function (route, options) {
    var self = this;
    this._extendConfig(options);

    // Add a new route if it doesn't exist
    Meteor.call(MAILER_METHOD_ADD_ROUTE, route, this.config);

};

Mailer.prototype._extendConfig = function (options) {
    _.extend(this.config, options);
    this._generateHtml();
}

Mailer.prototype._generateHtml = function () {
    var self = this;
    this.config.html = Blaze.toHTML(Blaze.With({message: self.config.message}, function() { return Template[self.config.template]; }));
}