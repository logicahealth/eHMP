::: page-description
# Patient Selection Applet #
This applet's main purpose is to allow the user to search for and select a patient.
:::

## Applet Id ##
```JavaScript
{ id: 'patient_selection' }
```

## Patient Confirmation ##
The Patient Selection applet responds to the ADK.Messaging event `'context:patient:change'`, which is triggered by **ADK.PatientRecordService.setCurrentPatient(patient, options)**.

**ADK.PatientRecordService.setCurrentPatient(patient, options)** should always be used for setting the patient.

### Parameter: **patient** {.method} ###
Can be a Backbone.Model with a pid/icn (as well as other applicable fields, such as name/DOB/sensitive) attributes or a string pid/icn. In the case where a string pid/icn is passed in, the requisite patient data will be fetched prior to the confirmation workflow starting.

### Parameter: **options** {.method} ###
Type object with one or more of the following options

#### callback {.method .copy-link} ####

Function that fires after the confirmation workflow has completed, or after the subsequent navigation has occurred. A common use-case for this callback is to open a details view from applet views that have entries from multiple patients (thus requiring patient confirmation in order to view each of the details).

```JavaScript
callback: function() {
    ADK.Messaging.getChannel(TARGET_APPLET_CHANNEL).request(DETAIL_EVENT, params);
}
```

#### confirmationOptions {.method .copy-link} ####

Object with any overrides of default behavior, list options are defined in the table below.

