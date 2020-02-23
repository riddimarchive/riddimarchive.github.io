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

function getTrackInfo(db, track_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM tracks WHERE track_name = "${track_name}"`, (error, result, fields) => {
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
		db.query(`SELECT tracks.track_name, tracks.drive_url, artists.id, artists.crew, artists.country, artists.artist_name FROM tracks INNER JOIN artists ON tracks.artist_name = artists.artist_name WHERE tracks.artist_name = "${artist_name}"`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function addUser(db, username, password, access_level){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO users(username, password, access_level) VALUES ("${username}", "${password}", "${access_level}")`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function deleteUser(db, username){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM users WHERE username = "${username}" LIMIT 1`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function addTrack(db, artist_id, artist_name, track_name, collab_artist, drive_url){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO tracks(artist_id, artist_name, track_name, collab_artist, drive_url) VALUES (${artist_id}, "${artist_name}", "${track_name}", "${collab_artist}", "${drive_url}")`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function deleteTrack(db, track_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM tracks WHERE track_name = "${track_name}" LIMIT 1`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function addArtist(db, artist_name, crew, country, info){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO artists (artist_name, crew, country, info) VALUES ("${artist_name}", "${crew}", "${country}", "${info}")`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function deleteArtist(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM artists WHERE artist_name = "${artist_name}" LIMIT 1`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function getUserByid(db, id){

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


module.exports = {
	connect,
	end,
	getArtistInfo,
	getTrackInfo,
	getAllTracksFromArtist,
	addUser,
	deleteUser,
	addTrack,
	deleteTrack,
	addArtist,
	deleteArtist,
	getUserByid,
	getUserInfo
};