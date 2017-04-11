import ch.qos.logback.classic.Level;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.va.cpe.vpr.*;
import gov.va.cpe.vpr.pom.AbstractPatientObject;
import gov.va.cpe.vpr.pom.POMUtils;
import gov.va.cpe.vpr.pom.jds.JdsGenericDAO;
import gov.va.cpe.vpr.pom.jds.JdsTemplate;
import gov.va.cpe.vpr.sync.vista.SynchronizationRpcConstants;
import gov.va.cpe.vpr.sync.vista.VistaDataChunk;
import gov.va.hmp.HmpProperties;
import gov.va.hmp.ptselect.PatientSelectService;
import gov.va.hmp.vista.rpc.*;
import gov.va.hmp.vista.rpc.broker.conn.VistaIdNotFoundException;
import gov.va.hmp.vista.rpc.pool.DefaultConnectionManager;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import javax.swing.*;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;

import static gov.va.cpe.vpr.sync.vista.SynchronizationRpcConstants.VPR_GET_OPERATIONAL_DATA_RPC_URI;
import static gov.va.cpe.vpr.sync.vista.SynchronizationRpcConstants.VPR_GET_VISTA_DATA_JSON;
import static gov.va.hmp.vista.util.RpcUriUtils.VISTA_RPC_BROKER_SCHEME;

/**
 * Scratch program for whatever.
 */
public class Foo {
    static RpcTemplate tmp = null;

    private static RpcTemplate getRpcTemplate() {
    	if(tmp==null) {
	    	DefaultConnectionManager connectionManager = new DefaultConnectionManager();
	    	connectionManager.setMaxActive(10);
            final RpcHost host = new RpcHost("localhost", 29060);

            tmp = new RpcTemplate(connectionManager);
            tmp.setHostResolver(new RpcHostResolver() {
                @Override
                public RpcHost resolve(String vistaId) throws VistaIdNotFoundException {
                    return host;
                }
            });
            tmp.setCredentialsProvider(new CredentialsProvider() {
                @Override
                public String getCredentials(RpcHost host, String userInfo) {
//                    return "vpruser1;verifycode1&";
                    return "10vehu;vehu10";
//                    return "11vehu;vehu11";
//                    return "12vehu;vehu12";
                }
            });

    	}
    	return tmp;
    }

    public static void main(String[] args) throws Exception {
        JdsTemplate jdsTemplate = new JdsTemplate();
        jdsTemplate.setRestTemplate(new RestTemplate());
        jdsTemplate.setJdsUrl("http://localhost:9080");
        jdsTemplate.afterPropertiesSet();

        JdsGenericDAO jdsDao = new JdsGenericDAO();
        jdsDao.setJdsTemplate(jdsTemplate);
        jdsDao.afterPropertiesSet();

        Map<String, String> params = new LinkedHashMap<String, String>();
//        params.put("domain", "asu-class");
//        params.put("domain", "asu-role");
//        params.put("domain", "asu-rule");
//        params.put("domain", "doc-action");
//        params.put("domain", "doc-status");
//        params.put("domain", "doc-def");

        params.put("domain", "document");
        params.put("patientId", "217");
        params.put("status", "all");

        RpcTemplate rpcTemplate = getRpcTemplate();

        Map rpcArg = new HashMap();
        rpcArg.put("command", PatientSelectService.GET_CPRS_DEFAULT_LIST_PATIENTS_COMMAND);
        rpcArg.put("server", "SOLS-MAC");

        JsonNode json =rpcTemplate.executeForJson(UserInterfaceRpcConstants.CONTROLLER_RPC_URI, rpcArg);

//        JsonNode json = rpcTemplate.executeForJson(SynchronizationRpcConstants.VPR_GET_OPERATIONAL_DATA_RPC_URI, params);
//        new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(System.out, json);

//        JsonNode json = rpcTemplate.executeForJson(SynchronizationRpcConstants.VPR_GET_VISTA_DATA_JSON_RPC_URI, params);
        new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(System.out, json);

//        for (JsonNode item: json.path("data").path("items")) {
//            Document document = POMUtils.newInstance(Document.class, item);
//            document.setData("pid", "10109");
////            System.out.println(document.toJSON());
//            jdsDao.save(document);
//        }
    }



