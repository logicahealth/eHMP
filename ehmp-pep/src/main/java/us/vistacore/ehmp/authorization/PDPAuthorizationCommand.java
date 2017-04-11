package us.vistacore.ehmp.authorization;

import com.axiomatics.sdk.connections.PDPConnection;
import com.axiomatics.sdk.connections.PDPConnectionException;
import com.axiomatics.xacml.reqresp.Request;
import com.axiomatics.xacml.reqresp.Result;
import com.google.common.base.Stopwatch;
import com.netflix.hystrix.HystrixCommand;
import com.netflix.hystrix.HystrixCommandGroupKey;
import com.netflix.hystrix.HystrixCommandKey;
import com.netflix.hystrix.HystrixCommandProperties;
import com.netflix.hystrix.HystrixThreadPoolKey;
import com.netflix.hystrix.HystrixThreadPoolProperties;
import com.netflix.hystrix.exception.HystrixBadRequestException;

import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.TimeUnit;

public class PDPAuthorizationCommand extends HystrixCommand<Result> {

    private static Logger logger = LoggerFactory.getLogger(PDPAuthorizationCommand.class);

    /**
     * Hystrix group and command key used for statistics, circuit-breaker, properties, etc.
     */
    public static final HystrixCommandGroupKey GROUP_KEY = HystrixCommandGroupKey.Factory.asKey("pep");
    public static final HystrixCommandKey COMMAND_KEY = HystrixCommandKey.Factory.asKey("authorization");
    public static final HystrixThreadPoolKey THREAD_KEY = HystrixThreadPoolKey.Factory.asKey("pep-pool");

    private static final int TIMEOUT_MS = 60 * 1000;
    private static final int MAX_THREADS = 10;

    private final PDPConnection pdpConn;
    private final Request request;

    public PDPAuthorizationCommand(PDPConnection pdpConn, Request request) {
        // instantiate Command and properties
        super(Setter.withGroupKey(GROUP_KEY)
                .andCommandKey(COMMAND_KEY)
                .andThreadPoolKey(THREAD_KEY)
                .andThreadPoolPropertiesDefaults(HystrixThreadPoolProperties.Setter().withCoreSize(MAX_THREADS))
                .andCommandPropertiesDefaults(
                        HystrixCommandProperties.Setter()
                                .withCircuitBreakerEnabled(false)
                                .withFallbackEnabled(false)
                                .withRequestCacheEnabled(true)
                                .withRequestLogEnabled(false)
                                .withExecutionIsolationThreadTimeoutInMilliseconds(TIMEOUT_MS)
                                .withExecutionIsolationStrategy(HystrixCommandProperties.ExecutionIsolationStrategy.THREAD)
                ));

        // Validation
        Validate.notNull(pdpConn, "pdpConn cannot be null.");
        Validate.notNull(request, "request cannot be null.");

        this.pdpConn = pdpConn;
        this.request = request;
    }

    @Override
    protected Result run() {
        Stopwatch stopwatch = Stopwatch.createStarted();
        logger.info("TIME ELAPSED BEFORE PDP EVALUATE = " + stopwatch.elapsed(TimeUnit.MILLISECONDS));
        try {
            return pdpConn.evaluate(request);
        } catch (PDPConnectionException e) {
            String errorMessage = "Error evaluating XACML Request";
            logger.warn(errorMessage, e);
            throw new HystrixBadRequestException(errorMessage, e);
        } finally {
            logger.info("TIME ELAPSED AFTER PDP EVALUATE =  " + stopwatch.elapsed(TimeUnit.MILLISECONDS));
        }
    }
    
}
