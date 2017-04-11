package org.opencds.config.api.pool;

import javax.xml.bind.Unmarshaller;

import org.apache.commons.pool2.KeyedPooledObjectFactory;
import org.apache.commons.pool2.impl.GenericKeyedObjectPool;

public class UnmarshallerPool extends GenericKeyedObjectPool<Class<?>, Unmarshaller> {

    public UnmarshallerPool(KeyedPooledObjectFactory<Class<?>, Unmarshaller> unmarshallerFactory) {
        super(unmarshallerFactory);
    }

}
