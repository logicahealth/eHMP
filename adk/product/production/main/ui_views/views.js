define([
    'main/components/views/errorView',
    'main/ui_components/form/formView',
    'main/components/views/loadingView',
    'main/ui_components/pdfViewer/component',
    'main/ui_components/tray/views/sub_tray_button/view',
    'main/ui_views/table/view',
    'main/ui_views/text_filter/layoutView',
    'main/ui_components/tray/views/summary/view',
    'main/ui_components/tray/views/action_summary_list/view',
    'main/ui_views/gridster/view'
], function(
    Error,
    Form,
    Loading,
    PdfViewer,
    SubTrayButton,
    Table,
    TextFilter,
    TraySummaryList,
    TrayActionSummaryList,
    Gridster
) {
    'use strict';

    var UI_Views = {
        Error: Error.view,
        Form: Form,
        Loading: Loading.view,
        PdfViewer: PdfViewer,
        SubTrayButton: SubTrayButton,
        Table: Table,
        TextFilter: TextFilter,
        TrayActionSummaryList: TrayActionSummaryList,
        TraySummaryList: TraySummaryList,
        Gridster: Gridster
    };

    return UI_Views;
});