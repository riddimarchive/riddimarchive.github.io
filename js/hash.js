const bcrypt = require('bcryptjs');

function hashPass(pass){

	let hashpromise = new Promise(function(resolve, reject){
		
		bcrypt.genSalt(10, (err, salt) => bcrypt.hash(pass, salt, (err, hash) => {
    		if(err){
	      		console.error('An error occurred while hashing');
	      		reject(err);
	    	}
    		resolve(hash);

  		}));

	});

	return hashpromise;
}

function passCheck(pass, hashpass){

	let comparepromise = new Promise(function(resolve, reject){
		
		bcrypt.compare(pass, hashpass, (err, isMatch) => {

			if(err){
				console.error('An error occurred while hashing');
				reject(err);
			}

			resolve(isMatch);
		});

	});

	return comparepromise;
}

module.exports = {
	hashPass,
	passCheck
};