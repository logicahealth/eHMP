package com.cognitive.cds.invocation.mongo;

import java.io.IOException;

import org.bson.Document;

import com.cognitive.cds.invocation.execution.model.PatientList;
import com.cognitive.cds.invocation.mongo.exception.CDSDBConnectionException;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

public class PatientListDao {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory
            .getLogger(PatientListDao.class);

    private MongoDbDao mongoDbDao;

    public MongoDbDao getMongoDbDao() {
        return mongoDbDao;
    }

    public void setMongoDbDao(MongoDbDao mongoDbDao) {
        this.mongoDbDao = mongoDbDao;
    }

    /**
     * Call to fetch the PatientList
     * 
     * @param name
     * @return
     */
    public PatientList loadPatientList(String name) {
        PatientList patientList = null;

        MongoDatabase database = null;
		try {
			database = mongoDbDao.getMongoClient().getDatabase("patientlist");
		} catch (CDSDBConnectionException e1) {
            logger.error("========> mongoDbDao.getMongoClient().getDatabase: " + e1.toString(),e1);
            return patientList;
		}
        MongoCollection<Document> collection = database.getCollection("patientlist");
        logger.info("Patientlist Count: " + collection.count());
        Document filter = new Document();
        filter.put("name", name);
        Document obj = collection.find(filter).first();
        if (obj != null) {
            try {
                String json = obj.toJson();
                patientList = (PatientList) JsonUtils.getMapper().readValue(json, PatientList.class);
            } catch (IOException e) {
                logger.error("========> Deserialize: " + e.toString(),e);
            }
        }
        return patientList;
    }

    /**
     * Save PatientList.
     * 
     * @param name
     * @param patientList
     */
    public void savePatientList(String name, PatientList patientList) {

        if (patientList.getName() == null || patientList.getName().isEmpty()) {
            patientList.setName(name);
        }
        try {
            MongoDatabase database = mongoDbDao.getMongoClient().getDatabase("patientlist");
            ObjectMapper mapper = new ObjectMapper();
            String objectJson = mapper.writeValueAsString(patientList);
            logger.info("=====> patientList json to write: " + objectJson);
            Document filter = new Document();
            filter.put("_id", new org.bson.types.ObjectId((String) patientList.get_id()));
            // filter.put("name", name);
            Document doc = Document.parse(objectJson);
            doc.remove("_id");
            database.getCollection("patientlist").findOneAndReplace(filter, doc);
        } catch (Exception e) {
            logger.error("=======> PatientList Update Exception: " + e.toString(),e);
        }
    }
    // /**
    // * Create the patientList.
    // *
    // * @param name
    // * @param patientList
    // */
    //
    // /**
    // * Delete the PatientList
    // *
    // * @param name
    // * @return
    // */
}
