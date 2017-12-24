require 'mongo'
#require 'bson'
require 'active_support/time'
include Mongo

module MongoUtility

  def connectToVarMongoDB(dbName)
    var_mongo_uri = "mongodb://var-utility:var-utility@IP           7/var-utility?ssl=true&connectTimeoutMS=20000&authMechanism=SCRAM-SHA-1&"
    db = Mongo::Client.new(var_mongo_uri, :ssl_verify => true, :ssl_ca_cert => 'module/database/mongodb-cert.crt' )
    return db
  end

  def connectToAssessmentMongoDB
    assessment_mongo_uri = "mongodb://assessments-user:changeit@IP           7/assessmentsdb?ssl=true&connectTimeoutMS=20000&authMechanism=SCRAM-SHA-1&"
    db = Mongo::Client.new(assessment_mongo_uri, :ssl_verify => true, :ssl_ca_cert => 'module/database/mongodb.pem' )
    return db
  end

  def deleteAssessment(title)
     db = connectToAssessmentMongoDB
    record = db[:assessments]

    status = record.find("uniqueTitle" => title, "status" => "Draft").delete_one
    status = record.find("uniqueTitle" => title, "status" => "Active").delete_one
    status = record.find("uniqueTitle" => title, "status" => "Inactive").delete_one
    return status
  end

  def removeCollection(collectionName,db)
    collection = db[collectionName]
    collection.drop
  end

  def updateDocument(collectionName, objId, columnName, value, db)
    collection = db[collectionName]
    collection.update_one({:_id => objId}, {"$set" => {columnName => value}})

  end

  def removeDocument(collectionName, objId, db)
    collection = db[collectionName]
    collection.remove({:_id => objId})

  end

  def restoreCollection(collectionName, dbName, fileName, db)
    removeCollection(collectionName, db)

    begin
      coll = db[collectionName]
      coll.insert_many(JSON.parse(File.read("module/database/snapshots/" + fileName)))

    rescue Exception=>e
      puts "[Exception insertCollection]" + e.to_s
    end

  end

  def insertDocument(collectionName, document, db)
    collection = db[collectionName]
    result = collection.insert_one(document)
    #result.n => returns 1, because 1 document was inserted.
    return result.n
  end

  def insertManyDocuments(collectionName, documents, db)
    collection = db[collectionName]

=begin
    #documents sample
    documents = [
        { :name => 'Flying Lotus' },
        { :name => 'Aphex Twin' }
      ]
=end
    result = collection.insert_many(documents)


    #result.n #=> returns 2, if 2 documents were inserted.
    return result.n

  end

  def getFieldByObjId(collectionName, objId, columnName, db)
    db[collectionName].find({:_id => objId}).each do |document|
      #=> Yields a BSON::Document.
      #puts "getFieldByObjId: "  + document.to_s
      return document[columnName]
    end
  end

  def getNthCoreSettings(collectionName, objId, nth, db)
    db[collectionName].find({:_id => objId}).each do |document|
      coreSettings = document['coreSettings']
      return coreSettings[nth]
    end
  end

  def getNthRequestSettings(collectionName, objId, nth, db)
    db[collectionName].find({:_id => objId}).each do |document|
      coreSettings = document['requestSettings']
      return coreSettings[nth]
    end
  end

  def getDocumentByObjId(collectionName, objId, columnName, db)
    db[collectionName].find({:_id => objId}, :fields => [columnName]).each do |document|

      return document['coreSettings']
    end
  end

  def getDocumentByObjId(collectionName, objId, columnName, db)
    db[collectionName].find({:_id => objId}, :fields => [columnName]).each do |document|

      return document['requestSettings']
    end
  end

  def verifyNotificationDeleted(collectionName, objId, columnName, db)
    document = getDocumentByObjId(collectionName, objId, columnName, db)
    isDeleted = true

    for record in document
      if record[columnName] == false
        isDeleted = false
        break
      end
    end
    #puts "[verifyNotificationDeleted ] objId: " + objId + " - columnName: " + columnName + " IsDeleted: " + isDeleted.to_s
    return isDeleted

  end

  def verifyDocumentsDeleted(collectionName, objId, columnName, db)
    document =  getDocumentByObjId(collectionName, objId, columnName, db)
    isDeleted = true

    for record in document
      #puts "record[columnName] = " + record[columnName].to_s

      if record[columnName] == false
        isDeleted = false
        break
      end
    end

    return isDeleted

  end

  def retrieveThisFieldInDocumentWithMultiRows(collectionName, objId,  columnName, db)
    document = getDocumentByObjId(collectionName, objId, columnName, db)
    outPut = ""
    document.each { |record|
      #puts record[columnName]
      if record[columnName] != nil then
        outPut = record[columnName] + ',' + outPut.to_s
      else
        output = "" + "," + output.to_s
      end
    }
    #puts "outPut=" + outPut.to_s
    return outPut

  end

  def retrieveThisFieldInDocumentWithMultiRowsAsArray(collectionName, objId,  columnName, db)
    document = getDocumentByObjId(collectionName, objId, columnName, db)
    outPut = Array.new
    document.each { |record|
      if record[columnName] != nil then
        outPut.push(record[columnName])
      end
    }
    return outPut
  end

  def retrieveThisFieldInDocument(collectionName, objId,  columnName, db)
    document = getDocumentByObjId(collectionName, objId, columnName, db)

    for record in document
      puts "record[columnName]=" + record[columnName].to_s
      return record[columnName]
    end
  end

  def retreiveAllDocumentsInCollection(collectionName, db)
    documentArray = []

    db[collectionName].find().each do |document|
      documentArray << document
    end

    puts documentArray.to_s

    return documentArray
  end
end