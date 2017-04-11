define([
    'app/resources/writeback/notes/notes',
    'app/resources/writeback/notes/model',
    'app/resources/writeback/notes/unsignednotes/collection',
    'app/resources/writeback/notes/uncosignedNotes/collection',
    'app/resources/writeback/notes/signednotes/collection',
    'app/resources/writeback/allergies/model',
    'app/resources/writeback/allergies/collection',
    'app/resources/writeback/vitals/model',
    'app/resources/writeback/vitals/collection',
    'app/resources/writeback/immunizations/model',
    'app/resources/writeback/immunizations/collection',
    'app/resources/writeback/esignature/model',
    'app/resources/writeback/problems/model',
    'app/resources/writeback/problems/collection',
    'app/resources/writeback/orders/model',
    'app/resources/writeback/orders/draft/model',
    'app/resources/writeback/orders/draft/collection',
    'app/resources/writeback/orders/discontinue',
    'app/resources/writeback/orders/sign'
], function(Notes, Note, UnsignedNotes, UncosignedNotes, SignedNotes, Allergy, Allergies, Vital, Vitals, Immunization, Immunizations, Esignature, Problem, Problems, Order, DraftOrder, DraftOrders, OrderDiscontinue, OrderSign) {
    'use strict';

    return {
        id: 'Writeback',
        resources: {
            Notes: {
                Model: Note,
                AllNotes: Notes,
                UnsignedNotes: UnsignedNotes,
                UncosignedNotes: UncosignedNotes,
                SignedNotes: SignedNotes
            },
            Allergies: {
                Model: Allergy,
                Collection: Allergies
            },
            Vitals: {
                Model: Vital,
                Collection: Vitals
            },
            Immunizations: {
                Model: Immunization,
                Collection: Immunizations
            },
            ESignature: {
                Model: Esignature,
                Collection: Backbone.Collection
            },
            Problems: {
                Model: Problem,
                Collection: Problems
            },
            Orders: {
                Model: Order,
                Discontinue: OrderDiscontinue,
                Sign: OrderSign,
                Draft: {
                    Model: DraftOrder,
                    Collection: DraftOrders
                }
            }
        }
    };
});
