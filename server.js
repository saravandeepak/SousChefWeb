// modules =================================================
var express        = require('express');
var path = require('path');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var authenticate = require('./API/authenticate')(passport); 
var mongoose       = require('mongoose');
var mongoStore = require('connect-mongo')(session);
require('./app/models/model');



// configuration ===========================================

// set our port
var port = process.env.PORT || 8080; 

// connect to our mongoDB database 
mongoose.connect('mongodb://localhost/souschef');

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({resave: true, 
                 saveUninitialized: true, 
                 secret: 'secret',
                 store: new mongoStore({ url: 'mongodb://localhost/souschef',clear_interval: 60*60 }), 
                 cookie: { maxAge: 60000 }}));


//cors enable
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Content-Type, Authorization");
    next();
})

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 
app.use(passport.initialize());
app.use(passport.session());

//set up views
app.set('views', path.join(__dirname, 'public/pages'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// routes ==================================================
//require('./app/routes')(app); // configure our routes
var api = require('./API/api');
app.use('/auth', authenticate);
var initPassport = require('./passport-init');
initPassport(passport);

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);               

// shoutout to the user                     
console.log('Magic happens on port ' + port);

// expose app           
exports = module.exports = app;                         

