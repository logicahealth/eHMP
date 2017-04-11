/**
 * Created by alexluong on 7/20/15.
 */

/*
 The user agent is checking for an update, or attempting to download the manifest for the first time.
 This is always the first event in the sequence.
 next: noupdate, downloading, obsolete, error
 */
applicationCache.addEventListener('checking', hideLogin, false);

/*
 The manifest hasn't changed - no new version of app.
 next: Last event in sequence.
 */
applicationCache.addEventListener('noupdate', showLogin, false);

/*
 The user agent has found an update and is fetching it, or is downloading the resources listed by the manifest for the first time.
 next: progress, error, cached, updateready
 */
applicationCache.addEventListener('downloading', function() {
    document.querySelector('.progress').style.visibility = 'visible';
}, false);

/*
 The user agent is downloading resources listed by the manifest.
 The event object's total attribute returns the total number of files to be downloaded.
 The event object's loaded attribute returns the number of files processed so far.
 next: progress, error, cached, updateready
 */
applicationCache.addEventListener('progress', function(e) {
    var progress = Math.round(e.loaded / e.total * 100);
    document.querySelector('.progress-bar').setAttribute('aria-valuenow', progress);
    document.querySelector('.progress-bar').style.width = progress+'%';
    document.querySelector('.progress-bar').innerHTML = '<span>Loading new version: '+progress+'% ('+e.loaded+'/'+e.total+')</span>';
});

/*
 The resources listed in the manifest have been downloaded, and the application is now cached.
 next: Last event in sequence.
 */
applicationCache.addEventListener('cached', showLogin, false);

/*
 The resources listed in the manifest have been newly redownloaded, and the script can use swapCache() to switch to the new cache.
 next: Last event in sequence.
 */
applicationCache.addEventListener('updateready', function() {
    console.log('Cache refreshed - new version of app loaded.');
    applicationCache.swapCache();
    location.reload();
});

/*
 The manifest was found to have become a 404 or 410 page, so the application cache is being deleted.
 next: Last event in sequence.
 */
applicationCache.addEventListener('obsolete', showLogin, false);

/*
 The manifest was a 404 or 410 page, so the attempt to cache the application has been aborted.
 next: Last event in sequence.
 The manifest hadn't changed, but the page referencing the manifest failed to download properly.
 next: Last event in sequence.
 A fatal error occurred while fetching the resources listed in the manifest.
 next: Last event in sequence.
 The manifest changed while the update was being run.
 next: The user agent will try fetching the files again momentarily.
 */
applicationCache.addEventListener('error', showLogin, false);

function hideLogin(e) {
    document.querySelector('#center-region').style.visibility = 'hidden';
}

function showLogin(e) {
    if (document.querySelector('.progress')) {
        document.querySelector('.container-fluid').removeChild(document.querySelector('.progress'));
    }
    document.querySelector('#center-region').style.visibility = 'visible';
}