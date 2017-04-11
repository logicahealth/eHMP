define([], function() {

    var returnLongListOfData = function() {
        var LongListOfData = [];
        for (var i = 1; i <= 5; i++) {
            LongListOfData.push({
                id: '00' + i + 't',
                description: 'Item ' + i + '.0',
                booleanValue: true,
                index: i + '.1'
            }, {
                id: '00' + i + 'f',
                description: 'Item ' + i + '.1',
                booleanValue: false
            }, {
                id: '00' + i + 'u',
                description: 'Item ' + i + '.2',
                booleanValue: undefined,
                index: i + '.3'
            });
        }
        return LongListOfData;
    };

    return returnLongListOfData();

});