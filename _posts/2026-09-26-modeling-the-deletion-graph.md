---
layout: post
title: "Model a deletion graph, but don't execute it"
date: 2026-09-26 20:30:00 -0800
categories: privacy-engineering right-to-be-forgotten
excerpt: "Modeling deletion as a dependency graph sounds good in theory. In practice, enforcing that ordering quickly becomes a nightmare, but mapping the graph is still useful: it reveals fundamental problems and helps prioritize next steps for your deletion program."
---

Modeling deletion as a dependency graph sounds good in theory: identify which systems are upstream of others and determine the order in which to delete customer data.

Trying to enforce that ordering in real-world workflows quickly becomes a nightmare. It adds unnecessary complexity and creates points of failure throughout the dependency graph.

However, mapping the graph is still useful: it exposes failure modes, highlights where deletion-aware access controls are required, and helps prioritize next steps for your deletion program.

## The naive solution

Imagine a system where customer personal data flows through several services.

![Diagram illustrating flow of personal data across services](/images/20260926_WherePersonalDataFlows.svg)

Customer Accounts shares personal data with Ordering and Notifications. Ordering also passes personal data to Search and Notifications, while Analytics consumes data from Ordering, Search, and Notifications.

When a customer asks us to delete their data, what order should be followed for deletion?

We could follow the flow of data:

1. Delete the Customer Account
2. Then delete from Ordering
3. Then delete from Search and Notifications
4. Finally from Analytics after all its upstreams have deleted the customer.

It sounds reasonable, and it stops personal data from flowing back into downstream systems after they've fulfilled the deletion requests.

But there's an important assumption hiding here: **data-flow dependencies aren't deletion-order dependencies**. Sometimes they share direction; sometimes deletion must run opposite to the data flow.

Analytics consumes data from multiple upstream systems, but does it actually have to wait for all of them to finish deleting before it can start? The graph shows the relationships exist, but doesn't show which ones require ordering.

And even if we knew, enforcing the order across a live graph runs into two problems: keeping the graph accurate, and keeping one failure from blocking everything else.

## The graph is never stable

In a large organization, the graph becomes stale almost immediately. Teams add data sources and consumers, split services, and introduce caches and derived data sets. None of these changes necessarily show up in the deletion workflow.

Deprecations are particularly problematic. If a decommissioned service is still in the graph, an ordered workflow can wait indefinitely for a completion signal that will never arrive, silently blocking every downstream deletion.

Strictly ordered execution needs every one of those changes to be reflected in the graph immediately. Automation helps, but the inventory then becomes another system that must be maintained, validated, and trusted.

A map that's 90% accurate still produces a useful list of remediation work. An orchestrator that's 90% accurate can stall every request that routes through the stale 10%.

## One failure shouldn't block everything else

Suppose Customer Accounts has a deletion problem. Under the naive plan, Ordering can't start until Customer Accounts succeeds, Search can't start until Ordering succeeds, and so on.

One team's outage shouldn't block deletion for hundreds of other services.

A better model is to treat deletion as asynchronous. The request propagates to every system, and each does its own work. Some delete immediately. Others take longer, fail temporarily, and retry.

Deletion doesn't need to behave like a single distributed transaction where every system commits together. Systems should make progress independently where they safely can.

## When strict deletion ordering is actually required

Ordering is required when deleting in the wrong order would break an **invariant**: a rule the system enforces to stay consistent, such as "every order must reference an existing customer." Two patterns come up most often.

### Referential integrity

Within a single database, this is familiar: if orders reference a customer and there's no cascading delete, the orders must be removed first.

The same pattern exists across services. Suppose Ordering holds a hard reference to each customer account, and Customer Accounts refuses to delete an account while orders still reference it. Data flows from Customer Accounts to Ordering, but Ordering must delete its records before the account becomes eligible for deletion.

Represent this explicitly as an ordering constraint. Ordering deletes asynchronously, and the account becomes eligible for deletion once those references are gone.

**The ordering exists because of the invariant, not because of the data flow.**

### In-flight work

A different class of ordering constraint occurs when in-flight work requires the source state to remain available while it executes.

The required sequence might be:

1. Stop new jobs or orders
2. Complete or cancel in-flight work
3. Delete source data

