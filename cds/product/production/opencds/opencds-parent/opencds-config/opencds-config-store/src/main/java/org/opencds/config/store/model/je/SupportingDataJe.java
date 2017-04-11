package org.opencds.config.store.model.je;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.opencds.config.api.model.KMId;
import org.opencds.config.api.model.PluginId;
import org.opencds.config.api.model.SupportingData;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;

@Entity(version=1)
public class SupportingDataJe implements SupportingData, ConfigEntity<String> {
    @PrimaryKey
    private String identifier;
    private KMIdJe kmId;
    private String packageType;
    private String packageId;
    private PluginIdJe loadedBy;
    private Date timestamp;
    private String userId;

    private SupportingDataJe() {
    }

    public static SupportingDataJe create(String identifier, KMId kmId, String packageType, String packageId,
            PluginId loadedBy, Date timestamp, String userId) {
        SupportingDataJe sdj = new SupportingDataJe();
        sdj.identifier = identifier;
        sdj.kmId = KMIdJe.create(kmId);
        sdj.packageType = packageType;
        sdj.packageId = packageId;
        sdj.loadedBy = PluginIdJe.create(loadedBy);
        sdj.timestamp = timestamp;
        sdj.userId = userId;
        return sdj;
    }

    public static SupportingDataJe create(SupportingData sd) {
        if (sd == null) {
            return null;
        }
        if (sd instanceof SupportingDataJe) {
            return SupportingDataJe.class.cast(sd);
        }
        return create(sd.getIdentifier(), sd.getKMId(), sd.getPackageType(), sd.getPackageId(), sd.getLoadedBy(),
                sd.getTimestamp(), sd.getUserId());
    }

    public static List<SupportingDataJe> create(List<SupportingData> sds) {
        if (sds == null) {
            return null;
        }
        List<SupportingDataJe> sdjs = new ArrayList<>();
        for (SupportingData sd : sds) {
            sdjs.add(create(sd));
        }
        return sdjs;
    }

    @Override
    public String getPrimaryKey() {
        return identifier;
    }

    @Override
    public String getIdentifier() {
        return identifier;
    }

    @Override
    public KMId getKMId() {
        return kmId;
    }

    @Override
    public String getPackageType() {
        return packageType;
    }

    @Override
    public String getPackageId() {
        return packageId;
    }

    @Override
    public PluginId getLoadedBy() {
        return loadedBy;
    }

    @Override
    public Date getTimestamp() {
        return timestamp;
    }

    @Override
    public String getUserId() {
        return userId;
    }

}
