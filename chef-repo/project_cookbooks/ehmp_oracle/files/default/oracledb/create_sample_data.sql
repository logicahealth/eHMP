
--------------------------------------------------------
--  Clear Sample data for Table MESSAGE
--------------------------------------------------------
DELETE FROM COMMUNICATION.MESSAGE WHERE identifier IN ('identifier_version', 'identifier1', 'identifier2', 'identifier3', 'identifier4', 'identifier5', 'identifier6', 'identifier7', 'identifier8') OR recipient = 'sample.data';

COMMIT;

--------------------------------------------------------
--  Clear Sample data for Table USER_PREFERENCES
--------------------------------------------------------
DELETE FROM COMMUNICATION.USER_PREFERENCES WHERE user_id IN ('sampleUser1', 'sampleUser2');

COMMIT;

--------------------------------------------------------
--  Sample data for Table MESSAGE
--------------------------------------------------------
INSERT
INTO COMMUNICATION.MESSAGE
  (
    IDENTIFIER,
    CATEGORY_SYSTEM,
    CATEGORY_CODE,
    SENDER,
    RECIPIENT,
    PAYLOAD_TITLE,
    PAYLOAD_CONTENT,
    SENT,
    STATUS_SYSTEM,
    STATUS_CODE
  )
  VALUES
  (
    'identifier1',
    'http://ehmp.DNS   /messageCategories',
    'announcements-system',
    'eHMP',
    'sample.data',
    'Sample Announcement 1',
    'Sample announcment line 1.\n\nSample announcement line 2.',
    to_timestamp_tz('09-FEB-17 08.01.49.167129000 AM -05:00','DD-MON-RR HH.MI.SSXFF AM TZR'),
    'http://hl7.org/fhir/ValueSet/communication-status',
    'completed'
  );
INSERT
INTO COMMUNICATION.MESSAGE
  (
    IDENTIFIER,
    CATEGORY_SYSTEM,
    CATEGORY_CODE,
    SENDER,
    RECIPIENT,
    PAYLOAD_TITLE,
    PAYLOAD_CONTENT,
    SENT,
    STATUS_SYSTEM,
    STATUS_CODE
  )
  VALUES
  (
    'identifier2',
    'http://ehmp.DNS   /messageCategories',
    'announcements-system',
    'eHMP',
    'sample.data',
    'Sample Announcement 2',
    'Sample announcment line 1.\n\nSample announcement line 2.',
    to_timestamp_tz('08-FEB-17 08.01.49.167129000 AM -05:00','DD-MON-RR HH.MI.SSXFF AM TZR'),
    'http://hl7.org/fhir/ValueSet/communication-status',
    'completed'
  );
INSERT
INTO COMMUNICATION.MESSAGE
  (
    IDENTIFIER,
    CATEGORY_SYSTEM,
    CATEGORY_CODE,
    SENDER,
    RECIPIENT,
    PAYLOAD_TITLE,
    PAYLOAD_CONTENT,
    SENT,
    STATUS_SYSTEM,
    STATUS_CODE
  )
  VALUES
  (
    'identifier_version',
    'http://ehmp.DNS   /messageCategories',
    'announcements-system',
    'eHMP',
    'version.text',
    'Sample Announcement Version Test',
    'Sample announcment for Version Test.',
    to_timestamp_tz('08-FEB-17 08.01.49.167129000 AM -05:00','DD-MON-RR HH.MI.SSXFF AM TZR'),
    'http://hl7.org/fhir/ValueSet/communication-status',
    'completed'
  );
INSERT
INTO COMMUNICATION.MESSAGE
  (
    IDENTIFIER,
    CATEGORY_SYSTEM,
    CATEGORY_CODE,
    SENDER,
    RECIPIENT,
    PAYLOAD_TITLE,
    PAYLOAD_CONTENT,
    SENT,
    STATUS_SYSTEM,
    STATUS_CODE
  )
  VALUES
  (
    'identifier3',
    'http://ehmp.DNS   /messageCategories',
    'announcements-system',
    'eHMP',
    'sample.data',
    'Sample Deleted Announcement',
    'Sample announcment line 1.\n\nSample announcement line 2.',
    to_timestamp_tz('07-FEB-17 08.01.49.167129000 AM -05:00','DD-MON-RR HH.MI.SSXFF AM TZR'),
    'http://ehmp.DNS   /messageStatus',
    'deleted'
  );