Without that ordering, a queued job could execute after the source has been deleted and recreate data that was supposed to be removed, or fail because the referenced state no longer exists.

## Model the constraints, enforce them locally

A graph used for orchestration should identify the smallest set of dependencies that require deletion ordering.

In the example, customer data reaches every system, but the only real constraint may be that Ordering deletes before Customer Accounts.

![Diagram illustrating where deletion order matters](/images/20260926_WhereDeletionOrderMatters.svg)

Every edge that does impose ordering should record why: the invariant that breaks if deletion happens in the wrong order.

When strict ordering is required, enforce it as close as possible to the system that owns the invariant. That may be cascading deletes in a database, or a service that refuses to delete a parent while dependents exist.

A central orchestrator can coordinate genuine cross-system ordering constraints, but it shouldn't turn every dependency into a global workflow.

> Enforce ordering where the invariant lives. Keep everything else asynchronous.

## Prevent deleted data from coming back

Asynchronous deletion introduces race conditions, which I cover in more detail in ["Deleted and back again: mitigating unintended data resurrection"]({% post_url 2026-08-30-mitigating-personal-data-resurrection %}).

Search deletes a customer's data, but Ordering may not have processed the deletion yet, so it continues working normally and sends that data back to Search, which stores it again.

Strict ordering could help prevent this by making Search wait for Ordering. The more robust fix is to make Ordering deletion-aware. Once a customer is subject to deletion, Ordering can filter its exports and reject API requests for that customer.

> Downstream systems shouldn't have to wait for upstream systems to delete. Upstream systems should stop sending data that's subject to deletion.

That changes the question from "What order should these systems delete in?" to "What guarantees does each system need while deletion is in progress?"

## Asynchronous doesn't mean fire-and-forget

Once deletion is asynchronous, a request will be complete in some systems and pending in others. That's expected, but the program needs to distinguish deletion that's in progress and on track for its deadline from deletion that's stalled, failed, or unverified. That requires every system to report where each request stands:

1. Accepted: the system received the request
2. Processed: the system ran its deletion
3. Verified: the organization can prove deletion or de-identification

This distinction matters because a service responding "success" to a request isn't necessarily enough evidence for an audit. For privacy deletion programs, I'd consider a system verified when we have evidence that personal data is no longer operationally available, except where there are documented retention exemptions.

## Use the graph to find the work

Most privacy programs already have most of this graph through records of processing activities. What they usually lack is what deletion depends on: which flows impose ordering, where data can flow back after deletion, which retention exceptions apply to each system, and how each system proves it deleted.

For each dependency, ask:

|Question|Gap it reveals|Typical fix|
|--------|--------------|-----------|
|Does this dependency impose a deletion invariant?|Ordering constraints|Enforce locally, or model an explicit constraint|
|Can data flow after deletion begins?|Resurrection paths|Deletion-aware transfers and durable deletion state|
|Can queued or in-flight work outlive the source data?|In-flight races|Drain queues or reject stale work|
|How do we know deletion completed?|Verification gaps|Per-system accepted, processed, and verified states|
|Who owns the dependency?|Operational gaps|Assign owners; build shared tooling for common gaps|
|Is data shared with a processor or third party?|Recipient gaps|Propagate deletion requests and track confirmation|
{:.table-small-bordered .top-bottom-padded}

In summary, deletion should be asynchronous by default. Enforce ordering only where correctness requires it, as close to the invariant as possible, and make every system that receives personal data robust to deletion happening somewhere else at the same time.

Model the deletion graph. Don't execute it.

## Posts in this series

1. [Why data deletion is still an unsolved infrastructure problem]({% post_url 2026-05-30-why-data-deletion-is-still-unsolved %})
2. [Why deletion means different things in different systems]({% post_url 2026-06-03-why-deletion-means-different-things %})
3. [Gaps in data deletion verification and auditability]({% post_url 2026-06-12-gaps-in-data-deletion-verification-auditability %})
4. [Deletion is not always deletion: retention exceptions and competing obligations]({% post_url 2026-06-20-deletion-is-not-always-deletion %})
5. [Deleted and back again: mitigating unintended data resurrection]({% post_url 2026-08-30-mitigating-personal-data-resurrection %})
6. (Current post) Model a deletion graph, but don't execute it
