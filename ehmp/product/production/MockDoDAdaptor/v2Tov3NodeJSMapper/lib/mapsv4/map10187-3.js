// notes

var maputil = require('./maputil.js');

var map = function (v2JSON) {
    var statusListStatus;
    var statusComplete = false;
    var retrievedCount;

    if (v2JSON.queryComplete === "true") {
        for (var i = 0; i < v2JSON.statusList.length; i++) {
            if (v2JSON.statusList[i].SiteStatus === "COMPLETE") {
                retrievedCount = Number(v2JSON.statusList[i].RetrievedCount);
            }
            statusListStatus = v2JSON.statusList[i];
            statusComplete = true;
        }
    }

    var v4JSON = {};

    if (statusComplete) {
        v4JSON = {
            "queryComplete": true,
            "statusList": maputil.v4StatusList(retrievedCount)
        };
    }

    var v4DataList = [];

    for (var i = 0; i < v2JSON.dataList.length; i++) {
        var v2DataRecord = v2JSON.dataList[i].dataRecord;

        var v4DataRecord = maputil.baseTransform(v2DataRecord);

        //v4DataRecord.comments = maputil.nullInsteadOfEmptyString(v2DataRecord.Comments);
        v4DataRecord.responseDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.DateFilledOut);

        if (v2DataRecord.Details instanceof Array) {
            v4DataRecord.responses = v2DataRecord.Details.map(function (v2Detail) {
                var response = {};

                if (v2Detail.Answers instanceof Array) {
                    response.answers = v2Detail.Answers.map(function (v2Answer) {
                        var v4Answer = {};

                        v4Answer.answer = maputil.nullInsteadOfEmptyString(v2Answer.Answer);
                        v4Answer.answerType = maputil.nullInsteadOfEmptyString(v2Answer.AnswerType);
                        v4Answer.choice = Number(v2Answer.Choice);
                        v4Answer.correctAnswer = maputil.nullInsteadOfEmptyString(v2Answer.CorrectAnswer);

                        return v4Answer;
                    });
                }
                if (v2Detail.Choices instanceof Array) {
                    response.choices = v2Detail.Choices.map(function (v2Choice) {
                        var v4Choice = {};

                        v4Choice.choice = Number(v2Choice.Choice);
                        v4Choice.answerType = maputil.nullInsteadOfEmptyString(v2Choice.AnswerType);
                        v4Choice.text = maputil.nullInsteadOfEmptyString(v2Choice.ChoiceText);
                        v4Choice.correctAnswer = maputil.nullInsteadOfEmptyString(v2Choice.CorrectAnswer);
                        v4Choice.selected = v2Choice.IsSelected === "true";

                        return v4Choice;
                    });
                }
                if (v2Detail.Comments instanceof Array) {
                    response.comments = v2Detail.Comments.map(function (v2DetailComment) {
                        var v4DetailComment = {};

                        v4DetailComment.enteredDate = maputil.nullInsteadOfFormattedDateObject(v2DetailComment.DateEntered);
                        v4DetailComment.commentNumber = Number(v2DetailComment.NoteNumber);
                        v4DetailComment.comment = maputil.nullInsteadOfEmptyString(v2DetailComment.NoteText);
                        v4DetailComment.sequenceNumber = Number(v2DetailComment.SeqNumber);
                        v4DetailComment.enteredBy = maputil.nullInsteadOfEmptyOneElementObject(v2DetailComment.CommentBy, "name");

                        return v4DetailComment;
                    });
                }

                response.question = maputil.nullInsteadOfEmptyString(v2Detail.QuestionText);
                response.sequenceNumber =  Number(v2Detail.SequenceNum);

                return response;

            });
        }


        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"questionnaires": v4DataList};

    return v4JSON;

};

module.exports.map = map;