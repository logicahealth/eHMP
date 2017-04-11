define([
    'app/resources/picklist/immunizations/routes_of_administration/collection',
    'app/resources/picklist/immunizations/anatomic_locations/collection',
    'app/resources/picklist/immunizations/lot_numbers/collection',
    'app/resources/picklist/immunizations/manufacturers/collection',
    'app/resources/picklist/immunizations/information_sources/collection',
    'app/resources/picklist/immunizations/information_statements/collection',
    'app/resources/picklist/immunizations/data/collection'
], function(RoutesOfAdministration, AnatomicLocations, LotNumbers, Manufacturers, InformationSources, InformationStatements, Data) {
    'use strict';

    return {
        RoutesOfAdministration: RoutesOfAdministration,
        AnatomicLocations: AnatomicLocations,
        LotNumbers: LotNumbers,
        Manufacturers: Manufacturers,
        InformationSources: InformationSources,
        InformationStatements: InformationStatements,
        Data: Data
    };
});
