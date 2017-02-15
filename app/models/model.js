var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
	name: String,
	password: String,
	phoneNum: Number,
	email: String,
	addressLine1: String,
	addressLine2: String,
	city: String,
	zipCd: String,
	state: String,
    pic: String
});

var orderSchema = new mongoose.Schema({
    order:[{
        name: String,
        subtotal: Number,
        serving: Number,
        price: Number,
        people: Number,
        shortname: String
    }],
    charge:{
        total: Number,
        shipping: Number
    },
    user: String
});


mongoose.model('User', userSchema);
mongoose.model('Order', userSchema);