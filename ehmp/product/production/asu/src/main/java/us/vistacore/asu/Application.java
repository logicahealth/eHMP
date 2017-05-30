package us.vistacore.asu;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.embedded.EmbeddedServletContainerFactory;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ComponentScan
public class Application extends SpringBootServletInitializer {

    private static final String NIO_PROTOCOL = "org.apache.coyote.http11.Http11NioProtocol";

    @Value("${server.port}")
    private Integer serverPort;
    
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(Application.class);
    }

    public static void main(String[] args) {
        new Application().configure(
                new SpringApplicationBuilder(Application.class)).run(args);
    }

    // Necessary to keep the endpoints in sync between embedded and servlet-container-deployed instances
    @Bean
    public EmbeddedServletContainerFactory embeddedServletContainerFactory() {
        TomcatEmbeddedServletContainerFactory factory = new TomcatEmbeddedServletContainerFactory("/asu", serverPort);
        // Explicitly set the protocol to NIO to take advantage of persistent client connections
        factory.setProtocol(NIO_PROTOCOL);
        return factory;
    }
}
