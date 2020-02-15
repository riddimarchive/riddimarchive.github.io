function connect(db){

	let connectpromise = new Promise(function(resolve, reject){
		db.connect((err) => {
	  		if(err){
		    	console.log('ERROR COULD NOT CONNECT NERD');
		    	reject(err);
		  	}
			console.log('Connected to the DB!!!');
		  	resolve();
		});
	});
	return connectpromise;
}

function end(db){

	let endpromise = new Promise(function(resolve, reject){
		db.end((err) =>{
	  		if(err){
	    		console.log('cant end connecty');
	    		reject(err);
	  		}
	  		console.log('Connection ended yo');
	  		resolve();
  		});
	});
	return endpromise;

}


function getArtistInfo(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM artists WHERE artist_name = "${artist_name}"`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllTracksFromArtist(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM tracks WHERE artist_name = "${artist_name}"`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function addUser(db, user){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO users (id, access_level, username, password) VALUES (${user.id}, ${user.access_level}, ${user.username}, ${user.password})`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function addTrack(db, track){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO tracks (id, artist_id, artist_name, track_name, collab_artist, collab_artist2, collab_artist3, year, drive_url) VALUES (${track.id}, ${track.artist_id}, ${track.artist_name}, ${track.track_name}, ${track.collab_artist}, ${track.collab_artist2}, ${track.collab_artist3}, ${track.year}, ${track.drive_url})`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function addArtist(db, artist){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO users (id, artist_name, crew, country, info) VALUES (${artist.id}, ${artist.artist_name}, ${artist.crew}, ${artist.country}, ${artist.info})`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getUserInfo(db, username){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM users WHERE username = "${username}"`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function getUserbyID(db, id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM users WHERE id = "${id}"`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}


module.exports = {
	connect,
	end,
	getArtistInfo,
	getAllTracksFromArtist,
	addUser,
	addTrack,
	addArtist,
	getUserInfo,
	getUserbyID
};