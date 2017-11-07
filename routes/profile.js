// app/profile.js
var user = require('../app/models/models').User //i get the address of user model in the link you give, but in general it should be the user model address.
var multer = require('multer');
var fs = require('fs');

module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});
	//TODO: if not loged in, redirect to login
	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});



    //profile modification POST
    app.post('/modifyIntroduce', isLoggedIn, function(req, res) {
        user.findOne({email: req.user.email}, function (err, intro) {
            if (intro == null) {
            } else {
                intro.introduce = req.body.introduce;
                intro.save(function (err, updatedObject) {
                    if (err)
                        console.log(err);
                });
            }

        });
        res.redirect('/profile#init');
	});
	//TODO: delete old pictures
    var uploading = multer({
        dest: __dirname + "/../public/uploads/",
    });
    app.post('/upload', uploading.single('picture'), function(req, res) {
        /** When using the "single"
         data come in "req.file" regardless of the attribute "name". **/
        var tmp_path = req.file.path;

        /** The original name of the uploaded file
         stored in the variable "originalname". **/
        var target_path = __dirname + "/../public/uploads/" + req.file.originalname;

        user.findOne({email: req.user.email}, function (err, user) {
            if (user == null) {
                console.log("cannot find user");
            } else {
                console.log("le file :" + req.file.originalname);
                user.picture = req.file.originalname;
                user.save(function (err, updatedObject) {
                    if (err)
                        console.log(err);
                });
            }
        });

        /** A better way to copy the uploaded file. **/
        var src = fs.createReadStream(tmp_path);
        var dest = fs.createWriteStream(target_path);
        src.pipe(dest);
        src.on('end', function() { res.redirect('/profile'); });
        src.on('error', function(err) { res.render('/home'); });
    });

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure the user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
