package org.opencds.config.client.rest;

import org.opencds.config.client.SupportingDataClient;
import org.opencds.config.client.rest.util.PathUtil;

public class SupportingDataRestClient implements SupportingDataClient {
    private static final String PATH = "supportingdata";
    private static final String PKG_PATH = "package";

    private RestClient restClient;
    
    public SupportingDataRestClient(RestClient restClient) {
        this.restClient = restClient;
    }

    @Override
    public <T> T getSupportingDataList(Class<T> clazz) {
        return restClient.get(PATH, clazz);
    }

    @Override
    public <T> T getSupportingData(String supportingDataId, Class<T> clazz) {
        return restClient.get(PathUtil.buildPath(PATH, supportingDataId), clazz);
    }

    @Override
    public <T> void putSupportingDataList(T supportingData) {
        restClient.put(PATH, supportingData);
    }
    
    @Override
    public <T> void putSupportingData(String supportingDataId, T supportingData) {
        restClient.put(PathUtil.buildPath(PATH, supportingDataId), supportingData);
    }

    @Override
    public void deleteSupportingData(String supportingDataId) {
        restClient.delete(PathUtil.buildPath(PATH, supportingDataId));
    }

    @Override
    public <T> T getSupportingDataPackage(String supportingDataId, Class<T> clazz) {
        return restClient.getBinary(PathUtil.buildPath(PATH, supportingDataId, PKG_PATH), clazz);
    }

    @Override
    public <T> void putSupportingDataPackage(String supportingDataId, T supportingDataPackage) {
        restClient.putBinary(PathUtil.buildPath(PATH, supportingDataId, PKG_PATH), supportingDataPackage);
    }

    @Override
    public void deleteSupportingDataPackage(String supportingDataId) {
        restClient.delete(PathUtil.buildPath(PATH, supportingDataId, PKG_PATH));
    }


}
