/*
 * COPYRIGHT STATUS: © 2015, 2016.  This work, authored by Cognitive Medical Systems
 * employees, was funded in whole or in part by The Department of Veterans
 * Affairs under U.S. Government contract VA118-11-D-1011 / VA118-1011-0013.
 * The copyright holder agrees to post or allow the Government to post all or
 * part of this work in open-source repositories subject to the Apache License,
 * Version 2.0, dated January 2004. All other rights are reserved by the
 * copyright owner.
 *
 * For use outside the Government, the following notice applies:
 *
 *     Copyright 2015 © Cognitive Medical Systems
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */

package com.cognitive.cds.services.cdsexecution.workproduct.producers;
import java.util.Iterator;

import ca.uhn.fhir.model.api.IResource;
import ca.uhn.fhir.model.dstu2.composite.CodingDt;
import ca.uhn.fhir.model.dstu2.resource.CommunicationRequest;
import ca.uhn.fhir.model.dstu2.resource.CommunicationRequest.Payload;
import ca.uhn.fhir.model.dstu2.resource.Provenance;
import ca.uhn.fhir.model.primitive.StringDt;

import com.cognitive.cds.invocation.model.Context;
import com.cognitive.cds.invocation.model.InvocationConstants;
import com.cognitive.cds.invocation.model.Result;
import com.cognitive.cds.invocation.workproduct.model.WorkProduct;
import com.cognitive.cds.services.cdsresults.model.CDSResult;

public class FHIRCommunicationRequest implements FHIRWorkProductProducerIFace {
	
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(FHIRCommunicationRequest.class);
    private static final String CDS_RESULT_TYPE= InvocationConstants.ADVICE;
    private static final int DEFAULT_PRIORITY = 50; 
    private static final String DEFAULT_TITLE = "CDS Advice"; 
    private static final String DEFAULT_PROVENANCE = "Provenance detail was not provided";
    private static final String DEFAULT_CATEGORY="419192003"; //Internal Med
    
    @Override
	public boolean handleWorkProduct(Result result, WorkProduct wp, IResource fhirResource, Context ctx, int idInBundle) {
		
    	boolean okOut = false;
    	
		if (fhirResource instanceof CommunicationRequest)
		{
			CommunicationRequest request = (CommunicationRequest) fhirResource;
			
			CDSResult cdsResult = this.createCDSResult(result, request, ctx, idInBundle);
			wp.setType(CDS_RESULT_TYPE);
			wp.setContext(ctx);
			wp.setPriority(cdsResult.getPriority());
			com.cognitive.cds.invocation.workproduct.model.Payload payload = new com.cognitive.cds.invocation.workproduct.model.Payload();
			payload.setType(cdsResult.getType());
			payload.setData(cdsResult);
			
			if ( request.getCategory()!=null && request.getCategory().getCoding()!=null)
			{
				Iterator<CodingDt> catItr =request.getCategory().getCoding().iterator();
				while (catItr.hasNext())
				{
					CodingDt cd = catItr.next();
					wp.getCategories().add(cd.getCode());
				}
			}
			
			if (wp.getCategories().isEmpty())
			{
				wp.getCategories().add(DEFAULT_CATEGORY);
			}
			wp.getPayload().add(payload);
			okOut = true;
		}
		else
		{
			//Issue a logger warning when this is being used wrong
			logger.warn("Attempted to convert a "+fhirResource.getResourceName()+" using "+this.getClass().getSimpleName());
		}
		return okOut;
	}
    
    public CDSResult createCDSResult(Result result, IResource fhirResource, Context ctx, int idInBundle)
    {
    	CDSResult out=null; 
		if (fhirResource instanceof CommunicationRequest)
		{
			CommunicationRequest request = (CommunicationRequest) fhirResource;
			out = this.createCDSResult(result, request, ctx, idInBundle);
		}
		else
		{
			//Issue a logger warning when this is being used wrong
			logger.warn("Attempted to convert a "+fhirResource.getResourceName()+" using "+this.getClass().getSimpleName());
		}
		return out;
		
    }
    
    private  CDSResult createCDSResult(Result result, CommunicationRequest request, Context ctx, int idInBundle)
    {
    	CDSResult cdsResult = new CDSResult();
    	//Create a unique Id
    	String id = result.getCallId()+"-"+idInBundle;
    	cdsResult.setId(id);
		cdsResult.setGeneratedBy(result.getGeneratedBy());
		cdsResult.setType(CDS_RESULT_TYPE);
		cdsResult.setPriority(DEFAULT_PRIORITY);
		cdsResult.setPid(ctx.getSubject().getId());
		cdsResult.setProvider(ctx.getUser().getId());
		
		if (request.getPriority()!= null)
		{
			//We will use the code of the first code in the list 
			// TODO:  In the future this should be a code system search and mapping operation.
			if (request.getPriority().getCodingFirstRep()!= null)
			{
				String code = request.getPriority().getCodingFirstRep().getCode();
				try
				{
					int val = Integer.parseInt(code);
					if (val < 0)
					{
						logger.warn("A priority value of less then 0 was passed, using a value of 0");
						val = 0;
					}
					else if (val >100)
					{
						logger.warn("A priority of grreater than 100 was passed, using 100");
						val = 100;
					}	
					cdsResult.setPriority(val);
				}
				catch(Exception e) 
				{
					logger.warn("Unrecognized Priority, "+request.getPriority().toString());
				}
				
			}
		}
		
		//We scan the entire payload adding strings together separated by two new lines  
		StringBuffer detail = new StringBuffer();
		Iterator<Payload> itr = request.getPayload().iterator();
		while (itr.hasNext())
		{
			Payload payload = itr.next();
			
			if (payload.getContent() instanceof StringDt )
			{
				StringDt str = (StringDt) payload.getContent(); 
				detail.append(str.getValue());
			}

			if (itr.hasNext())
			{
				detail.append("\n\n");
			}
		}
		//Ok Save in the results
		cdsResult.getDetails().setDetail(detail.toString());

		String title=null; 
		//We map the title to the first reason
		if (request.getReasonFirstRep()!= null)
		{
			if (request.getReasonFirstRep().getCodingFirstRep()!= null)
			{
				title = request.getReasonFirstRep().getCodingFirstRep().getDisplay();
			}
		}
		
		if (title == null)
		{
			title =DEFAULT_TITLE;
		}
		cdsResult.setTitle(title);
		
		//
		String provenance=DEFAULT_PROVENANCE;
		
		
		
		if ((request.getContained()!= null) && (request.getContained().getContainedResources()!=null) )
		{
			Iterator<IResource> conItr = request.getContained().getContainedResources().iterator();
			while(itr.hasNext())
			{
				IResource rsc = conItr.next();
				if (rsc instanceof Provenance)
				{
					Provenance prov = (Provenance) rsc;
					provenance = prov.getText().toString();
					break;
				}
			}
		}
		
		cdsResult.getDetails().setProvenance(provenance);
	
		
		return cdsResult;
    }
    
}
