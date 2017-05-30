package org.opencds.plugin;

public interface PluginDataCache {

    <V> V get(SupportingData key);

    <V> void put(SupportingData key, V value);

}
