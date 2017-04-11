package gov.va;


import java.util.ArrayList;
import java.util.List;

/**
 * The Class CDSResponse.
 */
public class CDSResponse {

	/** The fault info. */
	private List<Object> faultInfo = new ArrayList<Object>();
	
	/** The results. */
	private List<CDSResponseResult> results = new ArrayList<CDSResponseResult>();
	
	/** The status. */
	private CDSResponseStatus status;

	/**
	 * Gets the fault info.
	 *
	 * @return The faultInfo
	 */
	public List<Object> getFaultInfo() {
		return faultInfo;
	}

	/**
	 * Sets the fault info.
	 *
	 * @param faultInfo The faultInfo
	 */
	public void setFaultInfo(List<Object> faultInfo) {
		this.faultInfo = faultInfo;
	}

	/**
	 * Gets the results.
	 *
	 * @return The results
	 */
	public List<CDSResponseResult> getResults() {
		return results;
	}

	/**
	 * Sets the results.
	 *
	 * @param results The results
	 */
	public void setResults(List<CDSResponseResult> results) {
		this.results = results;
	}

	/**
	 * Gets the status.
	 *
	 * @return The status
	 */
	public CDSResponseStatus getStatus() {
		return status;
	}

	/**
	 * Sets the status.
	 *
	 * @param status The status
	 */
	public void setStatus(CDSResponseStatus status) {
		this.status = status;
	}

}
