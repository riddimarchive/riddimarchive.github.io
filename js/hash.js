const bcrypt = require('bcryptjs');

function hashPass(pass){

	let hashpromise = new Promise(function(resolve, reject){
		
		bcrypt.genSalt(10, (err, salt) => bcrypt.hash(pass, salt, (err, hash) => {
    		if(err){
	      		console.error('An error occurred while hashing');
	      		reject(err);
	    	}
    		console.log("the hash is = " + hash);
    		resolve(hash);

  		}));

	});

	return hashpromise;
}


module.exports = {
	hashPass
};