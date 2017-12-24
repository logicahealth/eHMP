define([
    'underscore',
    'main/ui_components/form/controls/controls',
    'main/ui_components/form/formView',
    'main/ui_components/form/control/controlService'
], function(
    _,
    FormControls,
    FormView,
    ControlService
) {
    'use strict';
    var Form = FormView;
    Form.Controls =  Object.freeze(FormControls);
    Form.ControlService =  Object.freeze(ControlService);
    return Form;
});