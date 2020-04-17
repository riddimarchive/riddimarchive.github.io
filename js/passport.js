//module and file requests: passport local, database connect, query and hash functions
const LocalStrategy = require('passport-local').Strategy;
const createConnection = require('./dbconnect');
const has = require('./hash');
const conquerie = require('./conquery');
const userquerie = require('./userquery');

module.exports = function(passport){
	passport.use(
		new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {

			async function hashAndCheckResults(pass){
      			try{
      				//make db connection and get query
					var db = createConnection();
					await conquerie.connect(db);
					let result = await userquerie.getUserInfo(db, username);
					await conquerie.end(db);

					//check - user in database?
					if (result.length < 1){
						//note - this message will not display yet
            			return done(null, false, { message: 'Username or Password is incorrect'});
          			}else{

						//check - password correct? compare with hashed pass
						let isMatch = await has.passCheck(password, result[0].password);
	
						//check - password is correct?
						if(isMatch){
						    return done(null, result[0]);
						}else{
							//note - this message will not display yet
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

  						await conquerie.connect(db);
						let result = await userquerie.getUserByid(db, id);
						await conquerie.end(db);

						console.log("DeSerializing...");
    					done(null, result[0]);
    				}catch(error){
          				console.log(error);
      				}
  			}//end async function
  			doThings(id);
  	 	
	});


}
