
package com.cognitive.cds.invocation.crs.model;

import javax.annotation.Generated;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Generated("org.jsonschema2pojo")
@JsonPropertyOrder({
    "head",
    "results"
})
public class LabSparqlResults {

    @JsonProperty("head")
    private Head head;
    @JsonProperty("results")
    private Results results;

    /**
     * 
     * @return
     *     The head
     */
    @JsonProperty("head")
    public Head getHead() {
        return head;
    }

    /**
     * 
     * @param head
     *     The head
     */
    @JsonProperty("head")
    public void setHead(Head head) {
        this.head = head;
    }

    /**
     * 
     * @return
     *     The results
     */
    @JsonProperty("results")
    public Results getResults() {
        return results;
    }

    /**
     * 
     * @param results
     *     The results
     */
    @JsonProperty("results")
    public void setResults(Results results) {
        this.results = results;
    }

}
