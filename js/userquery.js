function addUser(db, username, password, access_level){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO users(username, password, access_level) 
		VALUES (?, ?, ?)`, [username, password, access_level], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function createAccount(db, username, password){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO users(username, password, access_level) 
		VALUES (?, ?, 1)`, [username, password], (error, result, fields) => {
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

function changePass(db, username, password){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE users SET password = ? WHERE username = ?`, [password, username], (error, result, fields) => {
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

function getUsernamebyID(db, id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT username FROM users WHERE id = ?`, [id], (error, result, fields) => {
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
		db.query(`SELECT tracks.id, tracks.artist_name, tracks.track_name, tracks.drive_url, tracks.collab_artist, tracks.original_artist, tracks.is_remix, tracks.is_collab FROM tracks 
		INNER JOIN userfavorites ON tracks.id = userfavorites.track_id 
		WHERE userfavorites.user_id = ? 
		ORDER BY tracks.artist_name`, [id], (error, result, fields) => {
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
		db.query(`SELECT * FROM userfavorites 
		WHERE user_id = ? AND track_id = ?`, [user_id, track_id], (error, result, fields) => {
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
		db.query(`INSERT INTO userfavorites(user_id, track_id) 
		VALUES (?, ?)`, [user_id, track_id], (error, result, fields) => {
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
		db.query(`DELETE FROM userfavorites 
		WHERE user_id = ? AND track_id = ? LIMIT 1`, [user_id, track_id], (error, result, fields) => {
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
		db.query(`SELECT * FROM users 
		WHERE username = ?`, [username], (error, result, fields) => {
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
	createAccount,
	deleteUser,
	changePass,
	getUserByid,
	getUsernamebyID,
	getUserFavorites,
	checkUserFavorite,
	addUserFavorite,
	deleteUserFavorite,
	getUserInfo
};