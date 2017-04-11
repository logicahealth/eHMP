package gov.va.hmp.healthtime.solr.schema;

import gov.va.hmp.healthtime.PointInTime;
import gov.va.hmp.healthtime.format.HL7DateTimeFormat;
import org.apache.lucene.index.IndexableField;
import org.apache.lucene.search.SortField;
import org.apache.solr.common.SolrException;
import org.apache.solr.response.TextResponseWriter;
import org.apache.solr.schema.IndexSchema;
import org.apache.solr.schema.PrimitiveFieldType;
import org.apache.solr.schema.SchemaField;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Map;

/**
 * This FieldType accepts HL7 time stamp (TS) strings.
 * <p/>
 * Format: YYYY[MM[DD[HHMM[SS[.S[S[S[S]]]]]]]][+/-ZZZZ]^<degree of precision>
 *
 * @see gov.va.hmp.healthtime.PointInTime
 */
public class HL7DateField extends PrimitiveFieldType {
    private static final Logger LOG = LoggerFactory
            .getLogger(HL7DateField.class);

    @Override
    protected void init(IndexSchema schema, Map<String, String> args) {
        LOG.debug("HL7DateField init()");
        super.init(schema, args);

        // Tokenizing makes no sense
        restrictProps(TOKENIZED);
    }

    @Override
    public void write(TextResponseWriter writer, String name, IndexableField f) throws IOException {
        LOG.debug("HL7DateField write()");
        writer.writeStr(name, f.stringValue(), false);
    }

    @Override
    public SortField getSortField(SchemaField field, boolean reverse) {
        LOG.debug("HL7DateField getSortField()");
        return getStringSort(field, reverse);
    }

    @Override
    public String toInternal(String val) {
        LOG.debug("HL7DateField toInternal() START val: '" + val + "'");
        try {
            HL7DateTimeFormat.parse(val);
        } catch (IllegalArgumentException e) {
            LOG.debug("HL7DateField toInternal() IllegalArgumentException: '" + val + "'");
            throw new SolrException(SolrException.ErrorCode.BAD_REQUEST, "Invalid HL7 Date String: '" + val + "'");
        }
        LOG.debug("HL7DateField toInternal() RETURN val: '" + val + "'");
        return val;
    }

    public String toInternal(PointInTime t) {
        LOG.debug("HL7DateField init(PointInTime)");
        if (t == null) return null;
        return t.toString();
    }

    @Override
    public PointInTime toObject(IndexableField f) {

        LOG.debug("HL7DateField toObject()");
        return HL7DateTimeFormat.parse(f.stringValue());
    }
}
