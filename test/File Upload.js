const fileUpload = require('express-fileupload');

//express file-upload
app.use(fileUpload());

if (!req.files || Object.keys(req.files).length === 0) {
    console.log('No files were uploaded.');
  }else{

  let artist_img = req.files.img;
  artist_img.mv(`public/Images/Logos/${artist_name}.jpg`, function(err) {
    if (err){
      console.log(err);
    }

    console.log('File uploaded!');
  });

  }//end file transfer


  form(method='POST', action='/artistcreate', enctype='multipart/form-data')
  	div.form-group
		label(for='img') Upload IMG: 
		input#img.form-control(type='file', name='img')
	div
		button.btn.btn-primary.btn-block(type='submit') Submit