    private static void jiraSubmitTest() throws Exception {
        try {
            String user = JOptionPane.showInputDialog(null, "Enter username");
            String pwd = JOptionPane.showInputDialog(null, "Password");
            HttpComponentsClientHttpRequestFactory fact = new HttpComponentsClientHttpRequestFactory();
            RestTemplate rt = new RestTemplate(fact);
            String url = "https://"+user+":"+pwd+"@hmpagile.vainnovations.us/rest/api/2/issue/createmeta";
            Map rslt = rt.getForObject(url, Map.class);
            Object projects = rslt.get("projects");
            if(projects!=null && projects instanceof List && ((List)projects).size()>0 && ((List)projects).get(0) instanceof Map) {
                Map<String, Object> project = (Map<String, Object>) ((List)projects).get(0);
                Object issueTypes = ((Map)project).get("issuetypes");
                if(issueTypes != null && issueTypes instanceof List) {
                    Object storyType = null;
                    for(Map<String, Object> issueType: (List<Map<String, Object>>)issueTypes) {
                        System.out.println("Type "+issueType.get("id")+": "+issueType.get("description"));
                        if(issueType.get("name").equals("Story")) {
                            storyType = issueType;
                        }
                    }
                    rslt = new HashMap<String, Object>();
                /*
                    summary
                    issueType
                    reporter
                    description
                    project
                    comment
                    attachment
                 */
                    Map<String, Object> fields = new HashMap<String, Object>();
                    rslt.put("fields",fields);
                    fields.put("project", project);
                    fields.put("summary","Here is my handle");
                    fields.put("issuetype",storyType);
                    fields.put("customfield_10900","foobaz");
                    String purl = "https://"+user+":"+pwd+"@hmpagile.vainnovations.us/rest/api/2/issue";
                    rslt = rt.postForObject(purl, rslt, Map.class);
                    System.out.println("put sumpin");
                }
            }

        } catch(HttpStatusCodeException e) {
            String responseText = e.getResponseBodyAsString();
            System.err.print(responseText);
            e.printStackTrace();
        }
    }
    
    private static void hdrVistaDirect() throws Exception {
    	Map<String, String> params = new LinkedHashMap<String, String>();
        params.put("patientId", "100852");
        params.put("domain", "document");
        params.put("max", "99999");    
        RpcTemplate rpcTemplate = getRpcTemplate();
        
        RpcResponse response = rpcTemplate.execute("vrpcb://10vehu;vehu10@10.5.20.247:9071/ZZVPR SYNC CONTEXT/VPR GET PATIENT DATA JSON", params);
        File f = new File("toutp.txt");
        if(f.exists()) {
        	f.delete();
        }
        f.createNewFile();
        
        FileOutputStream fos = new FileOutputStream(f);
        
        ObjectMapper jsonMapper = new ObjectMapper();
        jsonMapper.writerWithDefaultPrettyPrinter().writeValue(fos, jsonMapper.readTree(response.toString()));
        
        System.out.println("Write to file completed: "+f.getAbsolutePath());
    }
    
