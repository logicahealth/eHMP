define([], function() {
    "use strict";
    return [{
        control: 'container',
        template: "<p id='errorMessage' class='text-danger text-center bottom-padding-xs' aria-live='assertive'>{{errorMessage}}</p>",
        modelListeners: ['errorMessage'],
        items: []
    }, {
        control: 'container',
        items: [{
            control: "container",
            template: '<p id="facilityListLoadingMessage" class="{{loadingFacilitiesClass}}"><i class="fa fa-spinner fa-spin right-margin-xs"></i>Loading facilities...</p>',
            modelListeners: ['loadingFacilitiesClass']
        }, {
            control: 'select',
            name: 'selectedFacility',
            id: 'selectedFacility',
            label: 'Facility',
            required: true,
            showFilter: true,
            pickList: [],
            size: 1,
            options: {
                minimumInputLength: 0
            },
            attributeMapping: {
                label: 'name',
                value: 'division'
            },
            disabled: true
        }]
    }, {
        control: 'input',
        type: 'password',
        required: true,
        name: 'accessCode',
        title: 'Enter in access code',
        label: 'Access code',
        disabled: true
    }, {
        control: 'input',
        type: 'password',
        required: true,
        name: 'verifyCode',
        title: 'Enter in verify code',
        label: 'Verify code',
        disabled: true
    }, {
        control: 'button',
        type: 'submit',
        extraClasses: ['signin-button', 'btn', 'btn-primary', 'btn-block'],
        required: true,
        name: 'login',
        title: 'Press enter to sign in',
        label: 'Sign In',
        disabled: true
    }, {
        control: 'container',
        template: '<div class="{{screenReaderAuthenticatingClass}}" id="screenReaderAuthenticating">Authenticating</div>',
        items: [],
        modelListeners: ['screenReaderAuthenticatingClass']
    }];
});
