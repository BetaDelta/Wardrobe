Temp = new Meteor.Collection("TempDb");

ImageData = new Meteor.Collection("ImageData");

ImageDataFS = new CollectionFS("ImageData", {autopublish:false});

ImageDataFS.allow({
	insert: function(userId, myFile) {return true;},
	update: function(userId, myFile) {return true;},
	remove: function(userId, myFile) {return true;}
});



if (Meteor.isClient) {
	Meteor.startup(function() {
		console.log("started at " + location.href);

		$('#imgUpload').change(function(){
			readURL(this);
		});

		$('#subjectImage').ready(function(){
			//alert("done");
			setTimeout(function(){initializeImage();},1000);
			//alert("done here too");
			//initializeImage();
		});



	});

	Meteor.Router.add({
		'/': 'home',

		'/welcome': 'hello',

		'/posts/:id':function(id) {
			Session.set('postId', id);
			return 'post'
		},
		
		'/upload': 'uploadImage',

		'/rate': function(){
			//setTimeout(function(){
				//alert("being called");
			//	initializeImage();
			//}, 1000);
			//Meteor.defer(function(){initializeImage();});
			return 'rateImage'
		}
	});


	/*
	Meteor.Router.filters({
		requireLogin: function(page) {
			var username = Session.get('username');
			if(username)
				return page;
			else
				return 'sign_in';
		}
	
	});

	Meteor.Router.filter('requireLogin', {only: 'welcome'});
  */
	

///////////////////////////////////////////////////////
///			functions for 'hello' template							///
///////////////////////////////////////////////////////

	Template.hello.greeting = function () {
		return JSON.stringify(Meteor.user());
	};
	
  Template.hello.testing = function () {
    var currUser = Temp.findOne({"id":0}, {"name": 1});
		return currUser;
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
			alert("hellow");
			var files = $("#imgUpload").prop("files");
			
			var fileId = ImageDataFS.storeFile(files[0]);
			
			alert(fileId);
			alert("got here");
			
		}
	});

///////////////////////////////////////////////////////
///			functions for 'rateImage' template					///
///////////////////////////////////////////////////////

var cacheImageResult;



	 var initializeImage = function () {
	 	alert("trying to initialize now");
		var reader = new FileReader();
		reader.onload = function(e) {
			//alert("loaded properly");
			$('#subjectImage').attr("src", e.target.result);
			//alert("result recieved");
			//cacheImageResult = e.target.result;
		};
	
		//alert(JSON.stringify(Meteor.user()));

		var imageRecord = ImageDataFS.findOne({"owner":Meteor.user()._id});
		
		//alert(imageRecord._id);

		//alert(JSON.stringify(imageRecord));

		var blob = ImageDataFS.retrieveBlob(imageRecord._id, function(fileItem){
			if(fileItem.blob)
				reader.readAsDataURL(fileItem.blob);
			else
				reader.readAsDataURL(fileItem.file);
		});

		return null;
	};

	Template.rateImage.rendered = function() {
		//alert("rate image page rendered");
		//initializeImage();
	};






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

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
		if (Temp.find().count() === 0) {
			var names = ["Rahul",
									 "Alan",
									 "Brian"];
			for(var i = 0; i < names.length; i++) {
				Temp.insert({name: names[i], id: i});
			}
		}
	});
}