    private static void hdrStressTest() throws Exception {
    	InputStream inputstream = null;
        try {
            String url = "https://hdrclucds-di.fo-slc.domain.ext/repositories.domain.ext/fpds/GenericObservationRead1/GENERIC_VISTA_LIST_DATA_FILTER/1012740285V132172/DOCUMENT?_type=xml&max=100&clientName=HMP&excludedAssigningFacility=500&excludedAssigningAuthority=USVHA&requestId=65756756";

            List<VistaDataChunk> rslt = new ArrayList<VistaDataChunk>();
        	HdrHandler hndlr = new HdrHandler();
        	hndlr.list = rslt;
        	SAXParserFactory fact = SAXParserFactory.newInstance();
        	SAXParser parser = fact.newSAXParser();
        	hndlr.url = url;
        	HttpURLConnection conn = (HttpURLConnection)new URL(url).openConnection();
        	inputstream = conn.getInputStream();
        	parser.parse(inputstream, hndlr);
            System.out.println("HDR test completed: "+hndlr.list.size()+" results found.");
        } catch (JsonParseException je) {
            if(inputstream!=null) {
                long offst = je.getLocation().getCharOffset();
                BufferedReader br = new BufferedReader(new InputStreamReader(inputstream));
                String s;
                while((s = br.readLine())!=null) {
                    System.out.println(s.length());
                }
            }
        } finally {
            getRpcTemplate().destroy();
        }
    }
    
    private static void hdrTest() throws Exception {
    	String icn = "1012740115V449145";
    	String domain = "PROBLEM";
    	URL url = new URL("https://hdrclucds-di.fo-slc.domain.ext/repositories.domain.ext/fpds/GenericObservationRead1/GENERIC_VISTA_LIST_DATA_FILTER/"+icn+"/"+domain.toUpperCase()+"?_type=xml&max=100&clientName=HMP&excludedAssigningFacility=553&excludedAssigningAuthority=USVHA&requestId=65756756");
    	HttpURLConnection conn = (HttpURLConnection)url.openConnection();
    	InputStream inputstream = conn.getInputStream();
    	SAXParserFactory fact = SAXParserFactory.newInstance();
    	DefaultHandler handler = new DefaultHandler(){
    		boolean procVal = false;
    		 public void startElement (String uri, String localName, String qName, Attributes attributes) throws SAXException
    		 {
    			 if(qName.equalsIgnoreCase("OBSERVATIONVALUE")) {
    				 procVal = true;
    			 }
    		 }
    		 public void endElement (String uri, String localName, String qName) throws SAXException
    		 {
    			 if(qName.equalsIgnoreCase("OBSERVATIONVALUE")) {
    				 procVal = false;
    			 }
    		 }
    		 public void characters (char ch[], int start, int length) throws SAXException
    		 {
    			 if(procVal) {
    				System.out.println("Val: "+new String(ch));
    			 	Map<String, Object> rslt = POMUtils.parseJSONtoMap(new String(ch));
    			 	Object dat = rslt.get("data");
    			 	Object items = ((Map)dat).get("items");
    			 	for(Object o: ((List)items)) {
    			 		// Construct domain from this.
    			 		AbstractPatientObject aob = POMUtils.newInstance(Problem.class, (Map)o);
    			 		System.out.println("Constructed Object:\n\r\t"+aob);
    			 	}
    			 }
    		 }
    	};
    	
    	fact.newSAXParser().parse(inputstream, handler);

    }
    
