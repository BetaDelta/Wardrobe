Users = new Meteor.Collection("users");

if (Meteor.isClient) {

	Meteor.startup(function() {
		console.log("started at " + location.href);
	});

	Meteor.Router.add({
		'/': 'home',

		'/welcome': 'hello',

		'/posts/:id':function(id) {
			Session.set('postId', id);
			return 'post'
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


	Template.hello.greeting = function () {
		return "Welcome to Wardrobe, ";
	};
	
  Template.hello.testing = function () {
    var currUser = Users.findOne({"id":0}, {"name": 1});
		return currUser;
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
		if (Users.find().count() === 0) {
			var names = ["Rahul",
									 "Alan",
									 "Brian"];
			for(var i = 0; i < names.length; i++) {
				Users.insert({name: names[i], id: i});
			}
		}
	});
}
