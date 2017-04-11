define([
    'underscore',
    'jquery',
    'api/UserService',
    'api/Messaging',
    'main/components/views/popupView'
], function(_, $, UserService, Messaging, popupView) {

    /**
     * AutoLogoff intends to ensure the user has a resonably up to date token
     * based on application usage. After 12 min of inactivity a popup
     * asking the user if they would like to continue or logoff will display
     * (but also allow for ignoring the popup)
     * @return {Object}
     */
    var AutoLogoff = function() {

        var _this = this || {};

        // this will hold the refresh timeout
        var refreshTimer;
        var logoutTimeout;
        // at 3 minutes till logout
        var logoutWarning = 3;
        var sessionLength;

        // set a default of 7.5 seconds to request a refresh of the token
        _this.tokenInterval = 7500;

        var REFRESH_EVENTS = 'mouseup.autologoff mousedown.autologoff mousemove.autologoff keyup.autologoff keydown.autologoff';

        /**
         * Do the refreshing of token expiration on the server if the popup is not visible
         * @return {undefined}
         */
        var refreshToken = function() {
            if((UserService.getStatus() === UserService.STATUS.LOGGEDIN) && !popupView.isVisible()) {
                UserService.refreshUserToken();
            }
        };

        var stopRefreshTimeout = function() {
            if (refreshTimer) {
                clearTimeout(refreshTimer);
            }
        };

        var startRefreshTimeout = function() {
            stopRefreshTimeout();
            refreshTimer = setTimeout(refreshToken, _this.tokenInterval);
        };

        /**
         * Starts all refresh events on the document
         */
        var startRefreshEvents = function() {
            //set up the event listners for a user's interactions
            $(document).off(REFRESH_EVENTS).one(REFRESH_EVENTS, function(e) {
                startRefreshTimeout();
            });
        };

        /**
         * @return {number}
         */
        var getTimeLeft = function() {
            return UserService.checkUserToken();
        };

        /**
         * sets the displayed length of time to reflect the server session length
         */
        var setSessionLength = function() {
            if (!sessionLength) {
                var userModel = UserService.getUserSession();
                sessionLength = Math.ceil(userModel.get('sessionLength') / 60000) || 15;
            }
        };

        /**
         * displays the popup to the user
         * @param {popupView} [popup=popupView.getDefaultModel] - the popup to be displayed to the user
         * @param {boolean} [options.popupSilent=true] - an optional boolean
         * @param {boolean} [options.logout=false] - an optional booloean representing wether or not to logout
         */
        var envokePopupModal = function(options) {
            stopRefreshTimeout();
            var popupOptions = _.result(options, 'popupOptions', {});
            var logout = _.result(options, 'logout', false);
            var popupSilent = _.result(options, 'popupSilent', false);

            var popupModel = popupView.extendDefaultModel(popupOptions);

            popupView.setModel(popupModel, popupSilent);
            
            if (logout) {
                popupView.logout();
            }
        };

        /**
         * Checks for the amount of time left and displays a warning message as appropriate
         * @return undefined
         */
        var displayAutologoffWarning = function() {
            // check if the token is still valid
            var timeLeft = getTimeLeft();
            var popupOptions = {};
            // if not, popup a window
            switch (timeLeft) {
                case 3:
                case 2:
                case 1:
                    popupOptions.title = 'Warning: Session Expiring';
                    popupOptions.header = 'Your user session will time out in ';
                    //append the text to the header
                    popupOptions.header += timeLeft + ' minute';
                    if (timeLeft > 1) {
                        popupOptions.header += 's';
                    }
                    popupOptions.header += '.';
                    popupOptions.body = 'To help ensure privacy and protect patient information, your user session times out after ' + sessionLength + ' minutes. If you are actively using eHMP, select Continue to reset the session, or Logout to end the session.';
                    popupOptions.buttons = true;
                    //popup
                    envokePopupModal({
                        popupOptions: popupOptions,
                        logout: false
                    });
                    // half min logoutWarning until logout unless continue
                    logoutWarning = (timeLeft - 0.5);
                    resetLogoutTimeout();
                    break;
                case 0:
                    popupOptions.title = 'Session Expired';
                    popupOptions.header = 'You\'ve been logged out due to inactivity.';
                    popupOptions.body = 'To help ensure privacy and protect patient information, your user session timed out after ' + sessionLength + ' minutes.';
                    popupOptions.buttons = false;
                    //popup and logout
                    envokePopupModal({
                        popupOptions: popupOptions,
                        logout: true
                    });
                    stopLogoutTimeout();
                    // decrease the logoutWarning
                    logoutWarning = 0;
                    break;
                default:
                    // continue to loop
                    logoutWarning = 3;
                    resetLogoutTimeout();
                    break;
            }
        };

        var stopLogoutTimeout = function() {
            if (logoutTimeout) {
                clearTimeout(logoutTimeout);
            }
        };


        var resetLogoutTimeout = function() {
            //timeleft in minutes
            var timeLeft = getTimeLeft();
            //warning time in milli
            var warningTime = (timeLeft - logoutWarning) * 60000;
            stopLogoutTimeout();
            logoutTimeout = setTimeout(displayAutologoffWarning, warningTime);
        };

        // add event listeners listening when the user logs in and logs out
        Messaging.on('app:start app:logged-in', function() {
            if (UserService.getStatus() === UserService.STATUS.LOGGEDIN) {
                setSessionLength();
            }
        });

        Messaging.on('app:logged-in', function(){
            if (UserService.getStatus() === UserService.STATUS.LOGGEDIN) {
                logoutWarning = 3;
                resetLogoutTimeout();
            }
        });
        
        Messaging.on('app:start app:logged-in screen:display user:sessionRefresh', function() {
            if (UserService.getStatus() === UserService.STATUS.LOGGEDIN) {
                resetLogoutTimeout();
                startRefreshEvents();
            }
        });

        Messaging.on('app:logout', stopLogoutTimeout);

        Messaging.on('user:sessionEnd', function() {
            stopLogoutTimeout();
            stopRefreshTimeout();
            logoutWarning = 3;
        });

        Messaging.on('autologoff:continue', function() {
            //prevent any accidental continuation when not logged in
            if (UserService.getStatus() === UserService.STATUS.LOGGEDIN) {
                logoutWarning = 3;
                //refresh the token NOW
                refreshToken();
            }
        });

        return _this;

    };

    var autologoff = new AutoLogoff();


    return autologoff;
});