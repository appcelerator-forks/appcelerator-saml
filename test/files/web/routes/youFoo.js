var Arrow = require('arrow');

var YouFooRoute = Arrow.Router.extend({
    name: 'youFoo',
    path: '/youFoo',
    method: 'GET',
    description: 'Hello, youFoo',
    action: function(req, resp, next) {
        resp.status(200).send('<p>You are now authenticated!</p>');
    }
});

module.exports = YouFooRoute;