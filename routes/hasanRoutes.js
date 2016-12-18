/**
 * Created by Hasan on 16/12/2016.
 */
var express = require('express');
var router = express.Router();
var mongoose =require('mongoose');

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

    var h = UserPost({
        PostCreator: req.user.email,
        PostTitle: req.body.title,
        PostLanguage: req.body.postLanguage,
        TargetLanguage: req.body.targetLanguage,
        Description: req.body.description,
        PostDomain: "langPost/"+req.body.title
    });

    h.save(function(err){
        if (err) throw err;

        else{ console.log('Project created!');
            // res.render('success', {
            //  title: 'Success'
            //});
            res.redirect('/home');}
    });


});

//variable to hold off the value of last opened post.
var lastPost;

//particular page of every post.
router.get('/langPost/:pdid',function(req,res){
    var a = req.params.pdid;

    lastPost = a;

    UserPost.findOne({PostTitle:a},function(err,movies){

        res.render('langPost', {
            postData: movies
        });

    });

});

//post method of comments on posts
router.post('/naya3',function(req,res){


    UserPost.findOne({PostTitle:lastPost},function(err,docs){


        if (docs == null) {
        } else {

            var Comment = {
                Commentator: req.user.email,
                Comment: req.body.comment,
                Count: 0
            }

            console.log(docs);

            docs.Comments.push(Comment);

            docs.save(function (err, updatedObject) {
                if (err)
                    console.log(err);

                console.log("Success");

                res.redirect('/langPost/'+lastPost);
            });
        }
    });

});

//post method for incrementing score
router.post('/endpoint', function(req, res){
    var obj = {};
    console.log('body: ' + req.body.title);
   // res.send(req.body.title);
});

module.exports = router;
