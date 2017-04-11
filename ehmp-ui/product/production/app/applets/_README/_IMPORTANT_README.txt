Read Me If You Are:
	1) Adding a new applet to app/applets
	2) Deleting an old applet from app/applets

1) When adding a new applet, you must add the applet.js file to the "modules" array found in Gruntfile.js
	modules: [
        { name: 'min/applets/activeMeds/applet' },
        ...
        { name: 'min/applets/<your-applet-directory-name-goes-here>/applet' },
        ...
        { name: 'min/applets/short_cuts/applet' }
    ],

2) When deleting an old applet your build command will fail if you do not remove the path to your applet.js file from the "modules" array found in Gruntfile.js