---
layout: post
title: "Reducing Lambda latency by 76% with AWS Lambda Power Tuning"
date: 2024-07-14 00:00:00 +0000
categories: aws
excerpt: "<p>Optimizing AWS Lambda memory capacity can decrease customer-facing latencies by up to 2-5 times without significantly increasing hardware costs, but can take some trial and error.</p><p>The AWS Lambda Power Tuning tool can be used to determine the optimal memory capacity for any Lambda function within minutes, and can be set up in a few button clicks.</p>"
featuredImage: /images/20240714_AWSLambdaPowerTuningResults.png
---

## Introduction

Optimizing AWS Lambda memory capacity can decrease customer-facing latencies by up to 2-5 times without significantly increasing hardware costs.  However, this takes trial and error, and many teams just pick an amount of memory and stick with it, leaving their services several times slower than necessary.

Other teams spend hours setting up custom code and metrics to measure latencies for each of their service's use cases, benchmark each use case against various memory capacities, and use the AWS Cost Estimator or AWS Lambda pricing documentation to estimate costs and choose the amount of memory with the best latency-to-cost tradeoff.

This is no longer necessary with the AWS Lambda Power Tuning tool, which can be run against any Lambda function in your AWS account to automatically determine the optimal memory capacity that minimizes execution latency and/or hardware costs.

There is no cost to deploy and run this besides its underlying hardware costs, which is likely free if you only run it a few times before deleting it from your account.

Since it only relies on AWS-infrastructure-level API calls, the tool works regardless of which programming language your Lambda function uses, and doesn't require any modifications to your service infrastructure or code.

## Set up

