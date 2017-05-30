/**
 * 
 */
package org.opencds.common.structures;

import java.util.List;
import java.util.Map;


/**
 * @author David Shields
 * 
 * @date
 *
 */
public class EvaluationRequestKMItem {
	private final String 				requestedKmId;
	private final EvaluationRequestDataItem	evaluationRequestDataItem;
    private final Map<Class<?>, List<?>> allFactLists;

	public EvaluationRequestKMItem(String requestedKmId, EvaluationRequestDataItem evaluationRequestDataItem, Map<Class<?>, List<?>> allFactLists) {
        this.requestedKmId = requestedKmId;
        this.evaluationRequestDataItem = evaluationRequestDataItem;
        this.allFactLists = allFactLists;
    }

    /**
	 * @return the requestedKmId
	 */
	public String getRequestedKmId() {
		return requestedKmId;
	}

	/**
	 * @return the dssRequestDataItem
	 */
	public EvaluationRequestDataItem getEvaluationRequestDataItem() {
		return evaluationRequestDataItem;
	}

    public Map<Class<?>, List<?>> getAllFactLists() {
        return allFactLists;
    }


}
