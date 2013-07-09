Temp = new Meteor.Collection("TempDb");

ImageData = new Meteor.Collection("ImageData");

ImagesDataFS = new CollectionFS("ImageData", {autopublish:false});


if (Meteor.isClient) {
	Meteor.startup(function() {
		console.log("started at " + location.href);

		$('#imgUpload').change(function(){
			readURL(this);
		});


	});

	Meteor.Router.add({
		'/': 'home',

		'/welcome': 'hello',

		'/posts/:id':function(id) {
			Session.set('postId', id);
			return 'post'
		},
		
		'/upload': 'uploadImage'
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
			var file = $("#imgUpload").files;
			alert("hello again");
			
		}
	});


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
