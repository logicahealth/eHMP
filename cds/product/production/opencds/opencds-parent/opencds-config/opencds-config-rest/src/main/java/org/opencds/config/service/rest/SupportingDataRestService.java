package org.opencds.config.service.rest;

import java.io.InputStream;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import javax.xml.bind.JAXBElement;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opencds.config.api.ConfigurationService;
import org.opencds.config.api.model.SupportingData;
import org.opencds.config.mapper.SupportingDataMapper;
import org.opencds.config.schema.Link;
import org.opencds.config.schema.ObjectFactory;
import org.opencds.config.schema.SupportingDataList;
import org.opencds.config.service.rest.util.KMIdUtil;
import org.opencds.config.service.rest.util.Responses;
import org.opencds.config.util.URIUtil;

@Path("supportingdata")
public class SupportingDataRestService {
    private static final String SELF = "self";
    private static final Log log = LogFactory.getLog(SupportingDataRestService.class);

    private ConfigurationService configurationService;

    public SupportingDataRestService(ConfigurationService configurationService) {
        this.configurationService = configurationService;
    }

    // /supportingdata

    @GET
    @Produces(MediaType.APPLICATION_XML)
    public SupportingDataList getSupportingDataSet(@Context UriInfo uriInfo) {
        List<SupportingData> supportingDataInternal = configurationService.getKnowledgeRepository()
                .getSupportingDataService().getAll();
        SupportingDataList sdList = SupportingDataMapper.external(supportingDataInternal);
        for (org.opencds.config.schema.SupportingData sd : sdList.getSupportingData()) {
            Link link = new Link();
            link.setRel(SELF);
            link.setHref(uriInfo.getAbsolutePathBuilder().path(sd.getIdentifier()).build().toString());
            sd.setLink(link);
        }
        return sdList;
    }

    @POST
    @Consumes(MediaType.APPLICATION_XML)
    public Response createSupportingData(@Context UriInfo uriInfo,
            JAXBElement<org.opencds.config.schema.SupportingData> jaxSD) {
        SupportingData supportingData = SupportingDataMapper.internal(jaxSD.getValue());
        if (hasKM(supportingData) && !kmExists(supportingData)) {
            return Responses.notFound("KnowledgeModule not found: id= "
                    + URIUtil.buildKMIdString(jaxSD.getValue().getKmId()));
        }
        if (found(supportingData.getIdentifier())) {
            return Responses.conflict("SupportingData already exists: supportingDataId= "
                    + supportingData.getIdentifier());
        }
        try {
            configurationService.getKnowledgeRepository().getSupportingDataService().persist(supportingData);
        } catch (Exception e) {
            return Responses.internalServerError(e.getMessage());
        }
        return Responses.created(uriInfo, supportingData.getIdentifier());
    }

    // /supportingdata/<SupportingDataId>

    @GET
    @Path("{supportingDataId}")
    @Produces(MediaType.APPLICATION_XML)
    public JAXBElement<org.opencds.config.schema.SupportingData> getSupportingData(@Context UriInfo uriInfo,
            @PathParam("supportingDataId") String supportingDataId) {
        SupportingData supportingData = find(supportingDataId);
        if (supportingData == null) {
            throw new NotFoundException("SupportingData metadata not found: supportingDataId= " + supportingDataId);
        }
        org.opencds.config.schema.SupportingData sd = SupportingDataMapper.external(supportingData);
        Link link = new Link();
        link.setRel(SELF);
        link.setHref(uriInfo.getAbsolutePath().toString());
        sd.setLink(link);
        return new ObjectFactory().createSupportingData(sd);
    }

