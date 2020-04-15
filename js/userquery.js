function addUser(db, username, password, access_level){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO users(username, password, access_level) VALUES (?, ?, ?)`, [username, password, access_level], (error, result, fields) => {
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
		db.query(`DELETE FROM users WHERE username = ? LIMIT 1`, [username], (error, result, fields) => {
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
		db.query(`SELECT * FROM users WHERE id = ?`, [id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function getUserFavorites(db, id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.artist_name, tracks.track_name, tracks.drive_url FROM tracks INNER JOIN userfavorites ON tracks.id = userfavorites.track_id WHERE userfavorites.user_id = ?`, [id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function checkUserFavorite(db, user_id, track_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM userfavorites WHERE user_id = ? AND track_id = ?`, [user_id, track_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function addUserFavorite(db, user_id, track_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO userfavorites(user_id, track_id) VALUES (?, ?)`, [user_id, track_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function deleteUserFavorite(db, user_id, track_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM userfavorites WHERE user_id = ? AND track_id = ? LIMIT 1`, [user_id, track_id], (error, result, fields) => {
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
		db.query(`SELECT * FROM users WHERE username = ?`, [username], (error, result, fields) => {
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
	addUser,
	deleteUser,
	getUserByid,
	getUserFavorites,
	checkUserFavorite,
	addUserFavorite,
	deleteUserFavorite,
	getUserInfo
};