|Option|Type|Default|Description|
|:----:|:--:|:-----:|-----------|
|**`sensitivity`**|boolean|`true`|Determines whether the sensitivity acknowledgment step will show if applicable (i.e. the patient is sensitive and the current user is required to "break the glass"). Setting to `false` will skip this step even if applicable. This is the first step in the confirmation workflow.|
|**`patientInfo`**|boolean|`true`|Determines whether the main patient confirmation step will show. Setting to `false` will skip this step. This is the second step in the confirmation workflow, though in effect, it is the first step in the workflow for a non-sensitive patient or if the user is not required to "break the glass".|
|**`flags`**|boolean|`true`|Determines whether the flags confirmation step will show if applicable (i.e. the patient has flags). Setting to `false` will skip this step even if applicable. This is the third/final step in the confirmation workflow.|
|**`reconfirm`**|boolean or object|`false`|Determines whether reconfirmation will occur if the target patient is the currently selected patient.<br/>- `reconfirm: false` will skip reconfirmation in all cases.<br/>- `reconfirm: true` will inherit the options above (sensitivity, patientInfo, flags). In other words, will reconfirm in the same manner as the first confirmation.<br/>- `reconfirm: { sensitivity/patientInfo/flags: true/false }`an object will overwrite the options above (sensitivity, patientInfo, flags). In other words, will reconfirm in a different manner than the first confirmation. If defined as an object, assumes `false` for each option, unless otherwise specified, which will skip the step on reconfirmation. This is done to align with the default for reconfirm (`false`). `true` must be specified for each step that should be shown when applicable.|
|**`navigateToPatient`**|boolean|`true`|Determines whether the user will be taken to the patient context on completion of the confirmation workflow. Setting to `false` will simply call the [callback function](#Patient-Confirmation-options-confirmationOptions), if defined.|
|**`ccowWorkflow`**|boolean|`false`|Indicates the confirmation workflow was started with a CCOW, and displays/enables any CCOW-associated functionality, such as the "Break Clinical Link" button.|
|**`visitHomeLink`**|boolean|`false`|Determines if a "Visit Home" button will be displayed on patientInfo confirmation during load/sync.|

### Examples/Use Cases ###

#### All Steps with Reconfirm {.copy-link} ####
This is a common scenario where all three steps (sensitivity acknowledgment, patient information confirmation, and flags confirmation) will be shown, if applicable, both with the first and subsequent confirmations.

::: showcode All Steps with Reconfirm:
```JavaScript
ADK.PatientRecordService.setCurrentPatient(PATIENT_MODEL_OR_PID_STRING, {
    confirmationOptions: {
        reconfirm: true
    }
});
// additionally, these options are applied through defaults
// confirmationOptions: {
//   sensitivity: true,
//   patientInfo: true,
//   flags: true,
//   navigateToPatient: true,
//   ccowWorkflow: false,
//   visitHomeLink: false
// }
```
:::

#### All Steps with Callback and No Navigation {.copy-link} ####
This is a common scenario where all three steps (sensitivity acknowledgment, patient information confirmation, and flags confirmation) will be shown, if applicable, both with the first and subsequent confirmations. Additionally, navigation to patient is skipped in favor of executing a callback, such as opening a detail view.

::: showcode All Steps with Callback and No Navigation:
```JavaScript
ADK.PatientRecordService.setCurrentPatient(PATIENT_MODEL_OR_PID_STRING, {
    callback: function() {
        ADK.Messaging.getChannel(TARGET_APPLET_CHANNEL).request(DETAIL_EVENT, params);
    },
    confirmationOptions: {
        navigateToPatient: false,
        reconfirm: true
    }
});
// additionally, these options are applied through defaults
// confirmationOptions: {
//   sensitivity: true,
//   patientInfo: true,
//   flags: true,
//   ccowWorkflow: false,
//   visitHomeLink: false
// }
```
:::

#### All Steps with Callback and No Reconfirm {.copy-link} ####
This is a common scenario where all three steps (sensitivity acknowledgment, patient information confirmation, and flags confirmation) will be shown, if applicable, only on the first confirmation. Additionally, a callback is defined to open up some action/form once confirmation and subsequent navigation to the patient record has completed. In practice, this scenario would occur when confirmation has already happened, such as on opening a detail view in staff context, and a subsequent action has occurred, such as clicking link to edit a form.

::: showcode All Steps with Callback and No Reconfirm:
```JavaScript
ADK.PatientRecordService.setCurrentPatient(PATIENT_MODEL_OR_PID_STRING, {
    callback: function() {
      // since navigateToPatient is true, this callback will run after navigation
      ADK.Messaging.getChannel(TARGET_APPLET_CHANNEL).trigger(ACTION_OR_FORM_EVENT, params);
    },
    confirmationOptions: {
        reconfirm: false // unneeded because of default, but no harm to add
    }
});
// additionally, these options are applied through defaults
// confirmationOptions: {
//   sensitivity: true,
//   patientInfo: true,
//   flags: true,
//   reconfirm: false,
//   navigateToPatient: true,
//   ccowWorkflow: false,
//   visitHomeLink: false
// }
```
:::

#### Sensitivity Skipped with CCOW Enabled {.copy-link} ####
This CCOW-specific scenario skips the sensitivity acknowledgment step, since the user has already acknowledged sensitivity in CPRS, and displays the CCOW-related confirmation functionality.

::: showcode Sensitivity Skipped with CCOW Enabled:
```JavaScript
ADK.PatientRecordService.setCurrentPatient(PATIENT_MODEL_OR_PID_STRING, {
    confirmationOptions: {
        sensitivity: false,
        reconfirm: true, // will inherit `sensitivity: false`
        ccowWorkflow: true,
        visitHomeLink: true
    }
});
// additionally, these options are applied through defaults
// confirmationOptions: {
//   patientInfo: true,
//   flags: true,
//   navigateToPatient: true
```
:::

#### Different Steps on First and Subsequent Confirmations {.copy-link} ####
This is an arbitrary example to show the flexibility of the reconfirm option. In this case, sensitivity and flags will show on first confirm and only patient information confirmation will show on reconfirmations.

:::showcode Different Steps on First and Subsequent Confirmations:
```JavaScript
ADK.PatientRecordService.setCurrentPatient(PATIENT_MODEL_OR_PID_STRING, {
    confirmationOptions: {
        patientInfo: false, // other two steps will be true (defaults)
        reconfirm: {
          patientInfo: true // other two steps will be false (defaults)
        }
    }
});
// additionally, these options are applied through defaults
// confirmationOptions: {
//   sensitivity: true,
//   flags: true,
//   reconfirm: { // normally is `false`, so each option is false when object by default
//     sensitivity: false,
//     flags: false
//   },
//   navigateToPatient: true,
//   ccowWorkflow: false,
//   visitHomeLink: false
// }
```
:::
