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
    'app/resources/writeback/orders/detail',
    'app/resources/writeback/orders/draft/model',
    'app/resources/writeback/orders/draft/collection',
    'app/resources/writeback/orders/discontinue',
    'app/resources/writeback/orders/sign',
    'app/resources/writeback/orders/labSupportData',
    'app/resources/writeback/orders/clinicalObject',
    'app/resources/writeback/addenda/model',
    'app/resources/writeback/activities/draft/model',
    'app/resources/writeback/activities/signal/model',
    'app/resources/writeback/notes/notesSignModel',
    'app/resources/writeback/addenda/addendumSignModel',
    'app/resources/writeback/stackedGraph/model',
    'app/resources/writeback/issueReport/model'
], function(
    Notes,
    Note,
    UnsignedNotes,
    UncosignedNotes,
    SignedNotes,
    Allergy,
    Allergies,
    Vital,
    Vitals,
    Immunization,
    Immunizations,
    Esignature,
    Problem,
    Problems,
    Order,
    OrderDetail,
    DraftOrder,
    DraftOrders,
    OrderDiscontinue,
    OrderSign,
    LabSupportData,
    OrderClinicalObject,
    Addendum,
    DraftActivity,
    SignalActivity,
    NotesSignModel,
    AddendumSignModel,
    StackedGraph,
    IssueReport
) {
    'use strict';

    return {
        id: 'Writeback',
        resources: {
            Notes: {
                Model: Note,
                AllNotes: Notes,
                UnsignedNotes: UnsignedNotes,
                UncosignedNotes: UncosignedNotes,
                SignedNotes: SignedNotes,
                NotesSignModel: NotesSignModel
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
                Detail: OrderDetail,
                LabSupportData: LabSupportData,
                Discontinue: OrderDiscontinue,
                Sign: OrderSign,
                ClinicalObject: OrderClinicalObject,
                Draft: {
                    Model: DraftOrder,
                    Collection: DraftOrders
                }
            },
            Addendum: {
                Model: Addendum,
                Collection: Backbone.Collection,
                AddendumSignModel: AddendumSignModel
            },
            Activities: {
                Draft: {
                    Model: DraftActivity
                },
                Signal: {
                    Model: SignalActivity
                }
            },
            StackedGraph: {
                Model: StackedGraph
            },
            IssueReport: {
                Model: IssueReport
            }
        }
    };
});
