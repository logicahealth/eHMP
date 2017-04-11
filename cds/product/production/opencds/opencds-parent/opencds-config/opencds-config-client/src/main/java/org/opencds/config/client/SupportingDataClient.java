package org.opencds.config.client;

public interface SupportingDataClient {

    <T> T getSupportingDataList(Class<T> clazz);

    <T> void putSupportingDataList(T supportingDataList);

    <T> T getSupportingData(String supportingDataId, Class<T> clazz);

    <T> void putSupportingData(String supportingDataId, T supportingData);

    void deleteSupportingData(String supportingDataId);

    <T> T getSupportingDataPackage(String supportingDataId, Class<T> clazz);

    <T> void putSupportingDataPackage(String supportingDataId, T supportingDataPackage);
    
    void deleteSupportingDataPackage(String supportingDataId);

}
