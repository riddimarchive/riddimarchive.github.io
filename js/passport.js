const LocalStrategy = require('passport-local').Strategy;
const createConnection = require('./js/dbconnect');
const has = require('./js/hash');

module.exports = function(passport){
	passport.use(
		new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
			//check user name

			async function hashAndCheckResults(pass){
      			try{
          			var thepass = pass;
					var user = {};

					var db = createConnection();

					await querie.connect(db);
					let result = await querie.getUserInfo(db, username);
					//end connection
					await querie.end(db);

					//check - user in database?
					if (result.length < 1){
            			return done(null, false, { message: 'User NOT FOUND!'});
          			}else{
	
                		//store info
                		user.username = result[0].username;
						user.access_level = result[0].access_level;
						user.password = result[0].password;
	
						//run hash compare - get boolean isMatch
						let isMatch = await has.passCheck(password, user.password);
	
						//check - password is correct?
						if(isMatch){
						    return done(null, user);
						}else{
						    return done(null, false, {message: 'Password incorrect'});
						}
	
          			}//result length else

      			}catch(err){
          			console.log(err);
      			}
  			}//end async has function

  			hashAndCheckResults(password);

		})
	);


	passport.serializeUser((user, done) => {
  		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
  		User.findById(id, (err, user) => {
    		done(err, user);
  	 	});
	});


}