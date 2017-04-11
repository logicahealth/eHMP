'use strict';

function computeMatch(req) {
    var match = {};

    if (req.query.id) {
        match._id = req.query.id;
    } else if (req.query.name) {
        match.name = req.query.name;
    }

    if (req.query.scope) {
        match.scope = req.query.scope;
    } else {
        // default to private scope search
        match.scope = 'private';
    }
    // set the owner query according to the scope
    if (match.scope === 'private') {
        // private scope, restrict to patient lists owned by the user
        match.owner = req.session.user.username;
    } else if (match.scope === 'site') {
        // site scope, restrict to patient lists for the user's site
        match.owner = req.session.user.site;
    }
    return match;
}
module.exports.computeMatch = computeMatch;
