package org.opencds.config.api.pool;

import javax.xml.bind.Marshaller;

import org.apache.commons.pool2.KeyedPooledObjectFactory;
import org.apache.commons.pool2.impl.GenericKeyedObjectPool;

public class MarshallerPool extends GenericKeyedObjectPool<Class<?>, Marshaller> {

    public MarshallerPool(KeyedPooledObjectFactory<Class<?>, Marshaller> marshallerFactory) {
        super(marshallerFactory);
    }

}
