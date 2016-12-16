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
var userSchema = mongoose.Schema({

        email        : String,
        password     : String,
        nativeLanguage : String,
        otherLanguage : String,
        introduce : String,
        profile_creation_date : {type: Date, default: Date.now},
        score_nb : { type: Number, default: 0 },
        translations_nb : { type: Number, default: 0 },
        reviews_nb : { type: Number, default: 0 },
        requests : [Request]


});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
