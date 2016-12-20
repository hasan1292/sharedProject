/**
 * Created by Hasan on 16/12/2016.
 */
var express = require('express');
var router = express.Router();
var mongoose =require('mongoose');
var slugify = require('slugify');

var user = require('../app/models/user');

var Schema = mongoose.Schema;

var userSchema = new Schema({
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

var UserPost = mongoose.model('userPost',userSchema);

var votes = new Schema({
    CommentId: String,
    Voters: [{
        UserEmail: String
    }]
});

var Votes = mongoose.model('votes',votes);

var userInfo = new Schema({
    email        : String,
    password     : String,
    nativeLanguage : String,
    otherLanguage : String,
    introduce : String,
    credits: Number,
    profile_creation_date : {type: Date, default: Date.now},
    score_nb : { type: Number, default: 0 },
    translations_nb : { type: Number, default: 0 },
    reviews_nb : { type: Number, default: 0 }
});

var UserInfo = mongoose.model('user',userInfo);

/* GET users listing. */


//homepage of every user
router.get('/home', function(req, res, next) {
    var user = req.user.email;

    UserPost.find({},function(err,docs){
        if(err) throw err;
        else{
            res.render('home', {
                    title: user,
                    userPosts: docs
            });
        }
    });


});
//Page for posting request
router.get('/requestHelp', function(req, res, next) {
    var user = req.user.email;

    res.render('requestHelp', { title: user });
});

//post method for the saving of requestHelp
router.post('/naya2',function(req,res){

    UserInfo.findOne({email:req.user.email},function(err,docs) {

        if(docs.credits <= 0){
            res.render('sorry', { });
        }
        else{

        var h = UserPost({
            PostCreator: req.user.email,
            PostTitle: req.body.title,
            PostLanguage: req.body.postLanguage,
            TargetLanguage: req.body.targetLanguage,
            Description: req.body.description,
            PostDomain: slugify(req.body.title)
        });

        UserInfo.update(
            {'email': req.user.email},
            {$inc: {'translations_nb': 1, 'credits': -1}},
            function (err, numAfected) {
                console.log(numAfected);
            }
        );


        h.save(function (err) {
            if (err) throw err;

            else {
                console.log('Project created!');
                // res.render('success', {
                //  title: 'Success'
                //});
                res.redirect('/myPosts');
            }
        });

        }
    });
});


//particular page of every post.
router.get('/langPost/:pdid',function(req,res){
    var a =  req.params.pdid;
    //var a = new mongoose.Types.ObjectId('5858d1811d1cda8403d6e4c8');

    UserPost.findOne({PostDomain:a},function(err,movies){
   // UserPost.findOne({_id:a},function(err,movies){

        res.render('langPost', {
            postData: movies
        });

    });

});

//post method of comments on posts
router.post('/naya3',function(req,res){


    UserPost.findOne({PostDomain:req.body.postDomain},function(err,docs){


        if (docs == null) {
        } else {

            var Comment = {
                Commentator: req.user.email,
                Comment: req.body.comment,
                Count: 0
            }

            //console.log(docs);

            docs.Comments.push(Comment);

            UserInfo.update(
                {'email':req.user.email},
                {$inc: {'reviews_nb':1}},
                function (err, numAfected) {
                    console.log(numAfected);
                }
            );

            docs.save(function (err, updatedObject) {
                if (err)
                    console.log(err);

                console.log("Success");
                var h = Votes({
                    CommentId: updatedObject.Comments[updatedObject.Comments.length-1]._id,
                    Voters: [{
                        UserEmail: req.user.email
                    }]
                });

                h.save(function (err, updatedObject2) {
                    if (err)
                        console.log(err);

                    console.log("Success");
                });

                res.redirect("langPost/"+docs.PostDomain);
            });




        }
    });

});

//post method for incrementing score
router.post('/increment', function(req, res){

    var check = false;

    Votes.findOne({CommentId :req.body.id},function(err,docs) {

        docs.Voters.forEach(function(item) {
            if(item.UserEmail == req.user.email)
                check = true;
        });

        if(check){
            UserPost.findOne({'Comments._id' :req.body.id},function(err,docs) {
                res.redirect("langPost/"+docs.PostDomain);
            });
        }
        else{
            var userEmail ={
                UserEmail: req.user.email
            }
            docs.Voters.push(userEmail);

            docs.save(function (err, updatedObject) {
                if (err)
                    console.log(err);
            });

            UserPost.findOne({'Comments._id' :req.body.id},function(err,docs) {

                docs.Comments.forEach(function (items) {
                   if(items._id == req.body.id){
                       UserInfo.update(
                           {'email':items.Commentator},
                           {$inc: {'score_nb':1,'credits':1}},
                           function (err, numAfected) {
                               console.log(numAfected);
                           }
                       );
                   }
                });


                UserPost.update(
                    {'Comments._id':req.body.id},
                    {$inc: {'Comments.$.Count':1}},
                    function (err, numAfected) {
                        res.redirect("langPost/"+docs.PostDomain);
                    }
                );

            });
        }
    });



});

//post method for decrementing score
router.post('/decrement', function(req, res){

    var check = false;

    Votes.findOne({CommentId :req.body.id},function(err,docs) {

            docs.Voters.forEach(function(item) {
                if(item.UserEmail == req.user.email)
                    check = true;
            });

            if(check){
                UserPost.findOne({'Comments._id' :req.body.id},function(err,docs) {
                            res.redirect("langPost/"+docs.PostDomain);
                });
            }
            else{
            var userEmail ={
                UserEmail: req.user.email
            }
            docs.Voters.push(userEmail);

            docs.save(function (err, updatedObject) {
                if (err)
                    console.log(err);
            });

                UserPost.findOne({'Comments._id' :req.body.id},function(err,docs) {


                    docs.Comments.forEach(function (items) {
                        if(items._id == req.body.id){
                            UserInfo.update(
                                {'email':items.Commentator},
                                {$inc: {'score_nb':-1,'credits':-1}},
                                function (err, numAfected) {
                                    console.log(numAfected);
                                }
                            );
                        }
                    });

                    UserPost.update(
                        {'Comments._id':req.body.id},
                        {$inc: {'Comments.$.Count':-1}},
                        function (err, numAfected) {
                            res.redirect("langPost/"+docs.PostDomain);
                        }
                    );

                });
            }
    });

});

//myPosts route
router.get('/myPosts', function(req, res, next) {
    var user = req.user.email;

    var documents = []

    UserPost.find({},function(err,docs){
        if(err) throw err;
        else{

            docs.forEach(function(item) {
                if(item.PostCreator == user)
                    documents.push(item);
            });

            res.render('myPosts', {
                title: user,
                userPosts: documents
            });
        }
    });


});

//for visiting profile of particular user.
router.get('/userProfile/:pdid',function(req,res){
    var a =  req.params.pdid;
    //var a = new mongoose.Types.ObjectId('5858d1811d1cda8403d6e4c8');

    UserInfo.findOne({email:a},function(err,movies){
        // UserPost.findOne({_id:a},function(err,movies){

        console.log(movies);
        res.render('userProfile', {
            user: movies
        });

    });

});

module.exports = router;
