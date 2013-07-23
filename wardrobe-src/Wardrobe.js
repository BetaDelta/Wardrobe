
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


////////////// UNTRUSTED BLOCK //////////////////////////

/*
    (function(d, debug){
         var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement('script'); js.id = id; js.async = true;
         js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
         ref.parentNode.insertBefore(js, ref);
       }(document,  false));
       
    window.fbAsyncInit = function() {
            // init the FB JS SDK
        FB.init({
          appId      : 'YOUR_APP_ID', // App ID from the App Dashboard
          channelUrl : '//localhost:3000/channel.html', // Channel File for x-domain communication for localhost debug
          // channelUrl : '//yoururl.com/channel.html', // Channel File for x-domain communication
          status     : true, // check the login status upon init?
          cookie     : true, // set sessions cookies to allow your server to access the session?
          xfbml      : true  // parse XFBML tags on this page?
        });
    
        FB.getLoginStatus(checkLoginStatus);
        
        function call_facebook_login(response){
            FB.api('/me', function(fb_user){
                var access_token = response.authResponse.accessToken;
                Meteor.call('facebook_login', fb_user, access_token, function(error, user_id){
                    if (!error){
                        Accounts._makeClientLoggedIn(user_id, access_token);
                    }
                });
            });
        }
    
        function checkLoginStatus(response) {
            if(response && response.status == 'connected') {
                console.log('User is authorized');
          
                // Now Personalize the User Experience
                console.log('Access Token: ' + response.authResponse.accessToken);
                console.log(response)
                call_facebook_login(response);
            } else {
                console.log('User is not authorized');
                
                // Login the user
                FB.login(function(response) {
                    if (response.authResponse) {
                        console.log('Welcome!  Fetching your information.... ');
                        call_facebook_login(response);
                    } else {
                        console.log('User cancelled login or did not fully authorize.');
                    }
                }, {scope: 'email,friends_likes,friends_birthday'});
            }
        }
    }

*/
/////////////// end untrusted block /////////////////////









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
				ImageData.insert({"owner":Meteor.user()._id,
												"fileUrl":currFileURL,
												"randIndex":Math.random(),
												"rated":0,
												"up":0,
												"down":0,
												"votes":{}
												});
			}catch(e){
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
			return ImageData.findOne({fileId:Session.get("currImageId")});
		}
	}

	/*
	 * handles the logic for collision detection between 
	 * voted images and non-user images.
	 *
	 *
	 */
	Template.rateActivity.randImage = function() {
		
		var reader = new FileReader();

		reader.onload = function(e) {
			$('#subjectImage').attr("src", e.target.result);
		};

		//alert(JSON.stringify(Meteor.user()));
		//alert(Meteor.loggingIn());
		if(Meteor.user() != null){
			//alert("if");
			var myRand = Math.random();
			console.log(myRand);
			var imageRecords = null;
			var imageRecord = null;

				var imageRecords = ImageData.find({randIndex: {$gte:myRand}}, {sort: {randIndex: 1}});
				var imageRecord = imageRecords.fetch()[0];
				if (imageRecord == null) {
					console.log("getting to second run query");
					imageRecords = ImageData.find({randIndex: {$lte:myRand}}, {sort: {randIndex: -1}});
					imageRecord = imageRecords.fetch()[0];
				}
			if(imageRecord == null) {
				console.log("data base empty");
				return "#";
			}
			Session.set("currImageId", imageRecord.fileId); //***SESSION***
			Session.set("imageUpdateId", imageRecord._id); //***DEV***
		}
		else {
			alert("else");
			// this should never happen, and will crash the application.
			setTimeout(function() {initializeImage();}, 100);
			return "#";
		}

		//alert(JSON.stringify(imageRecord));
		try{
			var blob = ImageDataFS.retrieveBlob(imageRecord.fileId, 
				function(fileItem){
					if(fileItem.blob)
						reader.readAsDataURL(fileItem.blob);
					else
						reader.readAsDataURL(fileItem.file);
				});
		} catch (e) {
			console.log(e);
			console.log(imageRecord.fileId);
			console.log(imageRecord._id);
		}
		return "#";
	};

	Template.rateActivity.events({
		'click .upButton' : function() {
			if(Session.get("imageUpdateId") != null) {
				ImageData.update( 
					{ _id:Session.get("imageUpdateId") }, 
					{ $inc: { up: 1} }
				);									
			}
		},
		'click .downButton' : function() {
			if(Session.get("imageUpdateId") != null) {
				ImageData.update( 
					{ _id:Session.get("imageUpdateId") }, 
					{ $inc: { down: 1} }
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
  Meteor.startup(function () {
    // code to run on server at startup
	
		// initialize appId and secret for Facebook OAuth login
		Accounts.loginServiceConfiguration.remove({
  		service: "facebook"
		});

		Accounts.loginServiceConfiguration.insert({
    	service: "facebook",
    	appId: "392488057467249",
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

