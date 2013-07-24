
////////////////////////////////////////////////////////////
/////////////  DEFINE DATA MODEL   /////////////////////////
////////////////////////////////////////////////////////////

ImageData = new Meteor.Collection("ImageData");

ImageDataFS = new CollectionFS("ImageData", {autopublish:false});

ImageDataFS.allow({
	insert: function(userId, myFile) {return true;},
	update: function(userId, myFile) {return true;},
	remove: function(userId, myFile) {return true;}
});

////////////////////////////////////////////////////////////
/////////////  END DATA MODEL   ////////////////////////////
////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
/////////////  BEGIN CLIENT BLOCK   ////////////////////////
////////////////////////////////////////////////////////////

if (Meteor.isClient) {

	Meteor.startup(function() {
		console.log("started at " + location.href);

		$('#imgUpload').change(function(){
			console.log("something added");
			readURL(this);
		});
		
		Meteor.call('getFilePickerApiKey',		// potential race condition. 
			function(error, result){						// almost impossible though.
				console.log(result);
				filepicker.setKey(result);	
			});
	});


///////////////////////////////////////////////////////
///			functions for 'Main' template							  ///
///////////////////////////////////////////////////////


	Template.Main.SignedIn = function(){
		if(Session.get("activity") == null) {
			Session.set("activity", "review");
		}
		return (Meteor.user() ? true : false);	
	};

///////////////////////////////////////////////////////
///			functions for 'login-lite' template				  ///
///////////////////////////////////////////////////////

	Template.loginLite.events({
		'click #login-buttons-facebook' : function() {
			Meteor.loginWithFacebook({requestPermissions: ['email']},
			function(error) {
				if (error) {
					return console.log(error);
				}
			});
			Session.set("activity", "review");
			console.log("just logged in");
		}
	});

///////////////////////////////////////////////////////
///			functions for 'loggedIn' template		  		  ///
///////////////////////////////////////////////////////


	Template.loggedIn.UploadActive = function() {
		return ((Session.get("activity") == "upload") ? true : false);
	}
	Template.loggedIn.RateActive = function() {
		console.log(Session.get("activity"));
		return ((Session.get("activity") == "rate") ? true : false);
	}
	Template.loggedIn.ReviewActive = function() {
		return ((Session.get("activity") == "review") ? true : false);
	}


	Template.loggedIn.Activity = function() {
		return Session.get("activity");
	}

///////////////////////////////////////////////////////
///			functions for 'uploadActivity' template			///
///////////////////////////////////////////////////////

	Template.uploadActivity.rendered = function() {
		filepicker.constructWidget(document.getElementById('imgUpload'));
		console.log("getting here");
	};

	Template.uploadActivity.events({
		'click .submitButton' : function(e) {
			//var files = $("#imgUpload").prop("files");
			
			//var myFileId = ImageDataFS.storeFile(files[0]);
			// now we need to store the fileId in ImageData so
			// we can access it later for image recall.
			
			//alert("helloworld");
			
			var currFileURL = $('#imgUpload').val();

			try{
				var initVote = [];
				
				//initVote.push({voter:Meteor.user()._id, vote: 0}); // ***DEV***

				var record = ImageData.insert({"owner":Meteor.user()._id,
												"fileUrl":currFileURL,
												"randIndex":Math.random(),
												"rated":0,
												"up":0,
												"down":0,
												"votes": initVote
												});
				console.log("record is " + record);
				// now we need to set the id of what we just created.
				
				Meteor.users.update(
											{_id : Meteor.user()._id }, 
											{$push : {uploads : {fileId: record, thumb:currFileURL}}}
										); // add this record to our list of uploads.
			} catch(e) {
				alert(e);
			}

			//alert(myFileId);
			//alert("got here");
			Session.set("activity", "rate");
		},
		'change #imgUpload' : function(e) {
			console.log('change event captured');
			// here we will now need to update our preview element.
			var imgURL = e.target.value;
			$('#preview').attr('src', imgURL);
		}
	});

///////////////////////////////////////////////////////
///			functions for 'rateActivity' template				///
///////////////////////////////////////////////////////

	Template.rateActivity.imageData = function() { 
		if(Session.get("currImageId") == null) {
			return null;
		} else {
			return ImageData.findOne({_id:Session.get("currImageId")});
		}
	}

	/*
	 * returns the image URL from filepicker for image handling.
	 */
	Template.rateActivity.nextImage = function() {
		// we will use $in to prototype, then switch to $nin
		
		var imageRecords = ImageData.find({"votes.voter": {$ne : Meteor.user()._id} }, {sort: {_id: -1}});
		var imageRecord = imageRecords.fetch()[0];
		
		if(imageRecord == null) {
			console.log("you have rated all available images on the database");
			imageRecord = {fileUrl: "#"};
		}
		// set the current image.
		Session.set('currImageId', imageRecord._id);

		console.log(imageRecord);
		return imageRecord;
	};
	
	/* 
	 * events handler for events on the rate page. should handle:
	 *
	 *		-> Upvote
	 *		-> Downvote
	 *		-> Flagging (* not yet implemented)
	 */
	Template.rateActivity.events({
		'click .upButton' : function() {
			if(Session.get("currImageId") != null) {
				ImageData.update( 
					{ _id:Session.get("currImageId") }, 
					{ 
						$inc: { up: 1}, 
						$push: {votes: {voter:Meteor.user()._id, vote: 1 }}
					}
				);									
			}
		},
		'click .downButton' : function() {
			if(Session.get("imageUpdateId") != null) {
				ImageData.update( 
					{ _id:Session.get("currImageId") }, 
					{ 
						$inc: { down: 1}, 
						$push: {votes: {voter:Meteor.user()._id, vote: -1 }}
					}
				);					
			}
		}
	});

///////////////////////////////////////////////////////
///			functions for 'myImages' template						///
///////////////////////////////////////////////////////


///////////////////////////////////////////////////////
///			functions for 'hello' template							///
///////////////////////////////////////////////////////
/*
	Template.hello.greeting = function () {
		return JSON.stringify(Meteor.user());
	};
	
  Template.hello.testing = function () {
		return {name:"User"};
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
			Meteor.loginWithFacebook({requestPermissions: ['email']},
			function(error) {
				if (error) {
					return console.log(error);
				}
			});
			console.log("helloworld");
    }
  });

///////////////////////////////////////////////////////
///			functions for 'myHeader' template						///
///////////////////////////////////////////////////////


	Template.myHeader.userName = function() {
		//alert("helloworld");
		if(Meteor.user() == null) {
			return "Sign In";
		} else {
			return Meteor.user().services.facebook.name;
		}
	};

	Template.myHeader.events({
		'click .login-button' : function() {
			//alert("helloworld");
			$('#login-bar').slideDown(300, function(){});
		}
	});

///////////////////////////////////////////////////////
///			functions for 'uploadImage' template				///
///////////////////////////////////////////////////////

	Template.uploadImage.events({
		'click .submitButton' : function(e) {
			var files = $("#imgUpload").prop("files");
			
			var myFileId = ImageDataFS.storeFile(files[0]);
			// now we need to store the fileId in ImageData so
			// we can access it later for image recall.
			
			//alert("helloworld");
			try{
				ImageData.insert({"owner":Meteor.user()._id,
												"fileId":myFileId});
			}catch(e){
			alert(e);
			}
			alert(myFileId);
			//alert("got here");
			
		}
	});

///////////////////////////////////////////////////////
///			functions for 'rateImage' template					///
///////////////////////////////////////////////////////


	 var initializeImage = function () {
	 //	alert("trying to initialize now");
		var reader = new FileReader();

		reader.onload = function(e) {
			$('#subjectImage').attr("src", e.target.result);
		};
	
		//alert(JSON.stringify(Meteor.user()));

		if(Meteor.user() != null){
			alert("if");
			var imageRecord = ImageData.findOne({"owner":Meteor.user()._id});
		}
		else {
			alert("else");
			setTimeout(function() {initializeImage();}, 100);
			return;
		}

		var blob = ImageDataFS.retrieveBlob(imageRecord.fileId, function(fileItem){
			if(fileItem.blob)
				reader.readAsDataURL(fileItem.blob);
			else
				reader.readAsDataURL(fileItem.file);
		});

		return reader.result;
	};

	
	Template.rateImage.randImage = function() {
		
		var reader = new FileReader();

		reader.onload = function(e) {
			$('#subjectImage').attr("src", e.target.result);
		};

		//alert(JSON.stringify(Meteor.user()));
		//alert(Meteor.loggingIn());
		if(Meteor.user() != null){
			alert("if");
			var imageRecord = ImageData.findOne({"owner":Meteor.user()._id});
		}
		else {
			alert("else");
			setTimeout(function() {initializeImage();}, 100);
			return "#";
		}

		//alert(JSON.stringify(imageRecord));

		var blob = ImageDataFS.retrieveBlob(imageRecord.fileId, 
			function(fileItem){
				if(fileItem.blob)
					reader.readAsDataURL(fileItem.blob);
				else
					reader.readAsDataURL(fileItem.file);
			});
		
		return "#";
	};


	Template.rateImage.rendered = function() {
		//alert("rate image page rendered");
		//initializeImage();
	};




*/

///////////////////////////////////////////////////////
///			auxiliary functions for application					///
///////////////////////////////////////////////////////


	function readURL(input) {
		if(input.files && input.files[0]) {
			var reader = new FileReader();

			reader.onload = function(e) {
				$('#preview').attr('src', e.target.result);
			}

			reader.readAsDataURL(input.files[0]);
		}
	}
	
}

