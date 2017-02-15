var express = require('express');
var router = express.Router();


module.exports = function(passport){
    
   	router.get('/success', function(req, res){
        req.session.cookie.lastLogin = new Date().getTime();
        req.session.name = req.user.name;
        req.session.username = req.user.email;
        req.session.password = req.user.password;
        res.send({status: 200,state: 'success', user: req.user ? req.user : null});
    });

    router.get('/mail/success', function(req, res){
        res.send({status: 200,state: 'failure', message:req ? req : null});
    });
    
    router.get('/failure', function(req, res){
        res.send({status: 500,state: 'failure', message:res ? res : null});
    });

   	//sign up
    router.post('/register', passport.authenticate('register', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    //update a user profile
    router.post('/update', passport.authenticate('update', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    //log in
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    //log out
    router.get('/logout', function(req, res) {
        req.session.destroy();
        req.logout();
        console.log("user logged out.log out called and session.destroy() called.");
        res.redirect('/');
    });
    
    //Order
    router.post('/order', passport.authenticate('order', {
         successRedirect: '/auth/success',
         failureRedirect: '/auth/failure'
    }));
    
    //forgot password
    router.post('/forgotPassword', passport.authenticate('forgotPassword', {
         successRedirect: '/auth/success',
         failureRedirect: '/auth/failure'
    }));
    
    //send mail to us
    router.post('/contactus', passport.authenticate('contactus', {
         successRedirect: '/auth/mail/success',
         failureRedirect: '/auth/failure'
    }));
    
    //keep session alive
    router.post('/keepSessionAlive', function(req, res){
        
        if(typeof req.session.username != 'undefined' && typeof req.cookies['connect.sid'] != 'undefined') {
            console.log(req.cookies['connect.sid']+":: user is :"+req.session.username);
            res.send({status: 200,state: 'success', user: req.session ? req.session : null});
        }else{
            req.logout();
            console.log("user logged out. aaw not alive");
            res.send({status: 500,state: 'failure', message:res ? "session expired" : null});
        }
    });
    
    return router;

}