    private static void vprcrpcSingleTest() throws Exception {

        Map params1 = new HashMap();
        Map cmd = new HashMap();
        ArrayList<Map> cmdList = new ArrayList<>();

        RpcTemplate t = getRpcTemplate();
        
        cmd.put("command", "getParam");
        cmd.put("uid", "urn:va:param:F484:20011:VPR USER PREF:0");
        
        RpcResponse response = t.execute("vrpcb://10vehu;vehu10@localhost:29060/"+UserInterfaceRpcConstants.CONTROLLER_RPC_URI, cmd);
        
//        System.out.println(response.toString());        
        
        cmd = new HashMap();
        cmd.put("command", "getPatientInfo");
        cmd.put("patientId", "8");

        response = t.execute("vrpcb://10vehu;vehu10@localhost:29060/"+UserInterfaceRpcConstants.CONTROLLER_RPC_URI, cmd);
        
//        System.out.println(response.toString());        
        
        cmd = new HashMap();
        cmd.put("command", "saveParamByUid");
        cmd.put("uid", "urn:va:param:F484:29011:VPR USER PREF:0");
        cmd.put("value", POMUtils.parseJSONtoMap("{\"cpe.context.board\":\"urn:va:viewdefdef:F484:326\",\"cpe.context.patient\":\"1624\",\"cpe.context.roster\":\"urn:va:roster:F484:14\",\"cpe.context.team\":\"urn:va:team:F484:358\",\"cpe.context.triState\":\"split\",\"cpe.editmode\":true,\"cpe.patientpicker.animateDelaySeconds\":\"1000\",\"cpe.patientpicker.animateOption\":\"mouseover\",\"cpe.patientpicker.defaultRosterID\":\"14\",\"cpe.patientpicker.loc\":\"north\",\"cpe.patientpicker.mask\":false,\"cpe.patientpicker.pinned\":false,\"cpe.patientpicker.rememberlast\":false,\"ext.libver\":\"\\/lib\\/ext-4.2.2.1144\\/ext-all-dev.js\",\"ext.theme\":\"\\/css\\/hmp-green-dk.css\"}"));
        
        response = t.execute("vrpcb://10vehu;vehu10@localhost:29060/"+UserInterfaceRpcConstants.CONTROLLER_RPC_URI, cmd);
        
//        System.out.println(response.toString());
    }
    
    private static void vprcrpcChainTest() throws Exception {
        Map params1 = new HashMap();
        Map cmd = new HashMap();
        ArrayList<Map> cmdList = new ArrayList<>();
        
        cmd.put("command", "getParam");
        cmd.put("uid", "urn:va:param:F484:20011:VPR USER PREF:0");
        cmdList.add(cmd);
        
        cmd = new HashMap();
        cmd.put("command", "getPatientInfo");
        cmd.put("patientId", "8");
        cmdList.add(cmd);
        
        cmd = new HashMap();
        cmd.put("command", "saveParamByUid");
        cmd.put("uid", "urn:va:param:F484:29011:VPR USER PREF:0");
        cmd.put("value", POMUtils.parseJSONtoMap("{\"cpe.context.board\":\"urn:va:viewdefdef:F484:326\",\"cpe.context.patient\":\"1624\",\"cpe.context.roster\":\"urn:va:roster:F484:14\",\"cpe.context.team\":\"urn:va:team:F484:358\",\"cpe.context.triState\":\"split\",\"cpe.editmode\":true,\"cpe.patientpicker.animateDelaySeconds\":\"1000\",\"cpe.patientpicker.animateOption\":\"mouseover\",\"cpe.patientpicker.defaultRosterID\":\"14\",\"cpe.patientpicker.loc\":\"north\",\"cpe.patientpicker.mask\":false,\"cpe.patientpicker.pinned\":false,\"cpe.patientpicker.rememberlast\":false,\"ext.libver\":\"\\/lib\\/ext-4.2.2.1144\\/ext-all-dev.js\",\"ext.theme\":\"\\/css\\/hmp-green-dk.css\"}"));
        cmdList.add(cmd);
        params1.put("commandList", cmdList);
       
        Map params2 = new HashMap();
        params2.put("command", "getParam");
        params2.put("uid", "urn:va:param:F484:20011:VPR USER PREF:0");
        
//        params.put("command","getParam");
//        params.put("uid","urn:va:param:F484:20011:VPR USER PREF:0");

        RpcTemplate t = getRpcTemplate();
//        System.out.println("CHAIN RPC CALL:");
        RpcResponse response = t.execute("vrpcb://10vehu;vehu10@localhost:29060/"+UserInterfaceRpcConstants.CONTROLLER_CHAIN_RPC_URI, params1);
        
//        System.out.println(response.toString());
    }
    
