
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

	Meteor.subscribe("userData");


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
		},
		'submit #login-form' : function (e, t) {
			console.log("getting here");
			e.preventDefault();

			var email = t.find('#login-email').value;
			var password = t.find('#login-password').value;
			
			console.log(email + " | " + password);
			// VALIDATE input here.
			
			Meteor.loginWithPassword(email, password, function(err) {
				if(err) {
					console.log("account does not exist");
					//then user does not exist.
					var rec = Meteor.users.findOne({email: email});
					if(rec == null){
						Accounts.createUser({email:email, password:password}, function(err) {
							// failed to create user
							console.log("failed to create user due to: "+err);
						});
					} else {
						// incorrect password, this email is already registered.
					}
					//we might try to validate here.
				} else { 
					//user has been successfully loged in.
					console.log("logged in");
					Session.set('activity', 'rate');
				}
			});
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
												"votes": initVote,
												"seen": [] // ***DEV*** potential shim.
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
		var testArray = [];
		testArray[0] = Meteor.user()._id;

		console.log(testArray);

		var imageRecords = ImageData.find({"seen": {$nin : [Meteor.user()._id]}} , {sort: {_id: -1}});

		console.log(imageRecords);
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
						$push: {votes: {voter:Meteor.user()._id, vote: 1 }},
						$push: {seen: Meteor.user()._id}
					}
				);									
			}
		},
		'click .downButton' : function() {
			if(Session.get("currImageId") != null) {
				ImageData.update( 
					{ _id:Session.get("currImageId") }, 
					{ 
						$inc: { down: 1}, 
						$push: {votes: {voter:Meteor.user()._id, vote: -1 }},
						$push: {seen: Meteor.user()._id}
					}
				);					
			}
		}
	});

///////////////////////////////////////////////////////
///			functions for 'allUploaded' template				///
///////////////////////////////////////////////////////


	Template.allUploaded.userImages = function() {
		//console.log(Meteor.user().uploads);
		//console.log(Meteor.user());
		var myFullUser = Meteor.users.findOne({_id : Meteor.user()._id}, {fields: {uploads:1}});
		var myUploads = myFullUser.uploads;
		console.log("my Uploads");
		console.log(myUploads);
		return myUploads;
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
  	},
		insert : function (userId, user) {
			if (user._id === userId) {
				return true;
			}
			else return false;
		}
	});
	
	Meteor.publish("userData", function() {
		return Meteor.users.find({_id:this.userId}, {fields: {'uploads' : 1}});
	});


  Meteor.startup(function () {
    // code to run on server at startup
	
		// initialize appId and secret for Facebook OAuth login
		Accounts.loginServiceConfiguration.remove({
  		service: "facebook"
		});

		Accounts.loginServiceConfiguration.insert({
    	service: "facebook",
    	appId: "392488057467249",
    	secret: "09e038bb304876327fecf91f6bf31d76"
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

