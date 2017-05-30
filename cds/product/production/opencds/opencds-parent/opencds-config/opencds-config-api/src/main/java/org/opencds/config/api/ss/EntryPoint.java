package org.opencds.config.api.ss;

public interface EntryPoint<InputModel> {

	InputModel buildInput(String inputPayloadString);

}
