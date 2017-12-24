load data
infile 'tmp/vista_sites.csv' "str '\n'"
replace
into table EHMP.EHMP_DIVISIONS
fields terminated by ','
OPTIONALLY ENCLOSED BY '"' AND '"'
trailing nullcols
           ( DIVISION_ID CHAR(4000),
             DIVISION_NAME CHAR(4000),
             SITE_CODE CHAR(4000)
           )