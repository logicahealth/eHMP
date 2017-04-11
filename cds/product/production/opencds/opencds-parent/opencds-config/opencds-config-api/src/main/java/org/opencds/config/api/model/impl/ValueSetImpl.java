package org.opencds.config.api.model.impl;

import org.opencds.config.api.model.ValueSet;

public class ValueSetImpl implements ValueSet {

	private String oid;

	private String name;

	private ValueSetImpl() {
	}

	public static ValueSetImpl create(String oid, String name) {
		ValueSetImpl vs = new ValueSetImpl();
		vs.oid = oid;
		vs.name = name;
		return vs;
	}
	
	public static ValueSetImpl create(ValueSet valueSet) {
		if (valueSet == null) {
			return null;
		}
		if (valueSet instanceof ValueSetImpl) {
			return ValueSetImpl.class.cast(valueSet);
		}
		return create(valueSet.getOid(), valueSet.getName());
	}

	@Override
	public String getOid() {
		return oid;
	}

	@Override
	public String getName() {
		return name;
	}

}
