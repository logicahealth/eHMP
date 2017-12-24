define([
    'main/ui_components/form/control/behaviors/errorMessages',
    'main/ui_components/form/control/behaviors/extraClasses',
    'main/ui_components/form/control/behaviors/defaultClasses',
    'main/ui_components/form/control/behaviors/requiredFieldOptions',
    'main/ui_components/form/control/behaviors/hideEvent',
    'main/ui_components/form/control/behaviors/nestableContainer',
    'main/ui_components/form/control/behaviors/updateUiElements',
    'main/ui_components/form/control/behaviors/updateConfigBehavior'
], function(
    ErrorMessageBehavior,
    ExtraClassesBehavior,
    DefaultClassesBehavior,
    RequiredFieldOptionsBehavior,
    HideEventBehavior,
    NestableContainerBehavior,
    UpdateUiElements,
    UpdateConfigBehavior
) {
    "use strict";

    return {
        ErrorMessages: ErrorMessageBehavior,
        ExtraClasses: ExtraClassesBehavior,
        DefaultClasses: DefaultClassesBehavior,
        RequiredFieldOptions: RequiredFieldOptionsBehavior,
        HideEvent: HideEventBehavior,
        NestableContainer: NestableContainerBehavior,
        UpdateUiElements: UpdateUiElements,
        UpdateConfig: UpdateConfigBehavior
    };
});