    private static void docTest() throws Exception {
        Map params = new HashMap();
        params.put("domain", "new");
        params.put("id", "");
        params.put("text", "1");
        params.put("systemID", "MITOCHONDRIA_EXPRESS");

        RpcTemplate t = getRpcTemplate();
        RpcResponse response = t.execute("vrpcb://10vehu;vehu10@localhost:29060/VPR SYNCHRONIZATION CONTEXT/" + VPR_GET_VISTA_DATA_JSON, params);
        File f = new File("docs_359.txt");
        if(f.exists()) {
        	f.delete();
        }
        f.createNewFile();

        System.out.println(response.toString());
        
        FileOutputStream fos = new FileOutputStream(f);
        
        ObjectMapper jsonMapper = new ObjectMapper();
        jsonMapper.writerWithDefaultPrettyPrinter().writeValue(fos, jsonMapper.readTree(response.toString()));
        
        System.out.println("Write to file completed: "+f.getAbsolutePath());
    }
    
    private static void stressTest() throws Exception {
        Map params = new HashMap();
        params.put("patient", "8");
        params.put("user", "11vehu");
        params.put("num", "5");
        params.put("command", "command");
        params.put("json", "json");
        params.put("domain", "factor");

        RpcTemplate t = getRpcTemplate();
        RpcResponse response = t.execute(VPR_GET_OPERATIONAL_DATA_RPC_URI, params);
        System.out.println(response.toString().length() + " characters ");
        ObjectMapper jsonMapper = new ObjectMapper();
        jsonMapper.writerWithDefaultPrettyPrinter().writeValue(System.out, jsonMapper.readTree(response.toString()));
    }

