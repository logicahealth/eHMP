package org.opencds.config.store.model.je;

public interface SecondaryConfigEntity<PK, SK> extends ConfigEntity<PK>{
    SK getSecondaryKey();
}