INSERT
INTO COMMUNICATION.MESSAGE
  (
    IDENTIFIER,
    CATEGORY_SYSTEM,
    CATEGORY_CODE,
    SENDER,
    RECIPIENT,
    PAYLOAD_TITLE,
    PAYLOAD_CONTENT,
    SENT,
    STATUS_SYSTEM,
    STATUS_CODE,
    PAYLOAD_ATTACHMENT_CONTENTTYPE,
    PAYLOAD_ATTACHMENT_DATA
  )
  VALUES
  (
    'identifier4',
    'http://ehmp.DNS   /messageCategories',
    'announcements-terms',
    'eHMP',
    'sample.data',
    'Sample Terms',
    'Sample terms line 1.\n\nSample terms line 2.',
    to_timestamp_tz('06-FEB-17 08.01.49.167129000 AM -05:00','DD-MON-RR HH.MI.SSXFF AM TZR'),
    'http://hl7.org/fhir/ValueSet/communication-status',
    'completed',
    'image/jpg',
    '47494638396120002000f700000000000000330000660000990000cc0000ff002b00002b33002b66002b99002bcc002bff0055000055330055660055990055cc0055ff0080000080330080660080990080cc0080ff00aa0000aa3300aa6600aa9900aacc00aaff00d50000d53300d56600d59900d5cc00d5ff00ff0000ff3300ff6600ff9900ffcc00ffff3300003300333300663300993300cc3300ff332b00332b33332b66332b99332bcc332bff3355003355333355663355993355cc3355ff3380003380333380663380993380cc3380ff33aa0033aa3333aa6633aa9933aacc33aaff33d50033d53333d56633d59933d5cc33d5ff33ff0033ff3333ff6633ff9933ffcc33ffff6600006600336600666600996600cc6600ff662b00662b33662b66662b99662bcc662bff6655006655336655666655996655cc6655ff6680006680336680666680996680cc6680ff66aa0066aa3366aa6666aa9966aacc66aaff66d50066d53366d56666d59966d5cc66d5ff66ff0066ff3366ff6666ff9966ffcc66ffff9900009900339900669900999900cc9900ff992b00992b33992b66992b99992bcc992bff9955009955339955669955999955cc9955ff9980009980339980669980999980cc9980ff99aa0099aa3399aa6699aa9999aacc99aaff99d50099d53399d56699d59999d5cc99d5ff99ff0099ff3399ff6699ff9999ffcc99ffffcc0000cc0033cc0066cc0099cc00cccc00ffcc2b00cc2b33cc2b66cc2b99cc2bcccc2bffcc5500cc5533cc5566cc5599cc55cccc55ffcc8000cc8033cc8066cc8099cc80cccc80ffccaa00ccaa33ccaa66ccaa99ccaaccccaaffccd500ccd533ccd566ccd599ccd5ccccd5ffccff00ccff33ccff66ccff99ccffccccffffff0000ff0033ff0066ff0099ff00ccff00ffff2b00ff2b33ff2b66ff2b99ff2bccff2bffff5500ff5533ff5566ff5599ff55ccff55ffff8000ff8033ff8066ff8099ff80ccff80ffffaa00ffaa33ffaa66ffaa99ffaaccffaaffffd500ffd533ffd566ffd599ffd5ccffd5ffffff00ffff33ffff66ffff99ffffccffffff00000000000000000000000021f904010000fc002c00000000200020000008ff00371429b2619fc183080dbe899630e140810407366c2870e1c47d103764bc887020135017230e8cc8f1601168251f1661387119ca7dd194edabb3ac24cb92758c286482b188c5921ca31154267483b29120815e7c03d10e44262f955e84080ad4c88755056e80131528c1a4a0b41601ab72a5d20d490d5a458b30ec489940d31eacda10d4929a0da325d5bb4fae5abf7db94e7c53446161b673bfb68d28f8a0d0224405421b4896aa4168102923842370099c8146b4561d29da6d91253783d68908ca944881a309323dcd59e24168b535f7150b566051a204bb46232cd0cee2b18bf77d36b87a22b4378041194f08121a5c972d3f3634155d296ecb8991275156ba6cb568b51111bb2e28f539d5b5a46317967a713893919f05d2cf4b78a5e468beed979032f715449861023a07074c7b016692562595a7547a22a5765b6d6791f6d045e51134a158247134d984230504003b'
  );
