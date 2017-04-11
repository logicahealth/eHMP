package com.cognitive.cds.invocation.mongo;

import java.io.IOException;

import org.bson.Document;

import com.cognitive.cds.invocation.execution.model.Job;
import com.cognitive.cds.invocation.util.JsonUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.client.MongoCollection;

public class JobDao {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory
            .getLogger(JobDao.class);

    private MongoDbDao mongoDbDao;

    public MongoDbDao getMongoDbDao() {
        return mongoDbDao;
    }

    public void setMongoDbDao(MongoDbDao mongoDbDao) {
        this.mongoDbDao = mongoDbDao;
    }

    /**
     * Call to fetch the Job info from the db
     * 
     * @param name
     * @return
     */
    public Job loadJobInfo(String name) {
        Job job = null;

        mongoDbDao.setDatabase("schedule");
        MongoCollection<Document> collection = mongoDbDao
                .getCollection("cdsjobs");
        logger.info("Job Count: " + collection.count());
        Document filter = new Document();
        filter.put("name", name);
        Document obj = collection.find(filter).first();
        if (obj != null) {
            try {
                String json = obj.toJson();
                job = (Job) JsonUtils.getMapper().readValue(json, Job.class);
            } catch (IOException e) {
                logger.error("========> Deserialize: " + e.toString());
            }
        }
        return job;
    }

    //
    // /**
    // * Delete the job
    // *
    // * @param jobId
    // * @return
    // */
    /**
     * Save job info up to Job server.
     * 
     * @param jobId
     * @param job
     */
    public void saveJobInfo(String jobId, Job job) {

        mongoDbDao.setDatabase("schedule");
        ObjectMapper mapper = new ObjectMapper();
        if (job.getName() == null || job.getName().isEmpty()) {
            job.setName(jobId);
        }
        try {
            String objectJson = mapper.writeValueAsString(job);
            logger.info("=====> Job json to write: " + objectJson);
            Document filter = new Document();
            filter.put("_id",
                    new org.bson.types.ObjectId((String) job.get_id()));
            // filter.put("name", jobId);
            Document doc = Document.parse(objectJson);
            doc.remove("_id");
            mongoDbDao.getCollection("cdsjobs").findOneAndReplace(filter, doc);
        } catch (Exception e) {
            logger.error("=======> Job Update Exception: " + e.toString());
        }
    }
    //
    // /**
    // * Create the job per jobId.
    // *
    // * @param jobId
    // * @param job
    // */
}
