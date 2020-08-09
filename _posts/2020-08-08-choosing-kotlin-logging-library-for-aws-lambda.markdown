---
layout: post
title:  "Choosing a logging library for Kotlin AWS Lambda functions"
date:   2020-08-08 20:00:00 -0700
categories: aws, programming-languages
excerpt: "<p>There are a lot of logging libraries to choose from when writing Kotlin AWS Lambda functions.  Since Kotlin is fully interoperable with Java, we have access to both Kotlin-based and Java-based logging libraries.</p><p>This post compares some of the major options and evaluates which are most suitable for Kotlin Lambda functions.</p>"
---

There are a lot of logging libraries to choose from when writing Kotlin AWS Lambda functions.  Since Kotlin is fully interoperable with Java, we have access to both Kotlin-based and Java-based logging libraries.

This post compares some of the major options and evaluates which are most suitable for Kotlin Lambda functions.

## Criteria for evaluating libraries

### 1. Include Lambda request IDs in log statements

The most useful logs provide contextual information that allows us to quickly look up events associated with an issue, for example, the user ID or request ID, descriptions of actions taken for a given request, and error messages along with their stack traces.

For AWS Lambda functions, every time a Lambda function is called, a unique request ID is generated that is associated with all actions within the given function execution.  By including this request ID in all log messages, we can easily search for logs associated with that request if needed.

Logging libraries that make it easy to automatically include Lambda request IDs in log statements will therefore be rated higher than other libraries that force us to put in more effort to construct the same contextual information.

### 2. Support multiple log levels

It's also helpful for logs to differentiate between informational, warning, and error statements.  Common Java logging APIs such as [SLF4J](http://www.slf4j.org/) have log levels of trace, debug, info, warn, error, and fatal, where you can usually configure the minimum level that should be logged for a given environment.  Trace and debug statements are often only enabled in test environments.

### 3. Handle multi-line log statements

Finally, when we include multiple lines of text in a log statement, they should be aggregated into a single CloudWatch log event, otherwise our service will be making unnecessary CloudWatch API calls and we'll have to dig through multiple CloudWatch events that should all really be a single log statement.

## Comparing Kotlin and Java logging libraries

1. stdout and stderr

    * System print statements are forwarded to CloudWatch logs
    * Lambda request IDs are not logged by default, we have to add request IDs ourselves -> not ideal
    * Multi-line log statements become multiple CloudWatch log events -> disqualifies this option

2. LambdaLogger via the [aws-lambda-java-core](https://github.com/aws/aws-lambda-java-libs/tree/master/aws-lambda-java-core) library

    * Lambda request IDs are included in logs
    * Simple interface, given the [Lambda Context](https://docs.aws.amazon.com/lambda/latest/dg/java-context.html), we can access `public void log(String message)` and `public void log(byte[] message)` methods through `context.getLogger()`
    * Supports combining multi-line log statements into a single CloudWatch log event

3. Log4j2 via the [aws-lambda-java-log4j2](https://github.com/aws/aws-lambda-java-libs/tree/master/aws-lambda-java-log4j2) library

    * Lambda request IDs are included in logs
    * Log4j2 provides standard log levels of trace, debug, info, warn, error, and fatal
    * Multi-line log statements are combined into a single CloudWatch log event

4. Logback via the [lambda-logging](https://github.com/symphoniacloud/lambda-monitoring/tree/master/lambda-logging) library

    * Lambda request IDs are included in logs
    * Logback provides standard log levels of trace, debug, info, warn, error, and fatal
    * Multi-line log statements are combined into a single CloudWatch log event

5. [kotlin-logging](https://github.com/MicroUtils/kotlin-logging)

    * A lightweight Kotlin-based wrapper for the SLF4J API, supports plugging in your choice of logging implementation such as Log4j2 or Logback
    * Lambda request IDs are not logged by default, we have to add request IDs ourselves -> not ideal
    * SLF4J provides standard log levels of trace, debug, info, warn, error, and fatal

Since we want Lambda request IDs to be included in logs by default, we won't use System print statements or kotlin-logging, and we'll also drop the basic LambdaLogger since we'd like to differentiate between logging levels.

aws-lambda-java-log4j2 and lambda-logging are good options that both support the SLF4J API, and make this a choice between the underlying logging implementations of Log4j2 in aws-lambda-java-log4j2 vs Logback in kotlin-logging.

Log4j2 has significantly better performance than both its earlier iteration of Log4j and Logback [[1](https://stackify.com/compare-java-logging-frameworks/), [2](https://logging.apache.org/log4j/log4j-2.2/performance.html)], and is also smaller in size than Logback, which leads me to prefer aws-lambda-java-log4j2.

## Conclusion

There are many options for logging in Kotlin AWS Lambda functions since we have access to both Kotlin and Java libraries.

aws-lambda-java-log4j2 is my preferred choice for now since it includes Lambda request IDs in logs, supports standard log levels, handles multi-line log statements, and uses an underlying logging implementation that is more performant than the one used by the other top contender.

See the [AWS documentation on Lambda function logging in Java with Log4j 2 and SLF4J](https://docs.aws.amazon.com/lambda/latest/dg/java-logging.html#java-logging-log4j2) for more details on how to use it.

## Resources

* AWS documentation for Lambda function logging in Java: [https://docs.aws.amazon.com/lambda/latest/dg/java-logging.html](https://docs.aws.amazon.com/lambda/latest/dg/java-logging.html)
* Source code for aws-lambda-java-core: [https://github.com/aws/aws-lambda-java-libs/tree/master/aws-lambda-java-core](https://github.com/aws/aws-lambda-java-libs/tree/master/aws-lambda-java-core)
* Source code for aws-lambda-java-log4j2: [https://github.com/aws/aws-lambda-java-libs/tree/master/aws-lambda-java-log4j2](https://github.com/aws/aws-lambda-java-libs/tree/master/aws-lambda-java-log4j2)
* Source code for kotlin-logging: [https://github.com/MicroUtils/kotlin-logging](https://github.com/MicroUtils/kotlin-logging)
* Source code for lambda-logging: [https://github.com/symphoniacloud/lambda-monitoring/tree/master/lambda-logging](https://github.com/symphoniacloud/lambda-monitoring/tree/master/lambda-logging)
