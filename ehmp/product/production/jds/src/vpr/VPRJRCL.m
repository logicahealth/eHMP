VPRJRCL ;SLC/KCM -- Control the HTTP listener
 ;
GO(PORT) ; start up REST listeners
 I $G(PORT) D
 . D SPORT(PORT)
 E  D
 . S PORT=$G(^VPRHTTP(0,"port"),PORT)
 . D SPORT(PORT)
 I '$D(^VPRMETA) D SETUP^VPRJPMD             ; make sure meta data is in place
 J START^VPRJREQ(PORT)       ; start the listener
 QUIT
 ;
STOP ; tell the listener to stop running
 N NUM
 S NUM=""
 F  S NUM=$O(^VPRHTTP(NUM)) Q:NUM'=+NUM  D
 . I $D(^VPRHTTP(NUM,"listener"))#2,$E(^VPRHTTP(NUM,"listener"),1,4)'="stop" S ^VPRHTTP(NUM,"listener")="stopping"
 QUIT
 ;
STOPW ; tell the listeners to stop running and wait until they stop
 ; this function is interactive
 N I,LISTENER,CHILD,NUM
 W !,"Stopping HTTP listeners on ports "
 S NUM=0 ; ports are no longer on 0 node, so start one later
 F  S NUM=$O(^VPRHTTP(NUM)) Q:NUM'=+NUM  W ^VPRHTTP(NUM,"port")_" "
 W "."
 D STOP
 S CHILD=0
 F I=1:1:30 D  Q:((LISTENER="stopped")&('CHILD))
 . S NUM="",LISTENER="stopped"
 . F  S NUM=$O(^VPRHTTP(NUM)) Q:(NUM'=+NUM)!(LISTENER'="stopped")  D
 . . I $D(^VPRHTTP(NUM,"listener"))#2 S LISTENER=$G(^VPRHTTP(NUM,"listener"))
 . I LISTENER="stopped" D  Q
 . . N STATUS,JOB
 . . W " ."
 . . F I=1:1:30 S STATUS=$D(^VPRHTTP(0,"child"))  S:STATUS=0 CHILD=0 Q:STATUS=0  D
 . . . S CHILD=1
 . . . S JOB=0 F  S JOB=$O(^VPRHTTP(0,"child",JOB)) Q:JOB=""  I $D(^$J(JOB))=0 K:$D(^VPRHTTP(0,"child",JOB)) ^VPRHTTP(0,"child",JOB)
 . . . W "."
 . . . H 1
 . W "."
 . H 1
 I LISTENER="stopped",'CHILD W "stopped.",!
 E  W "failed to stop.",!
 QUIT
 ;
SPORT(PORT) ; set a port that should be listened on
 Q:'$G(PORT)
 ;
 N I,NUM,FLG
 S NUM="",FLG=0
 L +^VPRHTTP(PORT)
 S ^VPRHTTP(PORT,"port")=PORT
 L -^VPRHTTP(PORT)
 ;
 QUIT
 ;
RPORT(PORT) ; remove a port that is being listened on
 Q:'$G(PORT)
 ;
 N NUM
 S NUM=""
 L +^VPRHTTP(PORT)
 F  S NUM=$O(^VPRHTTP(NUM)) Q:NUM'=+NUM  D
 . I $D(^VPRHTTP(NUM,"port"))#2,^VPRHTTP(NUM,"port")=PORT K:$D(^VPRHTTP(NUM,"port")) ^VPRHTTP(NUM,"port") K:$D(^VPRHTTP(NUM,"listener")) ^VPRHTTP(NUM,"listener")
 L -^VPRHTTP(PORT)
 ;
 QUIT
 ;
SLOG(LEVEL) ; set log level -  0:errors,1:headers&errors,2:raw,3:body&response
 ; ** called from VPRJREQ -- cannot be interactive **
 K:$D(^VPRHTTP(0,"logging","path")) ^VPRHTTP(0,"logging","path")
 S ^VPRHTTP(0,"logging")=$G(LEVEL,0)
 S ^VPRHTTP(0,"logging","start")=$S(LEVEL>0:$H,1:"")
 Q
CLEAR ; clear the logs
 K:$D(^VPRHTTP("log")) ^VPRHTTP("log")
 Q
LOG() ; return the current logging level
 Q $G(^VPRHTTP(0,"logging"),0)
 ;
PORT() ; return the HTTP port numbers
 N NUM,PORTS
 S NUM="",PORTS=""
 F  S NUM=$O(^VPRHTTP(NUM)) Q:NUM'=+NUM  I $D(^VPRHTTP(NUM,"port"))#2 S PORTS=PORTS_" "_^VPRHTTP(NUM,"port")
 S $E(PORTS)=""
 QUIT PORTS
 ;
STATUS() ; Return status of the HTTP listener
 ;Simple Exchange (happy path)
 ;GET /ping HTTP/1.1
 ;Host: JDSlocalhost
 ;
 ;HTTP/1.1 200 OK
 ;Content-Length: 20
 ;Content-Type: application/json
 ;Date: Wed, 15 Aug 2012 21:10:09 GMT
 ;
 ;{"status":"running"}
 ;
 N HTTPLOG,HTTPREQ,PORT,X,NUM,STATUS
 S (NUM,X)="",STATUS=""
 F  S NUM=$O(^VPRHTTP(NUM)) Q:NUM'=+NUM  I $D(^VPRHTTP(NUM,"listener"))#2 D
 . S HTTPLOG=0,PORT=^VPRHTTP(NUM,"port")
 . O "|TCP|2":("127.0.0.1":PORT:"CT"):2 E  S STATUS=STATUS_"Port "_PORT_" not responding, " Q
 . U "|TCP|2"
 . W "GET /ping HTTP/1.1"_$C(10,13)_"Host: JDSlocalhost"_$C(10,13,10,13),!
 . F  S X=$$RDCRLF^VPRJREQ() Q:'$L(X)  D ADDHEAD^VPRJREQ(X)
 . U "|TCP|2":(::"S")
 . I $G(HTTPREQ("header","content-length"))>0 D RDLEN^VPRJREQ(HTTPREQ("header","content-length"),2)
 . C "|TCP|2"
 . S X=$P($G(HTTPREQ("body",1)),"""",4)
 . S STATUS=STATUS_"Port "_PORT_" "_X_", "
 . I '$L(X) S STATUS=STATUS_"Port "_PORT_" unknown, "
 S STATUS=$RE(STATUS),$E(STATUS,1,2)="",STATUS=$RE(STATUS)
 QUIT STATUS
