
var express = require('express');
var router = express.Router();
var mongoose =require('mongoose');
var slugify = require('slugify');

var UserInfo = require('../app/models/models').User;
var UserPost = require('../app/models/models').post;
var Votes = require('../app/models/models').votesOnAComment;

/* GET users listing. */

//homepage of every user
router.get('/home', function(req, res, next) {
    var user = req.user.email;

    var list = [];
    var otherLanguages = req.user.otherLanguage;
    var nativeLanguages = req.user.nativeLanguage;
    var check = false;

    //TODO: ordering
    
    const q1 = {$and:[{TargetLanguage:nativeLanguages},{PostLanguage:otherLanguages}]}
    const q2 = {$and:[{TargetLanguage:otherLanguages},{PostLanguage:nativeLanguages}]}
    const projection = {Description:0,Comments:0}
    UserPost.find(q1,projection).then((docs1)=>{
        UserPost.find(q2,projection).then( (docs2) => {
            list.push(...docs1,...docs2)
            res.render('home', {
                title: user,
                userPosts: list
            });
        })
    })
    // UserPost.find({q1}).then((docs)=>{
      
    // })
    // res.render('home', {
    //     title: user,
    //     userPosts: docs
    // });
    // UserPost.find({},function(err,docs){
    //     if(err) throw err;
    //     else{
    //         docs.forEach(function(item) {
    //             check = false;
    //             if(item.TargetLanguage == nativeLanguages ){
    //                 otherLanguages.forEach(function (item2) {
    //                     if(item2 == item.PostLanguage)
    //                         check = true;
    //                 });
    //                 if(check)
    //                     list.push(item);
    //             }
    //             if(item.PostLanguage == nativeLanguages ){
    //                 otherLanguages.forEach(function (item2) {
    //                     if(item2 == item.TargetLanguage)
    //                         check = true;
    //                 });
    //                 if(check)
    //                     list.push(item);
    //             }
    //         });

    //         res.render('home', {
    //             title: user,
    //             userPosts: list
    //         });
    //     }
    // });


});

//Page for posting request
router.get('/requestHelp', function(req, res, next) {
    var user = req.user.email;

    res.render('requestHelp', { title: user, message: req.flash('sendRequestMessage') });
});

//post method for the saving of requestHelp
router.post('/sendRequest',function(req,res){
    //TODO: check that request is complete
    if(!req.body.title) {
        req.flash('sendRequestMessage','Please input a title for this post')
        res.redirect('/requestHelp')
    }
    else if(!req.body.description) {
        req.flash('sendRequestMessage','Please input a description for this post')
        res.redirect('/requestHelp')
    }
    else if(req.body.postLanguage == req.body.targetLanguage) {
        req.flash('sendRequestMessage','The post language and the target languages must be different')
        res.redirect('/requestHelp')
    }
    else {
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
    }
});


//particular page of every post.
router.get('/langPost/:pdid',function(req,res){
    var a =  req.params.pdid;
    //var a = new mongoose.Types.ObjectId('5858d1811d1cda8403d6e4c8');

    UserPost.findOne({PostDomain:a},function(err,movies){
   // UserPost.findOne({_id:a},function(err,movies){

        res.render('langPost', {
            postData: movies,
            user: req.user.email
        });

    });

});

//post method of comments on posts
router.post('/sendComment',function(req,res){


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

    UserPost.find({PostCreator:user},{Comments:0}).then((docs)=> {

            res.render('myPosts', {
                title: user,
                userPosts: docs
            });
        }
    );
});
//TODO: delete post
router.get('/deletePost', function(req,res) {
    console.log(req.query.dom)
    UserPost.remove({_id:req.query.dom},()=> {
        res.redirect("/myPosts")
    })

})

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
