var mongoose = require('mongoose');   
var User = mongoose.model('User');
var Order = mongoose.model('Order');
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');

module.exports = function(passport){

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user:',user.name);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            console.log('deserializing user:',user.name);
            done(err, user);
        });
    });

    passport.use('register', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password,done) {

            // find a user in mongo with provided username
            User.findOne({ 'email' :  username }, function(err, user) {
                // In case of any error, return using the done method
                if (err){
                    console.log('Error in SignUp: '+err);
                    return done(err);
                }
                // already exists
                if (user) {
                    console.log('User already exists with username: '+username);
                    return done("User already exists with username", false);
                } else {
                    // if there is no user, create the user
                    var newUser = new User();

                    // set the user's credentials
                    newUser.name = req.body.name;
                    newUser.password = createHash(password);
                    newUser.email = username;
                    newUser.phone = "null";//req.body.phoneNum;
                    newUser.addressLine1 = "null";//req.body.addressLine1;
                    newUser.addressLine2 = "null";//req.body.addressLine2;
                    newUser.city = "null";//req.body.city;
                    newUser.state = "null";//req.body.state;
                    newUser.zipCd = "null";//req.body.zipCd;

                    // save the user
                    newUser.save(function(err) {
                        if (err){
                            console.log('Error in Saving user: '+err);  
                            //throw err;  
                        }
                        console.log(newUser.username + ' Registration succesful');    
                        return done(null, newUser);
                    });
                }
            });
        })
    );
    
    passport.use('order', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req,done) {
            console.log("creating a new order");
            var newOrder = new Order();
            var obj = req.body.order;
            for(var i=0;i<obj.length;i++){
                newOrder.order[i].name = obj[i].name;
                newOrder.order[i].subtotal = obj[i].subtotal;
                newOrder.order[i].serving = obj[i].serving;
                newOrder.order[i].price = obj[i].price;
                newOrder.order[i].people = obj[i].people;
            }
            newOrder.charge.total = obj.charge.total;
            newOrder.charge.shipping = obj.charge.shipping;
            newOrder.user = obj.user;
            
            newOrder.save(function(err){
                if(err){
                    console.log("saving error");
                    return done("error in ordering",err);
                }
                console.log("order saved !");
                return(null,newOrder);
            });
        })
    );
    passport.use('update', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password,done) {
            
            // find a user in mongo with provided username
            User.findOne({ 'username' :  username }, function(err, user) {
                // In case of any error, return using the done method
                if (err){
                    console.log('Error in update: '+err);
                    return done(err);
                }
                // already exists
                if (user) {
                    console.log('found user');  
                    user.phone = req.body.phoneNum;
                    user.addressLine1 = req.body.addressLine1;
                    user.addressLine2 = req.body.addressLine2;
                    user.city = req.body.city;
                    user.state = req.body.state;
                    user.zipCd = req.body.zipCd;

                    // save the user
                    user.save(function(err) {
                        if (err){
                            console.log('Error in Saving user: '+err);  
                            //throw err; 
                            return(err,false); 
                        }
                        console.log(user.username + ' update succesful');    
                        return done(null, user);
                    });
                } else {
                    console.log('User doesnt exists with username: '+username);
                    return done(err, false);
                }
            });
        })
    );

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            // check in mongo if a user with username exists or not
            User.findOne({ 'email' :  username }, 
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('User Not Found with username '+username);
                        return done("DB Error");
                    }
                        
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        console.log('User Not Found with username '+username);
                        return done("User Not Found with username ", false);                 
                    }
                    // User exists but wrong password, log the error 
                    if (!isValidPassword(user, password)){
                        console.log('Invalid Password');
                        return done("Invalid Password", false); // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success
                    return done(null, user);
                }
            );
        }
    ));
    
    passport.use('forgotPassword', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            // check in mongo if a user with username exists or not
            console.log("checking DB");
            User.findOne({ 'email' :  username }, 
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('User Not Found with username '+username);
                        return done("DB Error");
                    }
                        
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        console.log('User Not Found with username '+username);
                        return done("User Not Found with username ", false);                 
                    }
                    var transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: 'souschefneu@gmail.com', // Your email id
                            pass: 'souschef' // Your password
                        }
                    });

                    var mailOptions = {
                        from: '"Souchef" <souschefneu@gmail.com>', // sender address
                        to: username, // list of receivers
                        subject: 'Forgot Password', // Subject line
                        text: 'Your password is : '+user.password, // plaintext body
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if(error){
                            return done("mail not sent", false);
                        }
                        console.log('Message sent: ' + info.response);
                    });
                    // which will be treated like success
                    return done(null, user);
                }
            );
        }
    ));
    
    passport.use('contactus', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            console.log("sending mail");
            var transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: 'souschefneu@gmail.com', // Your email id
                            pass: 'souschef' // Your password
                        }
                    });

                    var mailOptions = {
                        from: username, // sender address
                        to: 'souschefneu@gmail.com', // list of receivers
                        subject: 'Hey Souschef!', // Subject line
                        text: req.body.messageBody, // plaintext body
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if(error){
                            return done("mail not sent", false);
                        }
                        console.log('Message sent: ' + info.response);
                        return done(null,username);
                    });
        }
    ));
    
    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    };
    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

};
