define([
    'backbone',
    'marionette',
    'hbs!app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medRightSideDetail/inpatientMedRightSideDetail',
    'hbs!app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medRightSideDetail/outpatientMedRightSideDetail',
    'hbs!app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medRightSideDetail/ivMedRightSideDetail',
    'hbs!app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medRightSideDetail/nonvaMedRightSideDetail'
], function(Backbone, Marionette, InpatientMedRightSideDetail, OutpatientMedRightSideDetail, IvMedRightSideDetail, NonvaMedRightSideDetail) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        templateHelpers: function() {
            return {
                slicedOrderUid: this.model.getOrderUid(),
                pickupTypeText: function() {
                    var fillsRouting;
                    if (this.routing) {
                        var routing = this.routing.toLowerCase();
                        if (routing === "w") {
                            fillsRouting = "Window";
                        } else if (routing === "m") {
                            fillsRouting = "Mail";
                        } else {
                            fillsRouting = routing.toLowerCase();
                        }
                        return fillsRouting;
                    } else {
                        return "No Data";
                    }
                },
                isDiscontinued: function() {
                    var vaStatus = this.vaStatus.toLowerCase();
                    if (vaStatus === "discontinued" || vaStatus === "discontinued/edit") {
                        return true;
                    } else {
                        return false;
                    }
                },
                expireText: function() {
                    if (this.getStoppedAsMoment.isBefore(moment())) {
                        return "Expired";
                    } else {
                        return "Expires";
                    }
                },
                showExpiredDate: function() {
                    var vaStatus = this.vaStatus.toLowerCase();
                    if (!this.getStoppedAsMoment.isAfter(this.getOverallStopAsMoment) && (vaStatus === "discontinued" || vaStatus === "discontinued/edit")) {
                        return false;
                    } else {
                        return true;
                    }
                },
                detailSig: function() {
                    var ivSig = "";
                    if (this.ivProducts) {
                        if (this.ivProducts.length === 1) {
                            ivSig = "<div>" + this.ivProducts[0] + "</div>";
                        } else {
                            for (var i = 0; i < this.ivProducts.length; i++) {
                                if (i === this.ivProducts.length - 1) {
                                    ivSig = ivSig + "<div class='leftPadding'>" + this.ivProducts[i] + "</div>";
                                } else {
                                    ivSig = ivSig + "<div>" + this.ivProducts[i] + "</div>";
                                }
                            }
                        }
                    } else {
                        ivSig = "<div class='ellipsisFormat'>" + this.computedSig + "</div>";
                    }
                    return ivSig.trim();
                },
                modifiedVaStatus: this.model.getModifiedVaStatus(),
                name: this.model.getName(),
                strength: this.model.getProducts().strength,
                scheduleType: this.model.getScheduleType(),
                getOverallStopAsMoment: this.model.getOverallStopAsMoment(),
                getStoppedAsMoment: this.model.getStoppedAsMoment(),
                computedSig: this.model.getSig(),
                ivProducts: this.model.getSig().products,
                ivDosages: this.model.getSig().dosages
            };
        },
        getTemplate: function() {
            var vaType = this.model.get('vaType').toLowerCase();
            if (vaType === "i") {
                return InpatientMedRightSideDetail;
            } else if (vaType === "v") {
                return IvMedRightSideDetail;
            } else if (vaType === "n") {
                return NonvaMedRightSideDetail;
            } else {
                return OutpatientMedRightSideDetail;
            }
        }
    });
});