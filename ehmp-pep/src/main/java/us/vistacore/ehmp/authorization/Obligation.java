package us.vistacore.ehmp.authorization;

import com.google.gson.Gson;

import org.json.JSONObject;
import org.json.XML;

public final class Obligation {

    private String obligation;
    private String prompt;
    private String accept;

    public static final String DEFAULT_OBLIGATION = "User must acknowledge record access audit.";
    public static final String ACKNOWLEDGMENT = "_ack=true";

    public Obligation(String obligationText, String requestUri) {
        this.obligation = DEFAULT_OBLIGATION;

        if (requestUri.contains("?")) {
            this.accept = requestUri.concat("&");
        } else {
            this.accept = requestUri.concat("?");
        }
        this.accept = this.accept.concat(ACKNOWLEDGMENT);

        this.prompt = obligationText;
    }

    public String getObligation() {
        return obligation;
    }

    public void setObligation(String obligation) {
        this.obligation = obligation;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getAccept() {
        return accept;
    }

    public void setAccept(String accept) {
        this.accept = accept;
    }

    public String toJson() {
        Gson gson = new Gson();
        return gson.toJson(this).toString();
    }

    public String toXml() {
        JSONObject json = new JSONObject(this);
        String xml = XML.toString(json);
        return xml;
    }

}
