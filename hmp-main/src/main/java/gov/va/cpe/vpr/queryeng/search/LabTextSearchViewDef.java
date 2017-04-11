package gov.va.cpe.vpr.queryeng.search;

import gov.va.cpe.vpr.Result;
import gov.va.cpe.vpr.queryeng.RenderTask;
import gov.va.cpe.vpr.queryeng.ViewDef;
import gov.va.cpe.vpr.queryeng.ViewParam;
import gov.va.cpe.vpr.queryeng.ViewParam.RequiredParam;
import gov.va.hmp.healthtime.PointInTime;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrQuery.ORDER;
import org.apache.solr.common.params.DisMaxParams;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component(value = "gov.va.cpe.vpr.queryeng.search.LabTextSearchViewDef")
@Scope("prototype")
public class LabTextSearchViewDef extends ViewDef {

	public LabTextSearchViewDef() {
		declareParam(new ViewParam.PatientIDParam());
		declareParam(new ViewParam.SortParam("resulted", false));
		declareParam(new RequiredParam("qualifiedName"));
		declareParam(new RequiredParam("query"));
		declareParam(new ViewParam.DateRangeParam("range", null));
		
		this.domainClasses.add(Result.class.getSimpleName());

		// first run lucene query (roughly same query as DocSearchFrame)
		addQuery(new SOLRQuery("uid", "\"#{getParamStr('query')}\"") {
			
			@Override
			protected void modifySolrQuery(SolrQuery qry, RenderTask task) {
				// filter by range if specified
				if (task.getParamStr("range")!=null) {
					String range = task.getParamStr("range");
					qry.addFilterQuery("{!tag=dt}resulted:[" + new PointInTime(range) + " TO *]");
				}
				
				// filter by pid, and document + title
				qry.addFilterQuery("pid:"+task.getParamStr("pid"));
				qry.addFilterQuery("domain:result", "qualified_name:\"" + task.getParamStr("qualifiedName") + "\"");
				qry.addSort("resulted", ORDER.desc);
				
				// same highlighting as search
				qry.setHighlight(true);
				qry.setHighlightFragsize(45);
				qry.setHighlightSnippets(5);
				qry.addHighlightField("body").addHighlightField("subject");
				
			    // special eDisMax query options
				qry.set("defType", "synonym_edismax");
				qry.set("synonyms", true);
				qry.set(DisMaxParams.QS, 4);
				qry.set(DisMaxParams.QF, "all");
			}
			
			private static final String DETAIL_URL = "/vpr/detail/%s?searchterm=%s";
		});
	}
}
