Ext.define('KitchenSink.view.Header', {
    extend: 'Ext.Container',
    xtype : 'pageHeader',
    
    ui   : 'sencha',
    height: 52,
    
    items: [{
            xtype: 'component',
            cls  : 'x-logo',
            html : 'Ext JS 4.2 Kitchen Sink'
    }]
});
