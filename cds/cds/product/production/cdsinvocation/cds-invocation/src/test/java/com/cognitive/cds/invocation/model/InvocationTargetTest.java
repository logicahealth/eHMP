package com.cognitive.cds.invocation.model;

import static org.junit.Assert.*;

import org.junit.Test;

public class InvocationTargetTest {

    @Test
    public void testDataValidationFlag() {
        InvocationTarget target = new  InvocationTarget();
        assertFalse("Default Validation should ve false",target.isDataModelValidationEnabled());
        target.setDataModelValidationEnabled(true);
        assertTrue("Data model validation should now be set to true", target.isDataModelValidationEnabled());
        target.setDataModelValidationEnabled(false);
        assertFalse("Data model validation should now be set to false",target.isDataModelValidationEnabled());
    }

}
