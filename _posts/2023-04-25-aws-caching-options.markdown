---
layout: post
title:  "AWS caching options"
date:   2023-04-25 20:00:00 -0700
categories: aws
---

Caching is a technique used to store frequently accessed data for fast retrieval, reducing the load on backend services and improving application performance.  AWS provides several caching options that can be used at different layers of the infrastructure stack.

### Caching best practices
Before integrating a cache, it’s important to evaluate use cases that would benefit from caching.  Here are some caching best practices to keep in mind:
* Caching is most helpful for data that is frequently accessed and slow to retrieve
* A cache should not be used if responses need to be strongly consistent with the backend
* Use cache expiry times appropriate to the use case
* Handle cache misses gracefully
* Avoid cache stampedes by using locks or random delays

### CloudFront
Content Delivery Networks (CDNs) are perfect for static data that is frequently accessed across users and doesn’t change based on the request, such as multimedia assets, scripts, and other global files. CloudFront is an AWS-managed CDN that has a large global network of endpoints to allow low-latency calls regardless of customer location.

Key features:
* Low-latency data transfers worldwide
* Integrations with other AWS services

*Example use case*: Video streaming services (YouTube, Netflix, etc) will almost always want to leverage a CDN with endpoints in multiple regions, since this scenario often involves large volumes of concurrent reads to common data and customers are hyper-sensitive to latency.

### API Gateway cache
AWS API Gateway’s REST APIs have built-in cache support that can be enabled for specific API methods at the infrastructure level.  This is one of the simplest ways to set up caching if you have API GET methods that are frequently called with the same parameters.

When an API method has a high rate of cache hits, caching at this level allows you to absorb increased traffic with minimal load to your backend services, reducing data transfer and hardware costs.

Key features:
* Built-in cache support
* No code changes required

*Example use case*: You plan on using API Gateway for your service, and one of your API methods has a limited set of expected incoming request values and is frequently called by other services.  Enabling API Gateway’s cache for this method will reduce the worst case load to your backend to N calls per cache timeout period, given N unique request values.
* I’ve used API Gateway’s cache for this exact use case to allow APIs to handle millions of calls per day at minimal cost, without requiring backend changes.

### Custom cache
Regardless of which AWS services you use, you can always write server-side code that manually accesses a custom cache.

Using a local cache on the host running the service is simple but has availability issues if you need to reboot or replace the host, and consistency issues if you run concurrent servers with independent caches.  You can avoid these issues by running an independently hosted cache service that all API workers call, which you can either run yourself or through AWS.

*Example use case*: You have your own cache solution that you prefer over AWS cache services, and your cache use cases are not satisfied by API Gateway or DynamoDB.

### ElastiCache
ElastiCache is useful when you need a hosted general-purpose cache that can be queried by concurrent compute instances, and API Gateway and DynamoDB Accelerator don’t meet your caching needs.  You can choose to leverage either Redis or Memcached as the backend implementation for your ElastiCache instances.

This requires maintaining additional AWS infrastructure and making code changes to wrap your data access code with logic to read from and write to the cache service.

Key features:
* Flexible use cases independent of backend implementation

*Example use case*: A method that is invoked across your service many times per minute involves an expensive SQL query that is always run with the same parameters, where it’s acceptable for the results to be 15-30 minutes out of date.  By leveraging ElastiCache with a 15-minute time-to-live value, you can make this query nearly instant across all servers and clients for all except for one call per 15 minute time period.  Note: If you have a fixed set of global queries that are important to optimize for all users, you can remove the worst-case runtime from end customers by setting up a periodic job that updates the data in the cache more frequently than the time-to-live period.

### DynamoDB Accelerator (DAX)
DynamoDB Accelerator is specific to DynamoDB databases, and can be easily set up in your AWS account and leveraged in code by swapping out the client you use to query DynamoDB.

Key features:
* Automatic caching of DynamoDB read operations that use the DAX code client
* Minimal code changes required

*Example use case*: Your application has a few specific DynamoDB queries that take longer to complete than is acceptable to end users.  By enabling DAX and configuring those use cases to use the DAX code client rather than the DynamoDB code client, you can automatically cache the query results so that the majority of users experience nearly instant responses.

### Comparison of AWS caching services

|            |CloudFront|API Gateway cache|ElastiCache|DAX|
|------------|----------|-----------------|-----------|---|
|Use case|Static resources|API responses|General-purpose|DynamoDB query responses|
|Cache layer|CDN|API Gateway|Compute code|Database|
|Layer accessing cache|Server or client code|API Gateway|Server code|Server code|
|Infrastructure set-up & maintenance|Medium|Low|High|Low|
|Code changes|Medium|N/A|High|Low|
{:.table-styled}

API Gateway caching is simplest to set-up and maintain, followed closely by DAX.  I'd recommend considering these over more complex caching solutions when they fit your use case.

DAX and ElastiCache are comparable in price with the difference depending on the configuration options chosen for ElastiCache, and DAX is much simpler to integrate with, so DAX would be my recommendation if all of your cache use cases are specific to DynamoDB queries.

ElastiCache has the most overhead and most flexibility as AWS' general-purpose cache service.

CloudFront addresses a somewhat different use as a CDN, and is appropriate to use whenever you want to optimize access of static resources across regions.

### Summary
AWS provides several ways to cache data depending on your use case and infrastructure requirements.  In many cases, you don’t need to invent the wheel and can use a fully-managed solution that does not require significant code changes.

By caching at the appropriate layer, you can optimize latencies while minimizing unnecessary load to your backend services, allowing you to scale at a reasonable cost.

### References
* [CloudFront documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
* [API Gateway caching documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html)
* [ElastiCache documentation](https://docs.aws.amazon.com/elasticache/)
* [DynamoDB Accelerator documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html)
