// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema of a user-submitted translation
var Translation = mongoose.Schema({
    body : String,
    date : Date,
    upvotes_nb : {type: Number, default: 0}
});
// define the scema of a translation request
var Request = mongoose.Schema({
    body  : String,
    date : Date,
    originalLanguage : String,
    targetLanguage : String,
    translations : [Translation]
});
// define the schema for our user model
var User = mongoose.Schema({
        email        : String,
        password     : String,
        nativeLanguage : String,
        otherLanguage : [String],
        picture : String,
        introduce : String,
        profile_creation_date : {type: Date, default: Date.now},
        credits: { type: Number, default: 20 },
        score_nb : { type: Number, default: 0 },
        translations_nb : { type: Number, default: 0 },
        reviews_nb : { type: Number, default: 0 }
});

// methods ======================
// generating a hash
User.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

var post = mongoose.Schema({
    PostCreator: String,
    PostTitle: String,
    PostLanguage: String,
    TargetLanguage: String,
    Description: String,
    PostDomain: String,
    Comments: [{
        Commentator: String,
        Comment: String,
        Count: Number
    }]
});

var votesOnAComment = mongoose.Schema({
    CommentId: String,
    Voters: [{
        UserEmail: String
    }]
});
// create the model for users and expose it to our app
module.exports = {
    User: mongoose.model('User',User),
    post: mongoose.model('userPost',post),
    votesOnAComment: mongoose.model('votes',votesOnAComment)
}
