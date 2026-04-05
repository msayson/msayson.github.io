---
layout: post
title: "Enabling ad hoc runs of queue-based ECS services"
date: 2026-04-04 00:00:00 +0000
categories: aws
excerpt: "<p>A common ECS use case is to continually poll a queue for new events to process, with auto-scaling based on CPU or memory utilization, or the size of the queue backlog.  These services can be tricky to build reliable integration tests for, as queue backlogs may result in long delays before a new message is processed.</p><p>A simple way to enable efficient integration tests for these services is to support an optional environment variable that signals the service to immediately process the message without long-polling the queue, as if it were the content of a single SQS message body.</p>"
---

## Background

A common ECS use case is to continually poll a queue for new events to process, with auto-scaling based on CPU or memory utilization, or the size of the queue backlog.  These services can be tricky to build reliable integration tests for, as queue backlogs may result in long delays before a new message is processed.

A simple way to enable efficient integration tests for these services is to support an optional environment variable that signals the service to immediately process the message without long-polling the queue, as if it were the content of a single SQS message body.

## Example code

```java
public static void main(String[] args) {
    String jsonRequest = System.getenv("ADHOC_REQUEST");
    if (jsonRequest != null && !jsonRequest.isEmpty()) {
        // Execute the single JSON request
        executeRequestFromJson(jsonRequest);
    } else {
        // Continually poll a queue to process pending requests
        longPollQueue();
    }
}

static void executeRequestFromJson(String jsonRequest) {
    MyParsedRequest request = parseRequestFromJson(jsonRequest);
    executeRequest(request);
}

static void longPollQueue() {
    while (true) {
        Optional<MyQueueMessage> message = getMessageFromQueue();
        if (message.isPresent()) {
            MyParsedRequest request = parseRequest(message);
            executeRequest(request);
            acknowledgeSqsMessage(message);
        }
    }
}
```

## Example execution via AWS CLI

After setting variables for the AWS region and ECS cluster, service, and task definition ARNs, you can run a variation of the following to run a new ECS task immediately, without waiting for a new message to be processed in a queue that may have a large backlog of pending messages.

`YOUR_ECS_CONTAINER_NAME` should be replaced by the name field value in the task definition's `containerDefinitions`.

The ECS container overrides allow you to provide specific environment variable overrides while maintaining other existing environment variables from the ECS task definition.

```sh
networkConfig=$(aws ecs describe-services \
    --region $awsRegion \
    --cluster $ecsClusterArn \
    --services $ecsServiceArn \
    --query 'services[0].networkConfiguration' \
    --output json)
aws ecs run-task \
    --region $awsRegion \
    --cluster $ecsClusterArn \
    --task-definition $ecsTaskDefinitionArn \
    --launch-type FARGATE \
    --network-configuration $networkConfig \
    --overrides '{
        "containerOverrides": [{
            "name": "YOUR_ECS_CONTAINER_NAME",
            "environment": [{
                "name": "ADHOC_REQUEST",
                "value": "{\"yourRequestKey\":\"yourRequestValue\"}"
            }]
        }]
    }'
```

Depending on the integ test environment, you can also use the [ECS RunTask API](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_RunTask.html) in a similar way as the above CLI command.

After implementing this pattern in your service code, your integration tests can run ad hoc ECS tasks with specific test requests and validate the expected output - for example, periodically calling another API to validate a record has been successfully created or updated after a wait time, with a maximum number of retries.  Since the task processes only the injected request, tests can use a much shorter max duration than they would need if waiting for a large queue backlog to drain.
