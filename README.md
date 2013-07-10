/**
 *  README file for Wardrobe repository | Fashion Advice Project
 */

/////////////////////////////////////////////////////////////
////////////   BUILD INSTRUCTIONS   /////////////////////////
/////////////////////////////////////////////////////////////

Wardrobe is built using Node.js coupled with the Meteor 
framework.  Wardrobe also uses third party extensions and
addons to Meteor for much of its functionality.  These 
extensions are handled by the native Meteor package manager
Meteorite.

//// DEPENDENCIES :
	
	./git (you will need the command line tool)
	./meteor (Meteor)
	./mrt (Meteorite)
	./node (Node.js)

You should be able to pretty easily find and install these
dependencies in your development environment.  If any of these
are missing, then the project will not build properly and
run.

//// BUILD NOTES:

This project is currently using Facebook OAuth for authentication
and handling of user identification.  In order for this to
work properly, the Facebook appId and appSecret must be 
correctly configured on the mongoDb instance used.

However, Facebook requires separate credentials for dev and prod.

dev:

 >> {service:"facebook", appId:"335814393167914",
				secret:"7beb443e431575153876e499721955fa"}

prod: (deploy to rahul.meteor.com)
 >> {service:"facebook", appId:"392488057467249",
				secret:"09e038bb304876327fecf91f6bf31d76"}

When you are ready to build and run, and have all dependencies,
simply navigate to the wardrobe-src directory and type

	$mrt

This will start the Meteorite package check process, and finally
run the Meteor server on the localhost:3000/ port.  You wil then
be ready to develop!





