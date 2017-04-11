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
 * Main lookup for INTENTs and ENGINEs
 * 
 * @author Dan Williams
 * 
 * @version 1.0
 * @created 05-Oct-2014 9:10:42 AM
 *
 */
package com.cognitive.cds.invocation;

import com.cognitive.cds.invocation.model.EngineInfo;
import com.cognitive.cds.invocation.model.IntentMapping;
import com.cognitive.cds.invocation.mongo.EngineInfoDao;
import com.cognitive.cds.invocation.mongo.IntentMappingDao;

public class RepositoryLookup implements RepositoryLookupIFace {

    private EngineInfoDao engineInfoAgent;
    private IntentMappingDao intentMappingAgent;
    private boolean caching = true;
    
    /**
     * @return the engineLookupAgent
     */
    public EngineInfoDao getEngineInfoAgent() {
        return engineInfoAgent;
    }
    /**
     * @param engineInfoAgent
     */
    public void setEngineInfoAgent(EngineInfoDao engineInfoAgent) {
        this.engineInfoAgent = engineInfoAgent;
        if (engineInfoAgent != null) {
            engineInfoAgent.setCacheEngines(caching);
        }
    }

    /**
     * @return the intentMappingAgent
     */
    public IntentMappingDao getIntentMappingAgent() {
        return intentMappingAgent;
    }
    /**
     * @param intentMappingAgent
     */
    public void setIntentMappingAgent(IntentMappingDao intentMappingAgent) {
        this.intentMappingAgent = intentMappingAgent;
    }

    
    // lookup routines
    
    /**
     * Locate and turn the engine from the database
     * 
     *  @param name if engine
     *  @return EngineInfo the engine info object
     */
    @Override
    public EngineInfo lookupEngine(String name) {
        EngineInfo ei = null;
        if (engineInfoAgent != null) {
            ei = engineInfoAgent.lookupEngine(name);
        }
        return ei;
    }

    /**
     * Locate and turn the intent from the database
     * 
     *  @param name if intent
     *  @return IntentMapping the intent mapping object
     */
    @Override
    public IntentMapping lookupIntent(String name) {
        IntentMapping im = null;
        if (intentMappingAgent != null) {
            im = intentMappingAgent.getIntent(name);
        }
        return im;
    }

    /**
     * Check if caching is enabled
     * @return boolean flag, true if caching
     */
    public boolean isCaching() {
        return caching;
    }

    /**
     * [En/Dis]able caching
     */
    public void setCaching(boolean caching) {
        this.caching = caching;
        if (engineInfoAgent != null) {
            engineInfoAgent.setCacheEngines(caching);
        }
    }

}