INSERT
INTO COMMUNICATION.MESSAGE
  (
    IDENTIFIER,
    CATEGORY_SYSTEM,
    CATEGORY_CODE,
    SENDER,
    RECIPIENT,
    PAYLOAD_TITLE,
    PAYLOAD_CONTENT,
    SENT,
    STATUS_SYSTEM,
    STATUS_CODE
  )
  VALUES
  (
    'identifier8',
    'http://ehmp.DNS   /messageCategories',
    'announcements-terms',
    'eHMP',
    'sample.data',
    'Sample Terms 8',
    'Sample terms 8 line 1',
    to_timestamp_tz('04-FEB-17 08.01.49.167129000 AM -05:00','DD-MON-RR HH.MI.SSXFF AM TZR'),
    'http://hl7.org/fhir/ValueSet/communication-status',
    'completed'
  );
INSERT
INTO COMMUNICATION.MESSAGE
  (
    IDENTIFIER,
    CATEGORY_SYSTEM,
    CATEGORY_CODE,
    SENDER,
    RECIPIENT,
    PAYLOAD_TITLE,
    PAYLOAD_CONTENT,
    SENT,
    STATUS_SYSTEM,
    STATUS_CODE
  )
  VALUES
  (
    'identifier5',
    'http://ehmp.DNS   /messageCategories',
    'announcements-terms',
    'eHMP',
    'sample.data',
    'Sample Deleted Terms',
    'Sample terms line 1.\n\nSample terms line 2.',
    to_timestamp_tz('05-FEB-17 08.01.49.167129000 AM -05:00','DD-MON-RR HH.MI.SSXFF AM TZR'),
    'http://ehmp.DNS   /messageStatus',
    'deleted'
  );
