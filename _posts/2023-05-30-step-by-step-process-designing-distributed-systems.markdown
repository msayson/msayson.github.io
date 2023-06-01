---
layout: post
title:  "Process for designing distributed systems"
date:   2023-05-30 20:00:00 -0700
categories: distributed systems, system design
---

In this post I'll step through my process for designing distributed systems, with example questions and artifacts associated with each step.

## Step by step process

### 1. Validate whether this service needs to exist
Before building any complex system, we should ensure there's a compelling project motivation.  If we can't identify an underlying customer problem and how this service will address it, we should pause to make sure we're working on the right thing.

Example questions:
* What specific problem or customer need are we trying to address?
* How will the customer need be addressed by this service?
* What will the end state be after this is completed?
* Why are existing solutions not sufficient?

A few hours of research to check what aspects of the problem could be solved by existing services may save both money and months of engineering hours.  If we can leverage existing solutions, we should make sure they are well supported and well documented.

If we have a compelling justification for the service after answering the above questions, we'll continue with the design work, otherwise this may be an indication we should put the project aside to focus on more impactful work.

Artifacts of this step:
* Project justification including problem statement and brief summary of how the service will solve that problem in a way that isn't satisfied by existing solutions.

### 2. Clarify business requirements
Before making design decisions, it helps to take the time to understand the business use cases and identify what needs to be supported in the first release, and what major features are anticipated in the near future.  This way we can make appropriate choices that keep our system as simple as possible while making it easy to extend to future needs.

Example questions:
* What are the different user personas our system needs to support?  Are they internal employees or external customers, human or programmatic?
* What latency needs to be supported for each use case?  Some APIs may need to be in the 100ms range, others may not be latency-sensitive.
* What level of availability is required for this service?  Some services are only used during business hours, while others are critical to keep running 24/7 with severe consequences for even an hour of downtime a year.
* What are the security requirements for this service?  Eg. Who should be allowed to access different APIs, and are there authorization requirements for who can access what data?  Is it acceptable for anyone on the Internet to be able to query the service, or does it need to be restricted to only allow-listed services/users?  What data needs to be encrypted in transit and at rest?  Do we need to protect against malicious users?

Artifacts of this step:
* Requirements document including service-level business requirements, specific use cases that must be supported, latency requirements for each use case, and security requirements.

We should identify stakeholders who should have a say in how the service works, and get their feedback so we can drive alignment and make required changes early in the design process while major changes are less costly.

### 3. Estimate scale
The scale of data and traffic make a big difference on the architecture needed to support it.  Services that only receive a few dozen requests at a time can be very simple, but as we scale up to millions of concurrent requests, we have very different needs around load balancing, host scaling, caching, and data management.

Example questions:
* How many users of each type do we expect to have, and how will be active at a given time?
* How much data do we expect our system to have, and how quickly will it grow over time?
* What frequency of read vs write operations do we expect on different types of data?
* What network bandwidth will we need to support the anticipated traffic?

Artifacts of this step:
* Summary of expected scale of total/active users, data, and network traffic.
* Summary of expected transactions per second (TPS) per user operation.

### 4. Define system interfaces and data models
In this step we define how callers will interact with our service, which will typically be through API interfaces.

Example questions:
* How can we translate our business use cases into API interfaces that are simple, decoupled from implementation (so we can iterate on our backend design and data models without impacting customers), and future-proof when considering expected new features?
* How can we name and structure our API interfaces to be self-explanatory when accompanied by API documentation, to third parties who have no knowledge of how our internal systems work?
* How can we organize our interfaces around resources and HTTP methods?  Following REST API conventions will make it easier for third parties to integrate.

Artifacts of this step:
* Draft API spec including method names, request structures, and response structures.

Once we've defined our API spec, we can validate it with stakeholders and iterate until we're confident we have an interface that will meet user requirements and be easily extended to future use cases.

### 5. Define data flow and storage
While still treating system internals as a black box, we can define how data will flow in and out of our system and be stored.

Example questions:
* Who will we consume data from and how?
* Who will consume data from our service and how?
* What data does our service need to store, and what data structures will best support our use cases?
* What is the end-to-end lifecycle for data entering our system, for each type of data we store or process?

Artifacts of this step:
* Description of how data flows from upstream services/users, to our service, to downstream services/users.
* Description of data models we will store and process.

This step may be done in parallel with defining API interfaces, and we'll similarly want to validate the data workflows with stakeholders, including data producers and consumers, to ensure our contract makes sense before designing a system that doesn't match reality.

### 6. Define high-level system components
Now that we've aligned on our use cases, system interface, data models, and inter-service data flows, we can build a picture of the high-level components of our system and how they'll interact.

Example questions:
* What logical components make sense for dividing responsibilities?  How will data flow between them?
* Should client calls go through a load balancer pointing to multiple backend servers, or will a single server suffice for our scaling and reliability needs?
* Do we need to implement new data stores, and if so, which components will be retrieving or writing data to them?
* Do we have static content that should be separated from our other client/service interactions, for example, with clients querying a Content Delivery Network backed by a distributed file service?

Artifacts of this step:
* A simple diagram of labelled blocks representing logical components such as load balancers, computational microservices, and data stores, with arrows pointing in the direction of data flow.
* Workflow diagrams corresponding to business use cases.

This provides the baseline for designing each logical component and choosing technologies to use in the next step.

### 7. Design individual components
As we dive into the design of each logical component, we can make technology choices based on our business, security, and scaling requirements, comparing options based on how they meet our anticipated current and future needs.

If we've separated out logical components into their own microservices, we should be able to independently update and scale individual components going forward.

Our detailed system design will narrow down:
* Compute types - see [post on AWS compute options]({% post_url 2023-04-27-aws-compute-options %})
* Data store types - the data type and scale of data and access patterns will guide whether we choose a NoSQL key-value store such as DynamoDB, a document store such as S3, a traditional SQL database such as PostgreSQL on RDS, or another type of data store entirely
* Caching layers - see [post on AWS caching options]({% post_url 2023-04-25-aws-caching-options %})
* API access controls and how they will be enforced
* Replication strategies for servers and data

Authorization controls may include:
* Restricting who can access specific API methods - this can be enforced through role or resource based access policies.
* Restricting non-admin users to only access their own data - this may leverage some combination of service code, and database row-level security.

Artifacts of this step:
* A detailed system architecture diagram specifying component names, compute/database types (eg. Lambda, DynamoDB), and data flow between components.
* Workflow diagrams for each logical component.
* Summary of why each technology choice was made.

If we've done our job well, other software engineers should be able to skim the design document and have a general understanding of what needs to be built for this system to work as intended, how the system components will interact, and how upstream and downstream services and users will interact with the service.

If we've documented how we made each decision, they should also be able to understand what parts of the design will apply to future projects, and where and how they should deviate based on their use cases and scaling requirements.

## Summary
We will take the following steps to design a new service:

1. Validate whether this service needs to exist
2. Clarify business requirements
3. Estimate scale
4. Define system interfaces and data models
5. Define data flow and storage
6. Define high-level system components
7. Design individual components

The artifacts of each step can be validated with stakeholders to ensure we're on the right track before continuing.  They collectively add to a design document that can be referred to both while building the service, and afterwards to understand its inner workings.
