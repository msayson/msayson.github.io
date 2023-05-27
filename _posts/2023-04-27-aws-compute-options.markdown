---
layout: post
title:  "Choosing between AWS compute services"
date:   2023-04-27 20:00:00 -0700
categories: aws
---

When building a new service in AWS, it can be difficult to decide between all the available compute services.  In this post I'll give a brief overview of the main options and describe how I compare and choose between them for a given project.

## Overview of AWS compute services

AWS compute services include AWS Lambda, EC2 (Elastic Cloud Compute), and Fargate, where EC2 and Fargate can both be run through container orchestration services ECS (Elastic Container Service) or EKS (Elastic Kubernetes Service).

### Lambda
Lambda provides one of the simplest ways to run code on-demand.  You can configure Lambda functions to be automatically triggered via other AWS services or events, or invoke them directly through API calls.

Lambda functions are intended for short-lived operations and have a maximum runtime of 15 minutes.

### EC2
EC2 is the underlying compute service for most other AWS services including Lambda and Fargate, and offers a broad range of instance types that support different memory, storage, and networking capacities.  You can set up long-lived servers directly with EC2, managing provisioning and infrastructure yourself, or use higher-level services like Fargate or ECS that take care of host management for you.

### Fargate
Fargate is a serverless computing environment that allows you to specify how much memory and processing power you need, provide a Docker file, and let AWS take care of host management.

Fargate has less maintenance overhead than EC2 since AWS automatically chooses instance types optimized to your resource requirements and provisions, patches, and replaces hosts as needed.

### Brief comparison of compute services

| |Lambda|EC2|Fargate|
|-|------|---|-------|
|Who manages infrastructure|AWS   |You             |AWS    |
|Tenancy options           |Shared|Shared/Dedicated|Shared |
|Maintenance overhead      |Lowest|Highest         |Low    |
|Max execution time        |15 minutes|N/A     |N/A    |
{:.table-small-bordered}

Lambda instances are simplest to use for workflows that take under 15 minutes, and both Lambda and Fargate instances are managed by AWS to provide low-maintenance options for customers.

All three compute services are by default "shared tenancy", meaning that multiple AWS customers may have their software running on virtual machines that share a physical server.  For most customers, this is a non-issue, but for highly regulated organizations that need their software running on hardware dedicated only to them, EC2 also supports "dedicated tenancy" hosts.

Quincy Mitchell wrote a good post comparing the pricing of Lambda, EC2, and Fargate across a few instance types at <https://blogs.perficient.com/2021/06/17/aws-cost-analysis-comparing-lambda-ec2-fargate/>.  The general conclusions were that:
* Lambda is less expensive than EC2 when run <= 50% of the time, and less expensive than Fargate when run <= 25% of the time.
* Fargate's flexibility for resource sizing can save money compared to EC2 if you need less resources than provided by the next larger EC2 instance type.
* EC2 is least expensive when right-sized to resource requirements and highly utilized.

### Container management services
Both EC2 and Fargate can be run via the following container management services:
* ECS (Elastic Container Service) is the simplest way to run containerized servers in AWS, with most deployment and networking details managed by AWS.
* EKS (Elastic Kubernetes Service) runs containized servers through Kubernetes, which is more complex and supports more granular configuration than ECS.

When building services entirely in AWS, I prefer ECS because of how easy it is to manage and integrate with other AWS services.  EKS may be preferable to teams that already work with Kubernetes and want to leverage specific features that ECS doesn't support.

## Comparison matrix

|                          | Lambda          | Fargate on ECS | EC2 on ECS  | EC2/Fargate on EKS  | EC2          |
|--------------------------|-----------------|----------------|-------------|----------------|-------------|
| Max execution time       | **15 minutes**  | N/A            | N/A         | N/A            | N/A          |
| Warm-up time             | **Seconds**\*   | N/A            | N/A         | N/A            | N/A          |
| Execution latency SLA    | Seconds         | 100ms range    | 100ms range | 100ms range        | 100ms range |
| Availability SLA         | 99.95%          | 99.99%         | 99.99%      | 99.95%          | 99.99%      |
| Requires OS customization | No             | No             | Yes         | Yes          | Yes            |
| Maintenance overhead     | **Low**         | **Low**        | Medium      | Medium-High  | High           |
| Automatic rollback support | Yes           | Yes            | Yes         | No           | Yes            |
| Handles sharp traffic spikes | **No****    | Yes            | Yes         | Yes          | Yes            |
{:.table-small-bordered}

