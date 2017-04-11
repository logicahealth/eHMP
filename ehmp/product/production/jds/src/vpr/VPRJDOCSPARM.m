VPRJDOCSPARM ;KRM/CJE -- JDS documentation - parameters
 ;
crossPatientCount
 ;;+ count (string, required) - Name of cross-patient count
 ;;    Possible counts:
 ;;    |Name       |
 ;;    |-----------|
 ;;    |collection |
 ;;    |domain     |
 ;;    |patient    |
 ;;zzzzz
crossPatientIndex
 ;;+ index (string, required) - Name of cross-patient index
 ;;    Possible indexes and how the index is specified
 ;;    |Name             |Collections|Fields(Collation,ifNull)       |Sort                   |Set If           |
 ;;    |-----------------|-----------|-------------------------------|-----------------------|-----------------|
 ;;    |patient          |patient    |                               |name asc               |                 |
 ;;    |alert            |alert      |links[].uid                    |referenceDateTime desc |                 |
 ;;    |document-all     |document   |uid                            |referenceDateTime desc |                 |
 ;;    |task-pending     |task       |taskName,createdByCode,dueDate |dueDate asc            |completed!=true  |
 ;;    |document-author  |document   |authorUid                      |referenceDateTime desc |                 |
 ;;zzzzz
filter
 ;;+ filter (string, optional) - Filter the returned results
 ;;      JDS accepts double-quoted strings and unquoted strings as filter arguments. Use double-quoted strings when the argument contains non-alphanumeric characters.
 ;;
 ;;      Separate operators with commas and/or spaces. There may be an optional trailing comma.
 ;;
 ;;      An implicit and group surrounds the entire filter query parameter.
 ;;
 ;;      Grouping operators
 ;;      ------------------
 ;;
 ;;      Grouping operators can be nested. For example, or(and(eq("foo","bar"),like("baz","quux")),in("ping","pong"))
 ;;
 ;;      An implicit and group surrounds the entire filter query parameter. For example, the following 2 filter query parameters are equivalent:
 ;;
 ;;      filter=eq("facilityCode","DOD"),eq("specimen","PLASMA")
 ;;      filter=and(eq("facilityCode","DOD"),eq("specimen","PLASMA"))
 ;;
 ;;      Grouping operators can have any number of operands.
 ;;
 ;;      |Grouping operators|
 ;;      |------------------|
 ;;      |and(operators)|
 ;;      |or(operators)|
 ;;      |not(operators)|
 ;;
 ;;      Comparison operators
 ;;      --------------------
 ;;      Comparison operators take arguments inside parentheses. The first argument is always what JDS field to inspect and the second argument is what value to check for.
 ;;      Arguments can't be empty. Lists are comma-separated items that start with [ and end with ]
 ;;
 ;;      NOTE: all JDS filters must be submitted to JDS URI-encoded. The following examples are not URI-encoded.
 ;;
 ;;      |Operator |Arguments                |Usage                                      |Example                              |
 ;;      |---------|-------------------------|-------------------------------------------|-------------------------------------|
 ;;      |eq       |(field,value)            |equals, exact comparison                   |eq(siteCode,"DOD")                   |
 ;;      |ne       |(field,value)            |not equals, exact comparison               |ne(siteCode,"DOD")                   |
 ;;      |in       |(field,[list,of,values]) |inside list, exact comparison with list    |in(siteCode,["DOD","500"])           |
 ;;      |nin      |(field,[list,of,values]) |not inside list, exact comparison with list|nin(siteCode,["DOD","500"])          |
 ;;      |exists   |(field)                  |exists                                     |exists(siteCode)                     |
 ;;      |gt       |(field,value)            |greater than                               |gt(observed,20130507)                |
 ;;      |gte      |(field,value)            |greater than or equal                      |gte(observed,20130507)               |
 ;;      |lt       |(field,value)            |lesser than                                |lt(observed,20130507)                |
 ;;      |lte      |(field,value)            |lesser than or equal                       |lte(observed,20130507)               |
 ;;      |between  |(field,low,high)         |between exclusive                          |between(observed,20130501,20130601)  |
 ;;      |like     |(field,value)            |M pattern match, case sensitive            |like(kind,"%NOTE")                   |
 ;;      |ilike    |(field,value)            |M pattern match, case insensitive          |ilike(kind,"%note")                  |
 ;;
 ;;      % is the wildcard character
 ;;zzzzz
icnpidjpid
 ;;+ icnpidjpid (string, required) - Patient ID, as an `PID`, `ICN`, or `JPID`
 ;;    Pattern: `^([a-zA-Z0-9]+);([a-zA-Z0-9]+)$|^([0-9]+)V([0-9]+)$|^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$`
 ;;zzzzz
id
 ;;+ id (string, required) - internal identifier of object
 ;;zzzzz
operationalCollection
 ;;+ collection (string, required) - name of collection
 ;;zzzzz
operationalCount
 ;;+ count (string, required) - name of count
 ;;zzzzz
operationalIndex
 ;;+ index (string, required) - name of index
 ;;zzzzz
operationalTemplate
 ;;+ template (string, required) - name of template
 ;;zzzzz
order
 ;;+ order (string, optional) - This specifies the field and direction that will be used to sort the returned data.
 ;;zzzzz
patientCollection
 ;;+ collection (string, required) - name of collection
 ;;zzzzz
patientCount
 ;;+ count (string, required) - Name of patient count
 ;;    Possible counts
 ;;    |Name           |Collections  |Fields         |
 ;;    |---------------|-------------|---------------|
 ;;    |kind           |lab,med.vital|kind           |
 ;;    |lab-count-name |lab          |qualifiedName  |
 ;;    |vs-count-name  |vital        |typeName       |
 ;;zzzzz