    private static void multithreadedTest() {
        ArrayList<Thread> treads = new ArrayList<Thread>();
        for (int i = 0; i < 10; i++) {
            treads.add(new Thread() {
                public void run() {
                    try {
                        Foo.clioTest();

//						Foo.reftest();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }
        for (Thread t : treads) {
            t.start();
        }
    }

    private static void getWardsTest() throws Exception {
        Map params = new HashMap();
        params.put("domain", "ward");

        RpcTemplate t = getRpcTemplate();
        RpcResponse response = t.execute(VPR_GET_OPERATIONAL_DATA_RPC_URI, params);
//        System.out.println(response.toString().length() + " characters ");
//        ObjectMapper jsonMapper = new ObjectMapper();
//        jsonMapper.writerWithDefaultPrettyPrinter().writeValue(System.out, jsonMapper.readTree(response.toString()));
    }
    
    private static void getRosterList() throws Exception {
        Map params = new HashMap();

        RpcTemplate t = getRpcTemplate();
        RpcResponse response = t.execute("/VPR UI CONTEXT/VPR GET ROSTER LIST", params);
        System.out.println(response.toString().length() + " characters ");
        ObjectMapper jsonMapper = new ObjectMapper();
        jsonMapper.writerWithDefaultPrettyPrinter().writeValue(System.out, jsonMapper.readTree(response.toString()));
    }
    
    private static void getPatientList() throws Exception {
        Map params = new HashMap();
        params.put("domain", "patient");
        params.put("limit", 200);
        params.put("start", "");
        RpcResponse response = getRpcTemplate().execute(VISTA_RPC_BROKER_SCHEME + "://" + "8B73" + VPR_GET_OPERATIONAL_DATA_RPC_URI, params);
        
        System.out.println(response.toString().length() + " characters ");
        ObjectMapper jsonMapper = new ObjectMapper();
        jsonMapper.writerWithDefaultPrettyPrinter().writeValue(System.out, jsonMapper.readTree(response.toString()));
    }

    private static void extractRostersTest() throws Exception {
        Map params = new HashMap();
        params.put("domain", "roster");
//        params.put("limit", LIMIT);
//        params.put("start", lastPatientRetreived);
        RpcTemplate t = getRpcTemplate();
        RpcResponse response = t.execute(VPR_GET_OPERATIONAL_DATA_RPC_URI, params);
        System.out.println(response.toString().length() + " characters ");
        ObjectMapper jsonMapper = new ObjectMapper();
        Map<String, Object> rslt = POMUtils.parseJSONtoMap(jsonMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonMapper.readTree(response.toString())));
        Map<String, Object> data = (Map<String, Object>) rslt.get("data");
        ArrayList<Map<String, Object>> items = (ArrayList<Map<String, Object>>) data.get("items");
        for(Map<String, Object> row: items) {
        	System.out.println("uid: "+row.get("uid")+": "+row);
        }
//        jsonMapper.writerWithDefaultPrettyPrinter().writeValue(System.out, jsonMapper.readTree(response.toString()));
//        for (int i = 0; i < 10; i++) {
//            System.out.println("---------- Attempt " + (i+1) + ":");
//            try {
//                RpcResponse response = t.execute("vrpcb://fubar;bazspaz@localhost:29060/VPR SYNCHRONIZATION CONTEXT/VPR GET OPERATIONAL DATA", params);
//                System.out.println("success");
//            } catch (DataAccessException e) {
//                if (e.getCause() instanceof BadCredentialsException) {
//                    System.out.println("---------- Bad Credentials");
//                } else if (e.getCause() instanceof LockedException) {
//                    System.out.println("---------- Locked");
//                }
//            }
//        }
    }

    private static void clioTest() throws Exception {
        Map params = new HashMap();
        params.put("domain", "clioterminology");
        RpcResponse response = getRpcTemplate().execute(VPR_GET_OPERATIONAL_DATA_RPC_URI, params);
        System.out.println(response.toString().substring(0,400));
    }
    
    private static void enableWireLogging(boolean enable) {
        ch.qos.logback.classic.Logger log = (ch.qos.logback.classic.Logger) LoggerFactory.getLogger(RpcTemplate.class);
        ch.qos.logback.classic.Logger wire = (ch.qos.logback.classic.Logger) LoggerFactory.getLogger("gov.va.hmp.vista.rpc.wire");
        if (enable) {
            log.setLevel(Level.DEBUG);
            wire.setLevel(Level.DEBUG);
        }
    }

    private static void getRosterById() throws Exception {

        final ObjectMapper jsonMapper = new ObjectMapper();

        final int LIMIT = 100;
        int i = 1;
        boolean done = false;
        Map params = new HashMap();
        params.put("domain", "roster");
        params.put("id", "8");

        RpcResponse response = getRpcTemplate().execute(VPR_GET_OPERATIONAL_DATA_RPC_URI, params);
//            System.out.println(response.toString().length() + " characters in batch " + i);

        JsonNode jsonNode = jsonMapper.readTree(response.toString());

        System.out.println(response.toString());

    }

    private static void reftest() throws Exception {

        final ObjectMapper jsonMapper = new ObjectMapper();

        final int LIMIT = 100;
        int i = 1;
        int patientsRetrieved = -1;
        String lastPatientRetreived = "";

        boolean done = false;
        do {
            Map params = new HashMap();
            params.put("domain", "patient");
            params.put("limit", LIMIT);
            params.put("start", lastPatientRetreived);

            RpcResponse response = getRpcTemplate().execute(VPR_GET_OPERATIONAL_DATA_RPC_URI, params);
//            System.out.println(response.toString().length() + " characters in batch " + i);

            JsonNode jsonNode = jsonMapper.readTree(response.toString());
            lastPatientRetreived = jsonNode.path("data").path("last").asText();
//            jsonMapper.writerWithDefaultPrettyPrinter().writeValue(System.out, jsonNode);
            patientsRetrieved = jsonNode.path("data").path("currentItemCount").asInt();

            System.out.println(response.toString().length() + " characters and " + patientsRetrieved + " patients retreived in batch " + i + " (" + response.getElapsedMillis() + "ms)");
            if (patientsRetrieved < LIMIT) {
                done = true;
                patientsRetrieved = 0; // done
            }

            i++;
        } while (!done);
    }

    private static void rosterGetByDfnTest() throws IOException {
        List dfns = new ArrayList();
        dfns.add("100846");
        dfns.add("229");
        RpcResponse response = getRpcTemplate().execute(VPR_GET_OPERATIONAL_DATA_RPC_URI, Collections.singletonList(dfns)); // this is passing one RPC argument that is a list
        System.out.println(response.toString());
//        jsonMapper.writerWithDefaultPrettyPrinter().writeValue(System.out, jsonMapper.readTree(response.toString()));
    }
    
    private static class HdrHandler extends DefaultHandler
    {
    	public List<VistaDataChunk> list;
		boolean procVal = false;
    	String url = null;
    	String vistaId = null;
    	String domain = null;
        PatientDemographics pt = null;

    	public void startElement (String uri, String localName, String qName, Attributes attributes) throws SAXException
    	{
    		if(qName.equalsIgnoreCase("OBSERVATIONVALUE")) {
    			procVal = true;
    		}
    	}
    	public void endElement (String uri, String localName, String qName) throws SAXException
    	{
    		if(qName.equalsIgnoreCase("OBSERVATIONVALUE")) {
    			procVal = false;
    		}
    	}
    	public void characters (char ch[], int start, int length) throws SAXException
    	{
    		if(procVal) {
				String r1 = new String(ch);
//				if(ch.length>12816000) {
//					r1 = r1.substring(0, 12815476) + "]}}";
//					for(int i = 12815470; i<12815490 && i<ch.length; i++) {
//						System.out.println(" Char at pos "+i+": "+ch[i]);
//					}
//				}
//				char c = '\0';
//				System.out.println("Found char 0 at: "+r1.indexOf(c));
//				r1 = r1.replace(c, ' ');
//				File f = new File("tout.txt");
//				if(f.exists()) {
//					f.delete();
//				}
//				
//				try {
//					FileOutputStream fos = new FileOutputStream(f);
//					
//					FileWriter fw = new FileWriter("tout.txt");
//					fw.write(r1);
//					fw.flush();fw.close();
//					
//				} catch (FileNotFoundException e1) {
//					e1.printStackTrace();
//				} catch (IOException e) {
//					// TODO Auto-generated catch block
//					e.printStackTrace();
//				}
				
    			try {
    				JsonNode rslt = POMUtils.parseJSONtoNode(r1);
    				list.addAll(createVistaDataChunks(vistaId, url, rslt, domain, pt, null));
    			} catch(RuntimeException e) {
    				System.out.println("Couldn't parse the junk returned from "+url);
    				if(e.getCause() instanceof JsonParseException) {
    					long offst = ((JsonParseException)e.getCause()).getLocation().getCharOffset();
    					System.out.println("Leading up to error: "+r1.substring((int)offst-100,(int)offst));
    				}
    				e.printStackTrace();
    			}
    		}
    	}
    	private List<VistaDataChunk> createVistaDataChunks(String vistaId, String rpcUri, JsonNode jsonResponse, String domain, PatientDemographics pt, Map processorParams) {
            JsonNode itemsNode = jsonResponse.path("data").path("items");
            if (itemsNode.isNull())
                throw new DataRetrievalFailureException("missing 'data.items' node in JSON RPC response");
            List<VistaDataChunk> chunks = new ArrayList<VistaDataChunk>(itemsNode.size());
            for (int i = 0; i < itemsNode.size(); i++) {
                JsonNode item = itemsNode.get(i);
            	if(vistaId==null) {
            		vistaId = UidUtils.getSystemIdFromPatientUid(item.path("uid").asText());
            	}
                chunks.add(VistaDataChunk.createVistaDataChunk(vistaId, rpcUri, item, domain, i, itemsNode.size(), pt, null));
            }
            return chunks;
        }
    }
}
