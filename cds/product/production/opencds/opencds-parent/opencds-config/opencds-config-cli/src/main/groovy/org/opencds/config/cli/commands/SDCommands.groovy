package org.opencds.config.cli.commands

import org.opencds.config.client.rest.RestClient
import org.opencds.config.client.rest.SupportingDataRestClient

class SDCommands {
    private static SupportingDataRestClient getClient(RestClient restClient) {
        return new SupportingDataRestClient(restClient)
    }
    
    static def getCollection = {RestClient restClient ->
        def client = getClient(restClient)
        return client.getSupportingDataList(String.class)
    }
    
    static def get = {String sdId, RestClient restClient ->
        def client = getClient(restClient)
        return client.getSupportingData(sdId, String.class)
    }
    
    /**
     * Returns an InputStream
     */
    static def getPackage = {String sdId, RestClient restClient ->
        def client = getClient(restClient)
        return client.getSupportingDataPackage(sdId, InputStream.class)
    }
    
    static def uploadCollection = {String coll, RestClient restClient ->
        def client = getClient(restClient)
        return client.putSupportingDataList(coll)
    }
    
    static def upload = {String sdId, String sd, RestClient restClient ->
        def client = getClient(restClient)
        return client.putSupportingData(sdId, sd)
    }
    
    static def uploadPackage = {String sdId, InputStream inputStream, RestClient restClient ->
        def client = getClient(restClient)
        return client.putSupportingDataPackage(sdId, inputStream)
    }
    
    static def delete = {String sdId, RestClient restClient ->
        def client = getClient(restClient)
        return client.deleteSupportingData(sdId)
    }
    
    static def deletePackage = {String sdId, RestClient restClient ->
        def client = getClient(restClient)
        return client.deleteSupportingDataPackage(sdId)
    }
    
}
