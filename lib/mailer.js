Mailer = function(options){
    this.config = _.defaults(options || {}, Meteor.settings.public.mailer.default);

}

Mailer.prototype.send = function(route, options, afterSend) {
    var self = this;

    // XXX Get route from database and use instead of this.config

    this._extendConfig(options);

    Meteor.call(MAILER_METHOD_SEND, this.config, function(err, res) {
        var message = 'Email sent - ' + route + '\n' 
            + '; err: ' + err + '\n'
            + '; res: ' + res + '\n'
            + '; from: ' + self.config.from + '\n';
        _.each(self.config, function(value, key){
            message += '; ' + key + ': ' + value + '\n';
        });
        afterSend(message);
    });

};

Mailer.prototype.route = function (route, options) {
    console.log('Route name: ' + route);
    this._extendConfig(options);

    // XXX add route to db if it doesn't already exist

};

Mailer.prototype._extendConfig = function (options) {
    _.extend(this.config, options);
}