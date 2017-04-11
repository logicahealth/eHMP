package gov.va.med.pdws;

import org.apache.commons.io.FileUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;


@WebServlet(name="EntityPatientRetrieve", urlPatterns = { "/EntityPatientRetrieve" })
public class EntityPatientRetrieve extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        PrintWriter out = response.getWriter();

        response.setHeader("Content-Type", "text/xml");
        out.write(entityPatientRetrieve(request));
        out.close();
    }

    private String entityPatientRetrieve(HttpServletRequest request) {

        ClassLoader classLoader = getClass().getClassLoader();
        File respNoResult = new File(classLoader.getResource("patient-retrieve-response/no-result.xml").getFile());
        File respDefault = new File(classLoader.getResource("patient-retrieve-response/default.xml").getFile());
        File respEightInpatient = new File(classLoader.getResource("patient-retrieve-response/0000000001.xml").getFile());
        File respEightOutpatient = new File(classLoader.getResource("patient-retrieve-response/0000000002.xml").getFile());
        File respEightPatient = new File(classLoader.getResource("patient-retrieve-response/0000000003.xml").getFile());
        File respPatientOneHundredSixteen = new File(classLoader.getResource("patient-retrieve-response/00000000011.xml").getFile());
        File respDodOnly = new File(classLoader.getResource("patient-retrieve-response/4325678.xml").getFile());
        File respEdipiOnly = new File(classLoader.getResource("patient-retrieve-response/43215678.xml").getFile());

        try
        {
            BufferedReader reader = request.getReader();
            String line;
            StringBuilder sb = new StringBuilder();
            while((line = reader.readLine()) != null) {
                sb.append(line);
            }

            String soapXml = sb.toString();

            //no edipi identifier in request
            if(!soapXml.contains("root=\"2.16.840.1.113883.3.42.10001.100001.12\""))
                return FileUtils.readFileToString(respNoResult);

            if (soapXml.contains("extension=\"0000000001\""))
                return FileUtils.readFileToString(respEightInpatient);
            else if (soapXml.contains("extension=\"0000000002\""))
                return FileUtils.readFileToString(respEightOutpatient);
            else if (soapXml.contains("extension=\"0000000003\""))
                return FileUtils.readFileToString(respEightPatient);
            else if (soapXml.contains("extension=\"00000000011\""))
                return FileUtils.readFileToString(respPatientOneHundredSixteen);
            else if (soapXml.contains("extension=\"4325678\""))
                return FileUtils.readFileToString(respDodOnly);
            else if (soapXml.contains("extension=\"43215678\""))
                return FileUtils.readFileToString(respEdipiOnly);
            //return default patient if edipi is not supported
            else return FileUtils.readFileToString(respDefault);

        }
        catch (Exception e) {
            System.err.println("Exception in entityPatientRetrieve: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }
}
