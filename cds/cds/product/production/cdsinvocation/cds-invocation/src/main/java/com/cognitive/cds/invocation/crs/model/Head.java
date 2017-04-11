
package com.cognitive.cds.invocation.crs.model;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.Generated;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Generated("org.jsonschema2pojo")
@JsonPropertyOrder({
    "vars"
})
public class Head {

    @JsonProperty("vars")
    private List<String> vars = new ArrayList<String>();

    /**
     * 
     * @return
     *     The vars
     */
    @JsonProperty("vars")
    public List<String> getVars() {
        return vars;
    }

    /**
     * 
     * @param vars
     *     The vars
     */
    @JsonProperty("vars")
    public void setVars(List<String> vars) {
        this.vars = vars;
    }

}