////////////////////////////////////////////////////////////
/////////////  END CLIENT BLOCK   //////////////////////////
////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////
/////////////  BEGIN SERVER BLOCK   ////////////////////////
////////////////////////////////////////////////////////////


if (Meteor.isServer) {
	
	Meteor.users.allow({
  	update: function (userId, user, fields, modifier) {
    	// can only change your own documents
    	if(user._id === userId)
    	{
				return true;
    	}
    	else return false;
  	}
	});
	
	



  Meteor.startup(function () {
    // code to run on server at startup
	
		// initialize appId and secret for Facebook OAuth login
		Accounts.loginServiceConfiguration.remove({
  		service: "facebook"
		});

		Accounts.loginServiceConfiguration.insert({
    	service: "facebook",
    	appId: "335814393167914",
    	secret: "7beb443e431575153876e499721955fa"
		});



	});
	/** 
	 * meteor methods on the server side is to be called by 
	 * the 
	 */
	Meteor.methods({
		recentUpload: function(userId) {
			// here we will want to get the most recent upload	


			console.log("getting called at least, arg = " + arg);
			return "hellworld";	
		},
		getFilePickerApiKey: function() {
			return 'AUJvtLFH9ShOzNd1sxZTvz';
		}
	});
}

////////////////////////////////////////////////////////////
/////////////  END SERVER BLOCK   //////////////////////////
////////////////////////////////////////////////////////////