patientIndex
 ;;+ index (string, required) - Name of patient index
 ;;    Possible indexes and attributes of the index:
 ;;    |Name             |Collections        |Fields/collation/ifNull        |Sort                       |Set If                             |
 ;;    |-----------------|-------------------|-------------------------------|---------------------------|-----------------------------------|
 ;;    |allergy          |allergy            |                               |                           |                                   |
 ;;    |consult          |consult            |dateTime/V/0                   |dateTime desc              |                                   |
 ;;    |document         |document           |referenceDateTime/V/0          |referenceDateTime desc     |                                   |
 ;;    |parent-documents |document, procedure, surgery, image, consult |dateTime/V/0, document.referenceDateTime |dateTime desc  | parentUid doesn't exist  |
 ;;    |encounter        |visit, appointment |dateTime/V/0                   |dateTime desc              |                                   |
 ;;    |healthfactor     |factor             |recorded/V/0                   |recorded desc              |                                   |
 ;;    |imaging          |image              |dateTime/V/0                   |dateTime desc              |                                   |
 ;;    |immunization     |immunization       |administeredDateTime/V/0       |administeredDateTime desc  |                                   |
 ;;    |laboratory       |lab                |observed/V/0                   |observed desc              |typeName exists                    |
 ;;    |result           |lab                |observed/V/0                   |observed desc              |typeName exists                    |
 ;;    |accession        |lab                |observed/V/0                   |observed desc              |organizerType=accession            |
 ;;    |medication       |med                |overallStop/V/0                |overallStop desc           |                                   |
 ;;    |microbiology     |lab                |observed/V/0                   |observed desc              |localId 1st two characters are MI  |
 ;;    |observation      |obs                |observed/V/0                   |observed desc              |                                   |
 ;;    |order            |order              |entered/V/0                    |entered desc               |                                   |
 ;;    |order-status     |order              |statusName/V/0                 |entered desc               |                                   |
 ;;    |pathology        |lab                |observed/V/0                   |observed desc              |localId 1st two characters are not CH or MI |
 ;;    |problem          |problem            |                               |                           |                                   |
 ;;    |problem-active   |problem            |onset/V/0                      |onset desc                 |removed !=true AND statusCode=urn:sct:55561003 |
 ;;    |problem-inactive |problem            |onset/V/0                      |onset desc                 |removed !=true AND statusCode=urn:sct:73425007 |
 ;;    |problem-both     |problem            |onset/V/0                      |onset desc                 |removed !=true AND statusCode=urn:sct:55561003 OR statusCode=urn:sct:73425007  |
 ;;    |problem-removed  |problem            |onset/V/0                      |onset desc                 |removed=true                       |
 ;;    |procedure        |procedure, surgery, image, consult |dateTime/V/0   |dateTime desc              |                                   |
 ;;    |vitalsign        |vital              |observed/V/0                   |observed desc              |typeName exists                    |
 ;;    |notesview        |document, procedure, surgery, image, consult |dateTime/V/0, document.referenceDateTime |dateTime desc              |
 ;;    |cwad             |document, allergy, alert |referenceDateTime/V/0    |referenceDateTime desc     |uid!="" AND uid contains allergy OR (documentTypeCode={C,D,W} AND status={COMPLETED,AMENDED}) |
 ;;    |med-active-inpt  |med                |overallStop/V/9                |overallStop desc           |medStatus!=null AND medStatus=urn:sct:55561003 AND IMO={null,"",0} AND medType=urn:sct:105903003 |
 ;;    |med-active-outpt |med                |overallStop/V/9                |overallStop desc           |medStatus!=null AND medStatus=urn:sct:55561003 AND NOT (IMO!="" OR medType=urn:sct:105903003)  |
 ;;    |appointment      |appointment        |dateTime/V/9                   |dateTime desc              |                                   |
 ;;    |curvisit         |visit              |dateTime/V/0                   |dateTime desc              |current=true                       |
 ;;    |task             |task               |                               |                           |                                   |
 ;;    |diagnosis        |diagnosis          |                               |                           |                                   |
 ;;zzzzz
patientTemplate
 ;;+ template (string, required) - name of template
 ;;zzzzz
range
 ;;+ range (string, optional) - specifies limits in the index to include in results
 ;;    The range parameter is specific to indexes and prevents JDS from searching every data record for matches and effectively uses the indexes to speed up queries
 ;;
 ;;      Examples:
 ;;
 ;;      |Operation        |Usage                                                                                                                  |Example            |
 ;;      |-----------------|-----------------------------------------------------------------------------------------------------------------------|-------------------|
 ;;      |Single Value     |Only returns results from indexed value exactly matching the supplied value                                            |"value"            |
 ;;      |List             |Only returns results from indexed value exactly matching the supplied list of values                                   |"value,value,value"|
 ;;      |Range Inclusive  |Returns results from the range starting with and including the start value and ending with and including the end value |"start..end"       |
 ;;      |Ragne Exclusive  |Returns results from the range starting with and excluding the start value and ending with and excluding the end value |"]start..end["     |
 ;;      |Multiple Ranges  |If an index contains multiple indexed fields this allows all indexed fields to be used                                 |"range1>range2"*   |
 ;;
 ;;      * NOTE: This is not a comparison operator, it is a separator. range1 and range2 can be any one of the above operations
 ;;zzzzz
site
 ;;+ site (string, required) - The site hash of the system
 ;;zzzzz
store
 ;;+ store (string, required) - The name of the store
 ;;zzzzz
system
 ;;+ system (string, required) - The site hash of the system
 ;;zzzzz
uid
 ;;+ uid (string, required) - The UID of the object
 ;;zzzzz
gdsIndex
 ;;+ gdsIndex (string, required) - The name of the index
 ;;zzzzz
