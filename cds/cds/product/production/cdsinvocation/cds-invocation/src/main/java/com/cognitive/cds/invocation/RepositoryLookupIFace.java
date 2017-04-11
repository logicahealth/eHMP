package com.cognitive.cds.invocation;

import com.cognitive.cds.invocation.model.EngineInfo;
import com.cognitive.cds.invocation.model.IntentMapping;

public interface RepositoryLookupIFace {
    /**
     * Lookup an Engine by name
     * 
     * @param name the name of an engine
     * @return EngineInfo Structure
     */
    EngineInfo lookupEngine(String name);
    
    /**
     * Lookup an Intent by name
     * 
     * @param name the name of an engine
     * @return EngineInfo Structure
     */
    IntentMapping lookupIntent(String name);

    /**
     * Enable/Disable caching
     * 
     * @param boolean caching true or false
     */
    void setCaching(boolean caching);

}
