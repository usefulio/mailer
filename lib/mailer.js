Mailer = function(options){
    this.config = _.defaults(options || {}, Meteor.settings.public.mailer.default);

}

Mailer.prototype.send = function(route, options, afterSend) {
    var self = this;
    _.extend(this.config, options);

    Meteor.call(MAILER_METHOD_SEND, this.config, function(err, res) {
        afterSend('Email sent - ' + route + '\n' 
            + '; err: ' + err + '\n'
            + '; res: ' + res + '\n'
            + '; from: ' + self.config.from + '\n'
            + '; domain: ' + self.config.domain + '\n'
        );
    });

};

Mailer.prototype.route = function (route, options) {
    // XXX this doesn't do anything yet
};