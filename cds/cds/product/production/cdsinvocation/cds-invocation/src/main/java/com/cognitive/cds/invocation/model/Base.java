package com.cognitive.cds.invocation.model;

import java.io.IOException;

import com.cognitive.cds.invocation.util.JsonUtils;

public abstract class Base {
	/**
	 * Get the JSON representation of the object
	 * 
	 * @return JSON representation
	 * @throws IOException
	 */
	public String toJsonString() throws IOException {
		return JsonUtils.toJsonString(this);
	}
}
