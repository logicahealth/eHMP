define([
	'app/resources/picklist/lab_orders/specimens/collection',
	'app/resources/picklist/lab_orders/all_samples/collection',
	'app/resources/picklist/lab_orders/collect_times/collection',
	'app/resources/picklist/lab_orders/orderable_items/collection',
	'app/resources/picklist/lab_orders/dialog_def/collection',
	'app/resources/picklist/lab_orders/lab-sample-specimen-urgency/collection'
], function(Specimens, Samples, CollectTimes, OrderableItems, OrderDialogDef, LabSampleSpecimenUrgency) {
	'use strict';

	return {
		Specimens: Specimens,
		Samples: Samples,
		LabCollectTimes: CollectTimes,
		OrderableItems: OrderableItems,
		OrderDialogDef: OrderDialogDef,
		LabSampleSpecimenUrgency: LabSampleSpecimenUrgency
	};
});