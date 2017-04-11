
package com.cognitive.cds.invocation.crs.model.orderables;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Binding {
	
	private SiteLabOrderCode siteOrderCode;
	private ConceptLabel conceptLabel;

	public SiteLabOrderCode getSiteOrderCode() {
		return siteOrderCode;
	}

	public void setSiteOrderCode(SiteLabOrderCode siteOrderCode) {
		this.siteOrderCode = siteOrderCode;
	}

	public ConceptLabel getConceptLabel() {
		return conceptLabel;
	}

	public void setConceptLabel(ConceptLabel conceptLabel) {
		this.conceptLabel = conceptLabel;
	}

}
