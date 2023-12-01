---
layout: post
title:  "Concurrency all the way from single host applications up to massively distributed services"
date:   2023-11-30 20:00:00 -0700
categories: distributed-systems system-design
---

Concurrency is when multiple software threads or programs are run at the same time, and is a key aspect of many modern applications.

Web browsers run dozens of concurrent processes based on your activity, querying servers, downloading files, and executing scripts all at once.

Online services with millions of active users run a scaled up number of concurrent processes across thousands of servers, with various distributed system design patterns to support this.

This post will describe several levels of concurrency, how they're commonly applied, and pros and cons of each approach.

## Levels of concurrency
### Multi-threaded applications
Within application code, we can run multiple threads concurrently.

![alt text](/images/20231130_DistributedComputeToHandleMillionTps-MultiThreadedApp.png "Diagram of a multi-threaded application")

This approach can be locally applied regardless of whether an application is run on a single host or in a distributed service.  However, multi-threaded code increases code complexity and introduces thread safety issues, and an error in one thread may take down the entire application.

A common use case for multi-threading is when we need to make multiple requests to other services that may each take multiple seconds to complete.  We can trigger each request in a separate thread to run them concurrently, and collect the results at the end of the longest running call, rather than synchronously making one request at a time after the prior response has returned.

#### Latency trade-offs

If we have requests that each take 2 seconds, 5 seconds, 5 seconds, and 1 second to complete, each thread adds 20 milliseconds of overhead to start and close, and it takes 10 milliseconds to parse and combine results, then our overall runtime with multi-threading will be max(2, 5, 5, 1) + 0.02*4 + 0.01 = 5.09 seconds, compared to the synchronous approach taking 2+5+5+1+0.01 = 13.01 seconds to make all requests and combine the results.  In this scenario, multi-threading reduces our latency by 7.92 seconds.

Splitting tasks into threads does not come for free and may not worthwhile for very short-lived requests.  For example, if we have 1000 requests that each take 0.01 seconds to complete, with 0.01 overhead for combining results, the overhead of starting threads make the synchronous approach more efficient (`1000*0.01 + 0.01` = 10.02 seconds compared to `max(0.01) + 0.02*1000 + 0.01` = 20.02 seconds).

Multi-threading provides the most latency reduction when we're able to run multiple long-running tasks in parallel, especially multi-second tasks.

### Multi-container hosts
Within a host, we can run multiple processes or containers, which each receive allocated memory and run an isolated instance of application code.

![alt text](/images/20231130_DistributedComputeToHandleMillionTps-MultiContainerHost.png "Diagram of a multi-container host")

This allows us to fully utilize a host’s CPU and memory, while we will eventually get to a point where the host no longer has sufficient CPU or memory capacity to add more containers, or where performance begins to drop due to increased context switching and IO bottlenecks.

Splitting concurrent instances of an application into separate containers improves system reliability since regardless of individual application failures, the other containers can continue running.  However, we are still vulnerable to host-level failures.

### Multi-host clusters behind a load balancer
When we require more containers/processes than a single host can support, we can set up a load balancer that distributes traffic across multiple hosts, forming a cluster of hosts.

![alt text](/images/20231130_DistributedComputeToHandleMillionTps-MultiHostCluster.png "Diagram of a multi-host cluster")

This allows us to horizontally scale, that is, add or remove servers to our resource pool as needed.  Horizontal scaling makes our service more robust to individual host failures and enables more flexibility in our infrastructure, allowing us to swap out different types of hosts at will, and pay for just as many hosts as are needed to meet current demand.

### Multi-cluster services
When we have more traffic than a single load balancer can handle, we can set up a DNS load balancer to distribute traffic across multiple clusters.

![alt text](/images/20231130_DistributedComputeToHandleMillionTps-MultiClusterService.png "Diagram of a multi-cluster service")

This is rarely the starting point for a new service.  We only want to add this level of complexity when absolutely necessary, such as when scaling up to millions of concurrent requests, or after hitting infrastructure restrictions on load balancer concurrent connections or maximum attached endpoints.

Many cloud providers provide distributed DNS load balancers that remove the single point of failure of a traditional load balancer, scale to millions of concurrent users, and automatically route traffic to the closest regional cluster.

#### DNS load balancer trade-offs

DNS load balancers are more limited in functionality than many specialized load balancers.  For example, AWS network load balancers can support more granular access controls and security configurations, and integrate with compute services to automatically replace unhealthy hosts that fail to respond to the load balancer.

DNS also requires its connected endpoints to be accessible to the Internet, which is not always ideal.  Following the security principle of defence-in-depth, when protecting critical data or infrastructure, anything that doesn't need to be connected to the Internet, shouldn't be.  Network load balancers can be set up in protected virtual private networks to only allow access from allow-listed hosts or other trusted networks.

For these reasons, in some scenarios it will make sense to have the added complexity of both a frontend DNS load balancer to distribute traffic to the closest cluster, and backend application load balancers that provide more functionality and integration with your local infrastructure.

If you don’t need any functionality that isn’t supported by a DNS load balancer, can live with your servers being accessible from the Internet, and already manage your own health monitoring and host replacement strategy, then you can simplify your architecture by having a DNS load balancer directly route traffic to your backend servers.

## Summary
We've discussed how concurrency can be applied at multiple levels:
* Multi-threaded applications that run multiple tasks in parallel, such as querying several websites simultaneously
* Multi-container or multi-process hosts that run multiple applications in isolation from one another, so that a given application can continue running if others fail
* Multi-host clusters that enable horizontally scaling a service to process hundreds of thousands of concurrent requests
* Multi-cluster services that enable routing traffic to local load-balanced clusters that can be independently scaled, to process millions of concurrent requests

Many distributed services now start with multi-host clusters for reliability and scalability reasons, so that any given host can be replaced without impacting customer service, and additional hosts can be added as needed.

A single load balancer and backend compute cluster can often handle hundreds of thousands of concurrent requests or more, while the load balancer may become a single point of failure for your service.  Distributed DNS load balancers can help to mitigate this concern when it's acceptable for your servers to be accessible from the Internet.

For applications where you need to handle millions of concurrent requests and have business requirements not met by a single DNS load balancer, such as needing granular access control for your backend servers or integrations with other infrastructure, a DNS load balancer in front of multiple load-balanced clusters can meet these demands with the trade-off of an additional layer of complexity.

## Addendum

Before scaling your service to process millions of concurrent requests and paying hundreds of thousands of dollars to do so, make sure this is really necessary.

Would it be more efficient to extract some of your use cases to a separate microservice?

Are your hosts really doing unique work on every call?  Could some of that work be deduplicated, or could the right application of a caching layer reduce your traffic and/or average latency by orders of magnitude?

Also, note that millions of concurrent users do not always translate into millions of transactions per second.  If each user only needs to make a server request every few seconds, with multiple seconds between where they locally interact with rendered results, you may only have tens to hundreds of thousands of transactions per second, which while still high, lowers the required complexity of the system.

If you’ve already answered these questions and optimized your architecture, and have an inherent requirement to complete millions of unique transactions per second, then some of the more complex architectures may be warranted.
