/*
 * COPYRIGHT STATUS: © 2015.  This work, authored by Cognitive Medical Systems
 * employees, was funded in whole or in part by The Department of Veterans
 * Affairs under U.S. Government contract VA118-11-D-1011 / VA118-1011-0013.
 * The copyright holder agrees to post or allow the Government to post all or
 * part of this work in open-source repositories subject to the Apache License,
 * Version 2.0, dated January 2004. All other rights are reserved by the
 * copyright owner.
 *
 * For use outside the Government, the following notice applies:
 *
 *     Copyright 2015 © Cognitive Medical Systems
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */
/**
 * Main ProjectProperties 
 * 
 * @author Dan Williams
 * @version 1.0
 * @created 5-Oct-2015 9:10:42 AM
 *
 * Use ApplicationContext to retrieve property file(s)
 * These properties can then be used during deserialization
 * 
 * TODO: Use spring injection to load properties and/or file names?
 * 
 */
package com.cognitive.cds.invocation;

import java.io.InputStream;
import java.util.Properties;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

public class ProjectProperties {
    private static ProjectProperties projectProperties = new ProjectProperties();
    private static final Logger logger = LoggerFactory
            .getLogger(ProjectProperties.class);

    private ProjectProperties() {
    }

    @Autowired
    private ApplicationContext springCtx;

    @PostConstruct
    private void init() {
        projectProperties = this;
    }

    private Properties properties = null;
    private String propertyName = "classpath:cognitive.cds.config.properties";

    /* Static 'instance' method */
    public static ProjectProperties getInstance() {
        return projectProperties;
    }

    /**
     * Get a property from the defined properties files
     * 
     * @param key
     *            name of property
     * @return value of property
     */
    public String getProperty(String key) {
        if (properties == null)
            properties = loadProps();
        String p = properties.getProperty(key);
        return p;
    }

    // private String testPropFile =
    // "classpath:test-cognitive.cds.config.properties";

    private Properties loadProps() {
        Properties props = new Properties();
        InputStream stream = null;
        stream = getStream(propertyName);
        // if (stream == null) {
        // stream = getStream(testPropFile);
        // }
        try {
            props.load(stream);
        } catch (Exception e) {
            logger.error("Failed on load of properties file");
        }
        return props;
    }

    private InputStream getStream(String path) {
        InputStream stream = null;
        try {
            stream = springCtx.getResource(path).getInputStream();
        } catch (Exception e) {
            logger.error("Failed on open of properties file");
        }
        return stream;
    }

    /**
     * @return the propertyName
     */
    public String getPropertyName() {
        return propertyName;
    }

    /**
     * @param propertyName
     *            the propertyName to set
     */
    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }
}
