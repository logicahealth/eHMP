load data
infile 'tmp/provisioned_users.csv' "str '\n'"
replace
into table EHMP.EHMP_ROUTING_USERS_TMP
fields terminated by ','
OPTIONALLY ENCLOSED BY '"' AND '"'
trailing nullcols
           ( USER_UID CHAR(4000),
             USER_IEN CHAR(4000),
             USER_SITE CHAR(4000)
           )