The AWS Lambda Power Tuning [GitHub repo](https://github.com/alexcasalboni/aws-lambda-power-tuning) documents multiple ways to deploy the tool, using either the AWS Serverless Application Repository (simplest), AWS SAM CLI, AWS CDK, or Terraform.

I used the AWS Serverless Application Repository since this reduces set-up to a few button clicks, and I planned to tear down the tool after optimizing my Lambda function.

To use this deployment option, you can simply log into your AWS account, visit [https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:451282441545:applications~aws-lambda-power-tuning](https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:451282441545:applications~aws-lambda-power-tuning), and click Deploy.

![alt text](/images/20240714_AWSLambdaPowerTuning_AWSServerlessRepoAppPage.png "AWS Serverless Repo application page for the AWS Lambda Power Tuning tool")

This will create an AWS Lambda Application that encapsulates all the infrastructure for the tuning tool, including the AWS Step Functions State Machine that you'll invoke to run the benchmark tests.

![alt text](/images/20240714_AWSLambdaPowerTuning_AppResources.png "AWS Lambda Power Tuning application resources")

Click on the `powerTuningStateMachine` resource to open the state machine, and click `Start Execution`, then enter the JSON payload to run the benchmark test with, where input parameters are documented on the tool's [GitHub README](https://github.com/alexcasalboni/aws-lambda-power-tuning).

For example, the following payload runs the tool against the given Lambda function, with 15 executions each for 512, 1024, 1536, 2048, and 3008 MB of memory, with a function payload specific to my API service, and the `balanced` optimization strategy.

```json
{
  "lambdaARN": "arn:aws:lambda:us-west-2:123456789012:function:TestLambdaFunctionName",
  "powerValues": [
    512,
    1024,
    1536,
    2048,
    3008
  ],
  "num": 15,
  "payload": {
    "resource": "/v1/consent-management/services/{serviceId}/users/{userId}/consents",
    "path": "/v1/consent-management/services/TestServiceId/users/TestUserId/consents",
    "httpMethod": "GET",
    "pathParameters": {
      "serviceId": "TestServiceId",
      "userId": "TestUserId"
    },
    "requestContext": {
      "resourceId": "1abc2d",
      "resourcePath": "/v1/consent-management/services/{serviceId}/users/{userId}/consents",
      "operationName": "ListServiceUserConsent",
      "httpMethod": "GET",
      "path": "/v1/consent-management/services/{serviceId}/users/{userId}/consents",
      "accountId": "123456789012",
      "protocol": "HTTP/1.1",
      "stage": "test"
    }
  },
  "parallelInvocation": false,
  "strategy": "balanced"
}
```

I set `parallelInvocation` to false after observing Lambda throttling errors with it set to true, since my test Lambda isn't currently provisioned for high load, and `strategy` to `balanced` to equality weight minimizing latency and minimizing costs, while you can configure the tool to only consider one or use a different weighted average.

## Analyzing results

Once the execution completes, the `Execution input and output` tab will display the recommended amount of memory as the `power` value, the resulting average latency in milliseconds and cost per execution, and the URL to a more detailed visualization.

![alt text](/images/20240714_AWSLambdaPowerTuning_ExecutionOutput.png "AWS Lambda Power Tuning execution output")

By navigating to that URL, we can view a graph of average latency and execution costs for each amount of memory measured, along with summarized best and worst memories for latency and cost.

![alt text](/images/20240714_AWSLambdaPowerTuningResults.png "AWS Lambda Power Tuning results visualization")

In this case, for my Lambda function, which is written in Java and queries a DynamoDB table, 2048 MB of memory resulted in the lowest average latency, while 1024 MB of memory had the lowest runtime costs.

We can see that 512 MB actually costs more than 1024 MB, and this is due to the duration being several times higher which results in higher GB-second charges.

This was only run for 15 iterations per memory allocation, so I increased the sample size and reran against 1024, 1536, and 2048 MB by setting powerValues and num to `"powerValues": [1024, 1536, 2048], "num": 50`.

I executed the Lambda function a couple times first with a test payload to eliminate cold starts as a compounding factor, and then ran the state machine with the new config, which resulted in the following output and visualization:

```json
{
  "power": 1536,
  "cost": 3.2760000000000005e-7,
  "duration": 12.266666666666667,
  "stateMachine": {
    "executionCost": 0.00023,
    "lambdaCost": 0.00012891480000000002,
    "visualization": "https://lambda-power-tuning.show/#AAQABgAI;3t2NQUREREFERExB;ilmiNADhrzRWgeo0"
  }
}
```

The more detailed visualization indicates that for our particular use case, we're unlikely to see significant performance improvements from increasing memory above 1536 MB, and the marginal cost increase from 1024 MB to 1536 MB is acceptable for us.

![alt text](/images/20240714_AWSLambdaPowerTuningResultsRun2.png "AWS Lambda Power Tuning results visualization for second run")

You can see a more detailed table view of the underlying data by going to the step function execution's `Detail` tab, selecting the `Table` view, selecting the `Analyzer` task, and selecting the Analyzer panel's `Output` tab.

![alt text](/images/20240714_AWSLambdaPowerTuningResultsAnalyzerDetails.png "AWS Lambda Power Tuning results table view for second run")

## Tear-down

When you no longer need the tool, you can open the AWS CloudFormation console and delete the `serverlessrepo-aws-lambda-power-tuning` CloudFormation stack.

## Outcome

The tool took under 10 minutes to deploy, execute, and fine-tune, and resulted in me changing my test Lambda's memory allocation from 512 MB to 1536 MB.

This lowered my API's average latency from 50ms to 12ms, a 4.17x improvement, AKA 76% latency reduction.  Duration costs increased by 8% to $0.3276/million executions, which is minimal for my service's scale.

Given the latency improvements of choosing the right amount of memory, and how easy this tool is to use, I'd recommend it to anyone building services on AWS Lambda.

## References

AWS Lambda docs introducing AWS Lambda Power Tuning: [https://docs.aws.amazon.com/lambda/latest/operatorguide/profile-functions.html](https://docs.aws.amazon.com/lambda/latest/operatorguide/profile-functions.html)

AWS Lambda Power Tuning GitHub repository with usage details: [https://github.com/alexcasalboni/aws-lambda-power-tuning](https://github.com/alexcasalboni/aws-lambda-power-tuning)

AWS Lambda pricing: [https://aws.amazon.com/lambda/pricing/](https://aws.amazon.com/lambda/pricing/)
