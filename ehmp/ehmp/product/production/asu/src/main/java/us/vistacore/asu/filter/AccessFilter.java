package us.vistacore.asu.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@Order(2)
public class AccessFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(AccessFilter.class);

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        long begin = System.currentTimeMillis();
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        String remoteHost = request.getRemoteHost();
        String requestLine = getRequestLine(httpServletRequest);
        logger.debug("Request received from {}: {}", remoteHost, requestLine);
        try {
            chain.doFilter(request, response);
        } finally {
            HttpServletResponse httpServletResponse = (HttpServletResponse) response;
            long end = System.currentTimeMillis();
            long elapsed = end - begin;
            int statusCode = httpServletResponse.getStatus();
            logger.info("{} {} {} {}ms", remoteHost, requestLine, statusCode, elapsed);
        }
    }

    @Override
    public void destroy() {
    }

    private String getRequestLine(HttpServletRequest request) {
        String method = request.getMethod();
        String requestURI = request.getRequestURI();
        String protocol = request.getProtocol();
        String queryString = request.getQueryString();
        if (queryString == null) {
            return String.format("%s %s %s", method, requestURI, protocol);
        }
        return String.format("%s %s?%s %s", method, requestURI, queryString, protocol);

    }
}
