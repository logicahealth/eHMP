package org.opencds.evaluation.service;

import java.lang.Thread.UncaughtExceptionHandler;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

class EvaluationExceptionHandler implements UncaughtExceptionHandler {
    private static final Log log = LogFactory.getLog(EvaluationExceptionHandler.class);
    
    @Override
    public void uncaughtException(Thread t, Throwable e) {
        log.error("UncaughtException in thread '" + t.getName() + "' message: " + e.getMessage());
        e.printStackTrace();
    }
}