package us.vistacore.ehmp.resources;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.io.IOUtils;


/**
 * This class is a temporary way to serve up VLER DAS data via stubbed files.
 */
@Path("/vlerdas")
public class MockVlerDasResource {
    
    /** The Constant MOCK_DATA_DIR. */
    private static final String MOCK_DATA_DIR = "vlerdas/";
    
    /** The Constant FILENAME_EXTENSION. */
    private static final String FILENAME_EXTENSION = ".xml";
    

    /**
     * Gets the patient generated data.
     *
     * @param patientId the patient id
     * @param domain the domain
     * @return the patient generated data
     */
    @GET
    @Path("/{domain}/{patientId}/")
    public Response getPatientGeneratedData(@PathParam("patientId") String patientId, 
                         @PathParam("domain") String domain) {

        String filename = getFilePath(patientId, domain); 
        System.out.println("filename=" + filename);
        String content = "";
        try {
            content = readFile(filename);
        } catch (IOException e) {
            throw new WebApplicationException(404);
        }
        
        System.out.println("content=" + content);
        
        if (content == null) {
            throw new WebApplicationException(404);
        }
        
        return Response.status(Response.Status.OK).type(MediaType.APPLICATION_ATOM_XML).entity(content).build();
        
    }
    
    /**
     * Reads a file from the classpath.
     *
     * @param filename the filename
     * @return the string
     * @throws IOException Signals that an I/O exception has occurred.
     */
    private String readFile(String filename) throws IOException {
        String sFileData = null;
        
        final InputStream isFileData = MockVlerDasResource.class.getClassLoader().getResourceAsStream(filename);
        
        if (isFileData != null) {
            final StringWriter swFileData = new StringWriter();
            
            IOUtils.copy(isFileData, swFileData);
            sFileData = swFileData.toString();
        }

        return sFileData;
    }
    
    /**
     * Gets the file path.
     *
     * @param patientId the patient id
     * @param domain the domain
     * @return the file path
     */
    private String getFilePath(String patientId, String domain) {
        return MOCK_DATA_DIR + domain + File.separator + patientId + FILENAME_EXTENSION;
    }   

}
