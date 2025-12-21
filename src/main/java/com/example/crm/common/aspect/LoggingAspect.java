package com.example.crm.common.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    @Around("execution(* com.example.crm..controller..*(..)) || execution(* com.example.crm..service..*(..))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.nanoTime();

        // Add context to MDC
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();
        MDC.put("event.action", methodName);
        MDC.put("event.module", className);

        Object proceed;
        try {
            proceed = joinPoint.proceed();
        } finally {
            long duration = System.nanoTime() - startTime;
            // ECS field for duration in nanoseconds
            MDC.put("event.duration", String.valueOf(duration));

            logger.info("Executed {}.{} in {} ns", className, methodName, duration);

            // Clean up MDC
            MDC.remove("event.action");
            MDC.remove("event.module");
            MDC.remove("event.duration");
        }
        return proceed;
    }
}