INSERT
INTO COMMUNICATION.MESSAGE
  (
    IDENTIFIER,
    CATEGORY_SYSTEM,
    CATEGORY_CODE,
    SENDER,
    RECIPIENT,
    PAYLOAD_TITLE,
    PAYLOAD_CONTENT,
    PAYLOAD_DATA,
    SENT,
    STATUS_SYSTEM,
    STATUS_CODE,
    PAYLOAD_ATTACHMENT_CONTENTTYPE,
    PAYLOAD_ATTACHMENT_DATA
  )
  VALUES
  (
    'identifier6',
    'http://ehmp.DNS   /messageCategories',
    'announcements-promotions',
    'eHMP',
    'sample.data',
    'Sample Promotion',
    'Sample promotion line 1.\n\nSample promotion line 2.',
    '{ "feature-menu" : "new-features", "link":[{"href":"http://ehmp.newfeatures.gov", "title":"New Features"}, {"href":"http://ehmp.helpcontent.gov", "title":"New Features Help"}] }',
    to_timestamp_tz('06-FEB-17 08.01.49.167129000 AM -05:00','DD-MON-RR HH.MI.SSXFF AM TZR'),
    'http://hl7.org/fhir/ValueSet/communication-status',
    'completed',
    'image/jpg',
    '47494638396120002000f700000000000000330000660000990000cc0000ff002b00002b33002b66002b99002bcc002bff0055000055330055660055990055cc0055ff0080000080330080660080990080cc0080ff00aa0000aa3300aa6600aa9900aacc00aaff00d50000d53300d56600d59900d5cc00d5ff00ff0000ff3300ff6600ff9900ffcc00ffff3300003300333300663300993300cc3300ff332b00332b33332b66332b99332bcc332bff3355003355333355663355993355cc3355ff3380003380333380663380993380cc3380ff33aa0033aa3333aa6633aa9933aacc33aaff33d50033d53333d56633d59933d5cc33d5ff33ff0033ff3333ff6633ff9933ffcc33ffff6600006600336600666600996600cc6600ff662b00662b33662b66662b99662bcc662bff6655006655336655666655996655cc6655ff6680006680336680666680996680cc6680ff66aa0066aa3366aa6666aa9966aacc66aaff66d50066d53366d56666d59966d5cc66d5ff66ff0066ff3366ff6666ff9966ffcc66ffff9900009900339900669900999900cc9900ff992b00992b33992b66992b99992bcc992bff9955009955339955669955999955cc9955ff9980009980339980669980999980cc9980ff99aa0099aa3399aa6699aa9999aacc99aaff99d50099d53399d56699d59999d5cc99d5ff99ff0099ff3399ff6699ff9999ffcc99ffffcc0000cc0033cc0066cc0099cc00cccc00ffcc2b00cc2b33cc2b66cc2b99cc2bcccc2bffcc5500cc5533cc5566cc5599cc55cccc55ffcc8000cc8033cc8066cc8099cc80cccc80ffccaa00ccaa33ccaa66ccaa99ccaaccccaaffccd500ccd533ccd566ccd599ccd5ccccd5ffccff00ccff33ccff66ccff99ccffccccffffff0000ff0033ff0066ff0099ff00ccff00ffff2b00ff2b33ff2b66ff2b99ff2bccff2bffff5500ff5533ff5566ff5599ff55ccff55ffff8000ff8033ff8066ff8099ff80ccff80ffffaa00ffaa33ffaa66ffaa99ffaaccffaaffffd500ffd533ffd566ffd599ffd5ccffd5ffffff00ffff33ffff66ffff99ffffccffffff00000000000000000000000021f904010000fc002c00000000200020000008ff00371429b2619fc183080dbe899630e140810407366c2870e1c47d103764bc887020135017230e8cc8f1601168251f1661387119ca7dd194edabb3ac24cb92758c286482b188c5921ca31154267483b29120815e7c03d10e44262f955e84080ad4c88755056e80131528c1a4a0b41601ab72a5d20d490d5a458b30ec489940d31eacda10d4929a0da325d5bb4fae5abf7db94e7c53446161b673bfb68d28f8a0d0224405421b4896aa4168102923842370099c8146b4561d29da6d91253783d68908ca944881a309323dcd59e24168b535f7150b566051a204bb46232cd0cee2b18bf77d36b87a22b4378041194f08121a5c972d3f3634155d296ecb8991275156ba6cb568b51111bb2e28f539d5b5a46317967a713893919f05d2cf4b78a5e468beed979032f715449861023a07074c7b016692562595a7547a22a5765b6d6791f6d045e51134a158247134d984230504003b'
  );
INSERT
INTO COMMUNICATION.MESSAGE
  (
    IDENTIFIER,
    CATEGORY_SYSTEM,
    CATEGORY_CODE,
    SENDER,
    RECIPIENT,
    PAYLOAD_TITLE,
    PAYLOAD_CONTENT,
    SENT,
    STATUS_SYSTEM,
    STATUS_CODE
  )
  VALUES
  (
    'identifier7',
    'http://ehmp.DNS   /messageCategories',
    'announcements-promotions',
    'eHMP',
    'sample.data',
    'Sample Deleted Promotion',
    'Sample promotion line 1.\n\nSample promotion line 2.',
    to_timestamp_tz('05-FEB-17 08.01.49.167129000 AM -05:00','DD-MON-RR HH.MI.SSXFF AM TZR'),
    'http://ehmp.DNS   /messageStatus',
    'deleted'
  );
--------------------------------------------------------
--  Sample data for Table USER_PREFERENCES
--------------------------------------------------------
INSERT
INTO "COMMUNICATION"."USER_PREFERENCES"
  (
    USER_ID,
    CATEGORY_SYSTEM,
    CATEGORY_CODE,
    ENABLED
  )
  VALUES
  (
    'sampleUser1',
    'http://ehmp.DNS   /messageCategories',
    'announcements-promotions',
    'Y'
  );
INSERT
INTO "COMMUNICATION"."USER_PREFERENCES"
  (
    USER_ID,
    CATEGORY_SYSTEM,
    CATEGORY_CODE,
    ENABLED
  )
  VALUES
  (
    'sampleUser2',
    'http://ehmp.DNS   /messageCategories',
    'announcements-promotions',
    'N'
  );

COMMIT;