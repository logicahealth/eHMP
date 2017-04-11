Ext.define('gov.va.hmp.util.LayoutUtil', {
    statics: {
        collapseAndResize: function(composedJQueryDocIdArgument) {
            jQuery(composedJQueryDocIdArgument).toggleClass('hmp-document-collapsed');
            var detailPanels = Ext.ComponentQuery.query('#griddetailpanelid');
            Ext.Array.each(detailPanels, function(detailPanel) {
                detailPanel.doLayout();
            });
        },
        gotoAndResize: function(addendumid) {
            var domel = document.getElementById(addendumid);
            var excmp = Ext.getCmp(domel.id);
            while(!excmp) {
                domel = domel.parentNode;
                excmp = Ext.getCmp(domel.id);
            }
            if(!excmp.scrollFlags.y) {
                excmp = excmp.up('component[scrollFlags!=null]');
            }
            domel = document.getElementById(addendumid);
            if(excmp && domel) {
                excmp.body.dom.scrollTop=domel.offsetTop;
            }
        }
    }
})
