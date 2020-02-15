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
						    console.log("Pass is correct!!! User id is: " + result[0].id);
						    return done(null, result[0]);
						}else{
						    return done(null, false, {message: 'Password incorrect'});
						}
	
          			}//result length else

      			}catch(err){
          			console.log(err);
      			}
  			}//end async has function
			console.log("In Local Strategy! Running Hash and Query Fcns");
  			hashAndCheckResults(password);

		})
	);


	passport.serializeUser((user, done) => {
		console.log("Serializing...");
		console.log("in serial the user id is: " + user.id);
  		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
  		var db = createConnection();

  		async function doThings(id){
      			try{

  						await querie.connect(db);
  						console.log("CON CON CON CON CO NC ONCONC");
						let result = await querie.getUserByID(db, id);
						await querie.end(db);



						console.log("DeSerializing...");
    					done(err, result[0]);
    				}catch(err){
          				console.log(err);
      				}
  			}//end async function
			console.log("In Deserial Fcn! Running Query Fcns");
  			doThings(id);
  	 	
	});


}
