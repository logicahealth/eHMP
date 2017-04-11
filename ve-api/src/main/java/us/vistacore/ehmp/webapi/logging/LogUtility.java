package us.vistacore.ehmp.webapi.logging;

import java.util.HashSet;
import java.util.Set;

public final class LogUtility {

    private LogUtility() { }

    public static String getRecursiveExceptionMessage(Throwable t) {
        StringBuilder sb = new StringBuilder();
        sb.append("Exception message ");
        sb.append(t.getMessage());

        Throwable cause = t.getCause();
        // Set of visited causes to prevent possibility
        // of infinite loop
        Set<Throwable> visited = new HashSet<Throwable>();
        while (cause != null) {
            if (visited.contains(cause)) {
                break;
            }
            visited.add(cause);
            sb.append("; Caused by: ");
            sb.append(cause.getMessage());
            cause = cause.getCause();
        }
        return sb.toString();
    }
}
