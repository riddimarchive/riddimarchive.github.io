const LocalStrategy = require('passport-local').Strategy;
const createConnection = require('./dbconnect');
const has = require('./hash');
const querie = require('./makequery');

module.exports = function(passport){
	passport.use(
		new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {

			async function hashAndCheckResults(pass){
      			try{
					var db = createConnection();

					await querie.connect(db);
					let result = await querie.getUserInfo(db, username);
					//end connection
					await querie.end(db);

					//check - user in database?
					if (result.length < 1){
            			return done(null, false, { message: 'User NOT FOUND!'});
          			}else{

						//run hash compare - get boolean isMatch
						let isMatch = await has.passCheck(password, result[0].password);
	
						//check - password is correct?
						if(isMatch){
						    return done(null, result[0]);
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
		console.log("Serializing...");
  		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
  		var db = createConnection();

  		async function doThings(id){
      			try{

  						await querie.connect(db);
						let result = await querie.getUserByid(db, id);
						await querie.end(db);

						console.log("DeSerializing...");
    					done(null, result[0]);
    				}catch(error){
          				console.log(error);
      				}
  			}//end async function
  			doThings(id);
  	 	
	});


}
