define([
    'main/layouts/columnFour',
    'main/layouts/columnTwo',
    'main/layouts/fullOne',
    'main/layouts/gridFour',
    'main/layouts/gridNine',
    'main/layouts/gridOne',
    'main/layouts/gridOne_noMargin',
    'main/layouts/gridster',
    'main/layouts/gridsterThree',
    'main/layouts/gridThree',
    'main/layouts/gridTwo',
    'main/layouts/rows',
    'main/layouts/centerRegionLayouts/default_fullWidth',
    'main/layouts/topRegionLayouts/default'
], function(
    columnFour,
    columnTwo,
    fullOne,
    gridFour,
    gridNine,
    gridOne,
    gridOneNoMargin,
    gridster,
    gridsterThree,
    gridThree,
    gridTwo,
    rows,
    contentDefaultFullWidth,
    topDefault
) {
    'use strict';
    return {
        columnFour: columnFour,
        columnTwo: columnTwo,
        fullOne: fullOne,
        gridFour: gridFour,
        gridNine: gridNine,
        gridOne: gridOne,
        gridOneNoMargin: gridOneNoMargin,
        gridster: gridster,
        gridsterThree: gridsterThree,
        gridThree: gridThree,
        gridTwo: gridTwo,
        rows: rows,
        contentDefaultFullWidth: contentDefaultFullWidth,
        topDefault: topDefault
    };
});
