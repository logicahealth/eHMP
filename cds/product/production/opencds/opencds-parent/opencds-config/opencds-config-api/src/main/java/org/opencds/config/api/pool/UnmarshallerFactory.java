package org.opencds.config.api.pool;

import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.commons.pool2.BaseKeyedPooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.opencds.common.exceptions.OpenCDSRuntimeException;
import org.opencds.config.api.xml.JAXBContextService;

public class UnmarshallerFactory extends BaseKeyedPooledObjectFactory<Class<?>, Unmarshaller> {
	private static final Log log = LogFactory.getLog(UnmarshallerFactory.class);
	private final JAXBContextService jaxbContextService = new JAXBContextService();

	@Override
	public Unmarshaller create(Class<?> clazz) throws Exception {
		Unmarshaller unmarshaller = null;
		log.debug("Creating pooled instance of unmarshaller: " + clazz.getCanonicalName());
		try {
			unmarshaller = jaxbContextService.getJAXBContext(clazz).createUnmarshaller();
		} catch (JAXBException e) {
			throw new OpenCDSRuntimeException("Request for Unmarshaller for class: " + clazz.getCanonicalName()
					+ " created JAXBException: " + e.getMessage());
		}
		if (unmarshaller == null) {
			throw new OpenCDSRuntimeException(
					"Could not resolve Unmarshaller for class: " + clazz.getCanonicalName());
		}
		return unmarshaller;
	}

	@Override
	public PooledObject<Unmarshaller> wrap(Unmarshaller value) {
		return new DefaultPooledObject<>(value);
	}

}
