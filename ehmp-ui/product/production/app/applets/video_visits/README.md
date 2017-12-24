::: page-description
# Video Visits Applet #
This applet's main purpose is to allow the user to view, create, and start video visits with the current patient.
:::

## Applet Details ##

### Applet Id ###
```JavaScript
{ id: 'video_visits' }
```
### Context ###
```JavaScript
context: ['patient']
```
### UDW Carousel ###
Displays in UDW applet carousel.

## View Types ##
### Summary ###
```JavaScript
{
    type: 'summary',
    chromeEnabled: true
    view: // see below
}
```
#### View ####
Displays list of video appointments with current patient for the next 90 days. This view has the following features:
- Client-side infinite scrolling
- Add (+) button.. links to [the form view](#View-Types-Writeback)
- Client side filter
- Quick menu with "Details" option on each row

The primary action when clicking the row is the same action as clicking the "Details" option in the row tile menu. Clicking either will open that row's detail view, which displays data relevant to that specific appointment as well as a link to the video appointment. Clicking this link opens the video call in a new tab. The details view uses the row's model and also fetches the most current emergency contact information. The details view also has a link to an alert displaying additional instructions if provided on creation.

**Note:** Patient and provider demographic/contact information displayed in detail view comes from different data source than that of the patient/provider demographics displayed elsewhere in eHMP.

### Writeback ###
```JavaScript
{
    type: 'writeback',
    chromeEnabled: false
    view: // see below
}
```
#### View ####
Opens up in the Actions tray. Allows user to create 'ADHOC' video appointments. This form relies on addition data that is fetched on initialize and will display the loading view until all have returned:
- Patient demographics: prepopulates the patient's phone, phone type, and email fields.
- Provider contact info: prepopulates the provider's phone and email.
- Timezone of site: displays timezone in timepicker label as well as being put onto the appointment time.
- Additional Instructions: sets the Additional Instructions select with these fetched options as well as that option's associated instruction's textarea.

Each of these fetching collections are defined in the UI Resource pool. If any of these return in error, an alert banner at the top of the form will be displayed with an error message inside it.

The following fields are required for the Submit button to be enabled:
- Date
- Time
- Duration
- Patient Email
- Provider Email
- Provider Phone

On submit, the following save/update actions are taken:
- Saving/Creating appointment
- Updating patient demographics with phone, phone type, and email from form
- Updating provider contact info with phone and email from form
