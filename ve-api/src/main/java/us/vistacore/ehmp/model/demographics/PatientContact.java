package us.vistacore.ehmp.model.demographics;

import java.util.HashSet;
import java.util.Set;

public class PatientContact {

    private Long id;
    private Long version;
    private String name;
    private Set<Address> addresses;
    private String typeName;
    private String typeCode;
    private Set<Telecom> telecomList;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<Address> getAddresses() {
        return addresses;
    }

    public void setAddress(Set<Address> addresses) {
        this.addresses = addresses;
    }

    public Set<Telecom> getTelecomList() {
        return telecomList;
    }

    public void setTelecoms(Set<Telecom> telecomList) {
        this.telecomList = telecomList;
    }

    public void addToTelecomList(Telecom telecom) {
        if (this.telecomList == null) {
            this.telecomList = new HashSet<Telecom>();
        }
        this.telecomList.add(telecom);
    }

    public void addToAddresses(Address address) {
        if (this.addresses == null) {
            this.addresses = new HashSet<Address>();
        }
        this.addresses.add(address);
    }

    public String toString() {
        return name;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public String getTypeCode() {
        return typeCode;
    }

    public void setTypeCode(String typeCode) {
        this.typeCode = typeCode;
    }
}
