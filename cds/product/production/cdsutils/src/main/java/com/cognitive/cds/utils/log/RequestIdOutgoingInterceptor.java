package com.cognitive.cds.utils.log;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.apache.cxf.ext.logging.AbstractLoggingInterceptor;
import org.apache.cxf.ext.logging.event.DefaultLogEventMapper;
import org.apache.cxf.ext.logging.event.LogEvent;
import org.apache.cxf.ext.logging.event.LogEventSender;
import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.message.Message;
import org.apache.cxf.phase.Phase;
import org.apache.cxf.transport.http.Headers;
import org.slf4j.MDC;

public class RequestIdOutgoingInterceptor extends AbstractLoggingInterceptor {

	public RequestIdOutgoingInterceptor() {
		super(Phase.PRE_STREAM, new Slf4jIncomingEventSender());
	}
	
	public RequestIdOutgoingInterceptor(String phase, LogEventSender sender) {
		super(phase, sender);
	}

	@Override
    public void handleMessage(Message message) throws Fault {
		String requestId = MDC.get("requestId");
		Map<String,List<String>> headers = Headers.getSetProtocolHeaders(message);
		headers.put("X-Request-ID", Arrays.asList(new String[]{requestId}));
        createExchangeId(message);

        final LogEvent event = new DefaultLogEventMapper().map(message);
        sender.send(event);
    }
    
}
