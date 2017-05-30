package org.opencds.config.store.model.je;

import org.opencds.config.api.model.ValueSet;

import com.sleepycat.persist.model.Persistent;

@Persistent
public class ValueSetJe implements ValueSet {
	
	private String oid;

	private String name;

	private ValueSetJe() {
	}
	
	public static ValueSetJe create(String oid, String name) {
		ValueSetJe vs = new ValueSetJe();
		vs.oid = oid;
		vs.name = name;
		return vs;
	}
	
	public static ValueSetJe create(ValueSet valueSet) {
		if (valueSet == null) {
			return null;
		}
		if (valueSet instanceof ValueSetJe) {
			return ValueSetJe.class.cast(valueSet);
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
