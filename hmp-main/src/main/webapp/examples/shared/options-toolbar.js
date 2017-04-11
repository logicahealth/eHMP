(function() {
    function getQueryParam(name, queryString) {
        var match = RegExp(name + '=([^&]*)').exec(queryString || location.search);
        return match && decodeURIComponent(match[1]);
    }

    function hasOption(opt) {
        var s = window.location.search;
        var re = new RegExp('(?:^|[&?])' + opt + '(?:[=]([^&]*))?(?:$|[&])', 'i');
        var m = re.exec(s);

        return m ? (m[1] === undefined ? true : m[1]) : false;
    }

    var scriptTags = document.getElementsByTagName('script'),
        defaultTheme = 'classic',
        defaultDirection = 'ltr',
        i = scriptTags.length,
        requires = [
            'Ext.toolbar.Toolbar',
            'Ext.form.field.ComboBox',
            'Ext.form.FieldContainer',
            'Ext.form.field.Radio'

        ],
        defaultQueryString, src, theme, direction;

    while (i--) {
        src = scriptTags[i].src;
        if (src.indexOf('include-ext.js') !== -1) {
            defaultQueryString = src.split('?')[1];
            if (defaultQueryString) {
                defaultTheme = getQueryParam('theme', defaultQueryString) || defaultTheme;
                defaultDirection = getQueryParam('direction', defaultQueryString) || defaultDirection;
            }
            break;
        }
    }

    Ext.themeName = theme = getQueryParam('theme') || defaultTheme;
    direction = getQueryParam('direction') || defaultDirection;

    if (direction === 'rtl') {
        requires.push('Ext.rtl.*');
        Ext.define('Ext.GlobalRtlComponent', {
            override: 'Ext.AbstractComponent',
            rtl: true
        });
    }

    Ext.require(requires);

    Ext.onReady(function() {
        if (hasOption('nocss3')) {
            Ext.supports.CSS3BorderRadius = false;
            Ext.getBody().addCls('x-nbr x-nlg');
        }
        function setParam(param) {
            var queryString = Ext.Object.toQueryString(
                Ext.apply(Ext.Object.fromQueryString(location.search), param)
            );
            location.search = queryString;
        }

        function removeParam(paramName) {
            var params = Ext.Object.fromQueryString(location.search);

            delete params[paramName];

            location.search = Ext.Object.toQueryString(params);
        }
        
        function align() {
            toolbar.alignTo(document.body, 'tr-tr', [-(Ext.getScrollbarSize().width + 4), 0]);
        }

        var toolbar = Ext.widget({
            xtype: 'toolbar',
            border: true,
            rtl: false,
            id: 'options-toolbar',
            floating: true,
            preventFocusOnActivate: true,
            draggable: {
                constrain: true
            },
            items: [{
                xtype: 'combo',
                rtl: false,
                width: 170,
                labelWidth: 50,
                fieldLabel: 'Theme',
                displayField: 'name',
                valueField: 'value',
                labelStyle: 'cursor:move;',
                margin: '0 10 0 0',
                store: Ext.create('Ext.data.Store', {
                    fields: ['value', 'name'],
                    data : [
                        { value: 'access', name: 'Accessibility' },
                        { value: 'classic', name: 'Classic' },
                        { value: 'gray', name: 'Gray' },
                        { value: 'neptune', name: 'Neptune' },
                        { value: 'hmp', name: 'HMP' },
                        { value: 'hi2-default', name: 'Hi2 Blue' }
                    ]
                }),
                value: theme,
                listeners: {
                    select: function(combo) {
                        var theme = combo.getValue();
                        if (theme !== defaultTheme) {
                            setParam({ theme: theme });
                        } else {
                            removeParam('theme');
                        }
                    }
                }
            }, {
                hidden: true,
                xtype: 'fieldcontainer',
                rtl: false,
                fieldDefaults: {
                    margin: '0 5 0 0'
                },
                defaultType: 'radio',
                layout: 'hbox',
                items: [{
                    rtl: false,
                    boxLabel: 'LTR',
                    name: 'direction',
                    inputValue: 'ltr',
                    checked: direction === 'ltr',
                    handler: function(radio, checked) {
                        if (checked) {
                            if (defaultDirection === 'ltr') {
                                removeParam('direction');
                            } else {
                                setParam({ direction: 'ltr' });
                            }
                        }
                    }
                }, {
                    rtl: false,
                    boxLabel: 'RTL',
                    name: 'direction',
                    inputValue: 'rtl',
                    checked: direction === 'rtl',
                    handler: function(radio, checked) {
                        if (checked) {
                            if (defaultDirection === 'rtl') {
                                removeParam('direction');
                            } else {
                                setParam({ direction: 'rtl' });
                            }
                        }
                    }
                }]
            }, {
                xtype: 'tool',
                type: 'close',
                rtl: false,
                handler: function() {
                    toolbar.destroy();
                }
            }]
        });
        toolbar.show();
        align();
        Ext.EventManager.onWindowResize(align);

    });
})();
