package org.opencds.config.cli.commands

import org.opencds.config.client.rest.KnowledgeModuleRestClient
import org.opencds.config.client.rest.RestClient

class KMCommands {
    private static KnowledgeModuleRestClient getClient(RestClient restClient) {
        return new KnowledgeModuleRestClient(restClient)
    }
    
    static def getCollection = {RestClient restClient ->
        def client = getClient(restClient)
        return client.getKnowledgeModules(String.class)
    }
    
    static def get = {String kmId, RestClient restClient ->
        def client = getClient(restClient)
        return client.getKnowledgeModule(kmId, String.class)
    }
    
    /**
     * Returns an InputStream
     */
    static def getPackage = {String kmId, RestClient restClient ->
        def client = getClient(restClient)
        return client.getKnowledgePackage(kmId, InputStream.class)
    }
    
    /**
     * Returns an InputStream
     */
    static def uploadCollection = {String coll, RestClient restClient ->
        def client = getClient(restClient)
        return client.putKnowledgeModules(coll)
    }
    
    static def upload = {String kmId, String km, RestClient restClient ->
        def client = getClient(restClient)
        return client.putKnowledgeModule(kmId, km)
    }
    
    static def uploadPackage = {String kmId, InputStream inputStream, RestClient restClient ->
        def client = getClient(restClient)
        return client.putKnowledgePackage(kmId, inputStream)
    }
    
    static def delete = {String kmId, RestClient restClient ->
        def client = getClient(restClient)
        return client.deleteKnowledgeModule(kmId)
    }
    
    static def deletePackage = {String kmId, RestClient restClient ->
        def client = getClient(restClient)
        return client.deleteKnowledgePackage(kmId)
    }
    
}
