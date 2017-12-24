define([
    'app/resources/fetch/permission/permissionCollection',
    'app/resources/fetch/permission/permissions-full-model-handler',
    'app/resources/fetch/permission/permissions-set-collection',
    'app/resources/fetch/permission/permissions-individual-collection',
    'app/resources/fetch/permission/permissions-features-collection',
    'app/resources/fetch/permission/permissions-set-model',
    'app/resources/fetch/permission/permissions-versions',
    'app/resources/fetch/permission/permissions-set-uma',
    'app/resources/fetch/permission/permissions-uma',
    'app/resources/fetch/permission/permissions-set-categories'
], function(
    Collection, 
    SharedModel, 
    SetsCollection, 
    IndividualCollection, 
    FeaturesCollection, 
    PermissionSetModel, 
    Versions, 
    UMAPermissionSetsCollection, 
    UMAPermissionsCollection, 
    Categories) {  
    'use strict';

    // NOTE: Do not add the full model directly here, make sure it uses the handler
    return {
        Collection: Collection,
        SharedModel: SharedModel,
        SetsCollection: SetsCollection,
        IndividualCollection: IndividualCollection,
        FeaturesCollection: FeaturesCollection,
        PermissionSetModel: PermissionSetModel,
        Versions: Versions,
        UMAPermissionSetsCollection: UMAPermissionSetsCollection,
        UMAPermissionsCollection: UMAPermissionsCollection,
        Categories: Categories
    };
});