For services where executions are expected to always complete in under 15 minutes, AWS Lambda is the simplest and lowest-maintenance compute service to leverage for API services.

### *Managing Lambda warm-up time
AWS Lambda can take up a few seconds to "warm up" and execute a function when no recent requests have been made, or when new workers are being provisioned to meet scaling demands.

This delay can be partially mitigated by scheduling periodic function calls ("pings") every few minutes to keep the function "warm".

You can also pay for [provisioned concurrency](https://aws.amazon.com/blogs/compute/new-for-aws-lambda-predictable-start-up-times-with-provisioned-concurrency/) to always have a minumum number of workers provisioned and ready to accept traffic.

Execution latency SLAs are influenced by the above warm-up time issues, and with periodic pings and provisioned concurrency you can expect execution latencies to be comparable to EC2/ECS.

### **Handling sharp traffic spikes
Lambda has the limitation that its auto-scaling takes a few minutes to adjust to sharp spikes in traffic beyond its base capacity of 1000 calls/second.  If your service needs to handle 50%+ traffic spikes above this threshold without throwing "Rate Exceeded" errors for a few minutes, then ECS Fargate or the other ECS/EKS options should be considered instead.

Many AWS compute services support automatic scaling policies based on factors you specify such as time period and memory usage, which you can use to automatically adjust to major traffic increases with some lag time.  However, to handle sharp traffic spikes without interim throttling errors, you need to estimate your service's maximum call rate in advance and set the minimum number of running instances in your ECS/EKS cluster or EC2 auto-scaling group to match it.

It can be expensive to maintain a large number of hosts year-round if you only have traffic surges on specific dates, so many teams track service usage over time and periodically adjust their scaling limits to align with expected seasonal/event-based traffic, with updated projections and load testing done before known peak periods.

## Recommendations

Lambda is the simplest compute service to use for short-lived operations, and is an easy choice for services that process under 1000 requests/second.  It can also handle much higher traffic scenarios, while it can take a few minutes for it to scale up to handle spark traffic spikes of over 50% when above the 1000 requests/second base capacity.  If traffic increases are generally less spiky than this, or temporary throttling is acceptable, then Lambda is still a good choice.

When Lambda is not an option due to worst-case latency or traffic expectations, Fargate on ECS offers the simplest set-up and management as a fully-managed "serverless" solution, and is my go-to alternative.

I would only suggest using EC2 (stand-alone or on ECS) when there is a specific need for EC2's additional OS or runtime environment configurations, since it otherwise adds unnecessary maintenance overhead.

## References

* AWS blog post on ECS vs EKS: <https://aws.amazon.com/blogs/containers/amazon-ecs-vs-amazon-eks-making-sense-of-aws-container-services>
* AWS blog post on Lambda provisioned concurrency: <https://aws.amazon.com/blogs/compute/new-for-aws-lambda-predictable-start-up-times-with-provisioned-concurrency>
* ECS documentation: <https://docs.aws.amazon.com/ecs>
* EKS documentation: <https://docs.aws.amazon.com/eks>
* Fargate documentation: <https://docs.aws.amazon.com/AmazonECS/latest/userguide/what-is-fargate.html>
* Lambda documentation: <https://docs.aws.amazon.com/lambda>
* Lambda scaling: <https://aws.amazon.com/blogs/compute/understanding-aws-lambda-scaling-and-throughput>
* Quincy Mitchell cost comparison of Lambda, EC2, and Fargate: <https://blogs.perficient.com/2021/06/17/aws-cost-analysis-comparing-lambda-ec2-fargate/>