    @PUT
    @Path("{supportingDataId}")
    @Consumes(MediaType.APPLICATION_XML)
    public Response updateSupportingData(@Context UriInfo uriInfo,
            @PathParam("supportingDataId") String supportingDataId,
            JAXBElement<org.opencds.config.schema.SupportingData> jaxSD) {
        SupportingData supportingData = SupportingDataMapper.internal(jaxSD.getValue());
        if (!supportingDataId.equals(supportingData.getIdentifier())) {
            return Responses.badRequest("SupportingData Identifier of request and document do not match");
        }
        if (hasKM(supportingData) && !kmExists(supportingData)) {
            return Responses.notFound("KnowledgeModule not found: id= "
                    + URIUtil.buildKMIdString(jaxSD.getValue().getKmId()));
        }
        boolean created = false;
        if (!found(supportingData.getIdentifier())) {
            created = true;
        }
        try {
            configurationService.getKnowledgeRepository().getSupportingDataService().persist(supportingData);
        } catch (Exception e) {
            return Responses.internalServerError(e.getMessage());
        }
        if (created) {
            return Responses.created(uriInfo, supportingData.getIdentifier());
        } else {
            return Responses.noContent();
        }
    }

    @DELETE
    @Path("{supportingDataId}")
    public Response deleteSupportingData(@PathParam("supportingDataId") String supportingDataId) {
        try {
            configurationService.getKnowledgeRepository().getSupportingDataService().delete(supportingDataId);
        } catch (Exception e) {
            return Responses.internalServerError(e.getMessage());
        }
        return Responses.noContent();
    }

    /*
     * SUPPORTING DATA - PACKAGE
     */

    // /config/knowledgemodules/<KMId>/supportingdata/<SupportingDataId>/package

    @GET
    @Path("{supportingDataId}/package")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public InputStream getSupportingDataPackage(@PathParam("supportingDataId") String supportingDataId) {
        if (!found(supportingDataId)) {
            throw new NotFoundException("SupportingData metadata not found: supportingDataId= " + supportingDataId);
        }
        InputStream inputStream = configurationService.getKnowledgeRepository().getSupportingDataService()
                .getSupportingDataPackage(supportingDataId);
        if (inputStream == null) {
            throw new NotFoundException("Supporting data package does not exist (not found) for supportingDataId: "
                    + supportingDataId);
        }
        return inputStream;
    }

    /**
     * Creates or updates the supporting data package.
     * 
     * @param kmidString
     * @param supportingDataId
     * @param supportingDataPackage
     * @return
     */
    @PUT
    @Path("{supportingDataId}/package")
    @Consumes(MediaType.APPLICATION_OCTET_STREAM)
    public Response putSupportingDataPackage(@Context UriInfo uriInfo,
            @PathParam("supportingDataId") String supportingDataId, InputStream supportingDataPackage) {
        boolean created = false;
        if (!packageExists(supportingDataId)) {
            created = true;
        }
        try {
            configurationService.getKnowledgeRepository().getSupportingDataService()
                    .persistSupportingDataPackage(supportingDataId, supportingDataPackage);
        } catch (Exception e) {
            return Responses.internalServerError(e.getMessage());
        }
        if (created) {
            return Responses.created(uriInfo);
        } else {
            return Responses.noContent();
        }
    }

    @DELETE
    @Path("{supportingDataId}/package")
    public Response deleteSupportingDataPackage(@PathParam("supportingDataId") String supportingDataId) {
        if (!found(supportingDataId)) {
            return Responses.notFound("SupportingData metadata not found: supportingDataId= " + supportingDataId);
        }
        if (!packageExists(supportingDataId)) {
            return Responses.notFound("SupportingData package not found: supportingDataId= " + supportingDataId);
        }
        try {
            configurationService.getKnowledgeRepository().getSupportingDataService()
                    .deleteSupportingDataPackage(supportingDataId);
        } catch (Exception e) {
            return Responses.internalServerError(e.getMessage());
        }
        return Responses.noContent();
    }

    private boolean found(String identifier) {
        return find(identifier) != null;
    }

    private SupportingData find(String identifier) {
        return configurationService.getKnowledgeRepository().getSupportingDataService().find(identifier);
    }

    private boolean hasKM(SupportingData supportingData) {
        return supportingData.getKMId() != null;
    }

    private boolean kmExists(SupportingData supportingData) {
        return KMIdUtil.found(configurationService.getKnowledgeRepository().getKnowledgeModuleService(),
                supportingData.getKMId());
    }

    private boolean packageExists(String supportingDataId) {
        return configurationService.getKnowledgeRepository().getSupportingDataService().packageExists(supportingDataId);
    }

}
