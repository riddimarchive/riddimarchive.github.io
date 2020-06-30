const aws = require('aws-sdk');

function uploadToS3(file, islogo, artist_name, artfirstletter, makepublic) {
	let s3bucket = new aws.S3({
	  accessKeyId: process.env.ACCESS_KEY,
	  secretAccessKey: process.env.SECRET_ACCESS_KEY,
	  Bucket: process.env.BUCKET,
	});
	s3bucket.createBucket(function () {
	  var tagstring = `Artist=${artist_name}`;
	  if (makepublic == 1){
		console.log("MAKE PUBLIC");
		tagstring = `public=yes&Artist=${artist_name}`;
		console.log("Tagstring below");
		console.log(tagstring);
	  }
	  var params = {
		Bucket: process.env.BUCKET,
		Tagging: `${tagstring}`,
		Key: `${artfirstletter}/${artist_name}/${file.name}`,
		Body: file.data,
	  };
	  if (islogo == 1){
		params = {
			Bucket: process.env.BUCKET,
			Tagging: `${tagstring}`,
			Key: `Images/${artfirstletter}/${artist_name}/${file.name}`,
			Body: file.data,
		};
	  }
	  s3bucket.upload(params, function (err, data) {
		console.log("in upload function");
	   if (err) {
		console.log('error in callback');
		console.log(err);
	   }
	   console.log('success');
	   //console.log(data);
	  });
	});
  }

module.exports = {
	uploadToS3
};