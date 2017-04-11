package us.vistacore.ehmp.webapi;

import com.google.gson.JsonElement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.ehmp.command.StatusCommand;
import us.vistacore.ehmp.config.JdsConfiguration;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.Response;
import java.io.IOException;


/**
 * This {@link Filter} class checks that the operational sync is complete before attempting actions in eHMP. Triggering
 * a sync or fetching data from eHMP before operational data is synchronized is likely to cause errors and put the
 * system in a non-functioning state. Operational data is automatically synchronized when the eHMP is started, but
 * may take several minutes to complete.
 */
public class OperationalSyncCheckFilter implements Filter {

    private JdsConfiguration jdsConfiguration;
    private boolean isSynced = false;

    private static Logger logger = LoggerFactory.getLogger(OperationalSyncCheckFilter.class);

    public OperationalSyncCheckFilter(JdsConfiguration jdsConfiguration) {
        this.jdsConfiguration = jdsConfiguration;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        if (isSynced) {
            chain.doFilter(request, response);
        } else {
            JsonElement status = new StatusCommand(this.jdsConfiguration, StatusCommand.JdsStatusType.OPERATIONAL).execute();
            if (!StatusCommand.isOperationalSyncComplete(status)) {
                HttpServletRequest httpRequest = (HttpServletRequest) request;
                String message = "Request to " + httpRequest.getRequestURI() + " before operational sync is complete.";
                logger.warn(message);
                httpResponse.sendError(Response.Status.SERVICE_UNAVAILABLE.getStatusCode(), message);
            } else {
                isSynced = true;
                chain.doFilter(request, response);
            }
        }
    }

    @Override
    public void destroy() {

    }
}
