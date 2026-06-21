---
layout: post
title: "Deletion is not always deletion: retention exceptions and competing obligations"
date: 2026-06-20 20:30:00 -0800
categories: privacy-engineering right-to-be-forgotten
excerpt: One of the more surprising aspects of privacy engineering is how many different deletion and retention requirements can apply to the same customer data. A single deletion request may result in immediate deletion in some systems, multi-year retention in others, and event-driven retention in cases such as legal holds.
---

One of the more surprising aspects of privacy engineering is how many different deletion and retention requirements can apply to the same customer data. A single deletion request may result in immediate deletion in some systems, multi-year retention in others, and event-driven retention in cases such as legal holds.

In other words, deletion is not always deletion. While the intent of a customer's deletion request may be straightforward, legal, financial, fraud prevention, security, and operational obligations often require organizations to retain specific categories of data. Understanding when data should be deleted, when it must be retained, and how retained data must be restricted is one of the more challenging aspects of building effective deletion programs.

![Diagram illustrating differing retention use cases for same deletion request](/images/20260620_OneDeletionRequestMultipleRetentionOutcomes.svg)

For many organizations, a single deletion request can produce very different outcomes across systems depending on the purpose of processing personal data, applicable retention requirements, and the legal basis for continued processing after a deletion request.

| Use Case | Example Retention Policy | Legal Basis for Continued Processing |
|---|---|---|
| Marketing and advertising | Delete upon deletion request | None for marketing use |
| Customer accounts | Retain 30 days - 18 months after account closure | Legitimate interest (account recovery, service quality, dispute resolution) |
| Security audit logs | Retain 1-2 years after log timestamp | Legitimate interest (security); legal obligation in some jurisdictions |
| Analytical datasets | Anonymize upon deletion request | No longer personal data if anonymization is effective |
| Financial transaction records | Retain 3-7 years after account closure | Legal obligation (tax, accounting regulations) |
| Legal hold records | Retain until hold lifted | Legal obligation (litigation, regulatory investigation) |
| ML/AI training datasets | Exclude deleted/suppressed records; retrain periodically from upstream sources | Legitimate interest (model improvement), subject to data minimization |
{:.table-small-bordered .top-bottom-padded}

Additional considerations:
* Already trained ML/AI models may retain implicit knowledge about personal data subject to deletion requests.
* Deletion obligations extend to third-party data processors, and organizations must propagate deletion requests to them. However, it may be difficult or impossible to prove deletion by external vendors.
* There is rarely a clean way to wipe single records from data archives or rolling backups. A common pattern is to configure lifecycle rules to automatically delete data over an age threshold. Preventing rehydration of personal data from restored backups is a larger problem we will discuss in a future article.

## Retention does not allow unrestricted processing

Retention does not provide a blanket justification for continued use of personal data.

Even when there is a legal basis to retain records for purposes such as financial reporting or fraud prevention, other systems may be obligated to stop processing the same personal data.

This is where many deletion programs break down. Services storing personal data often share that data with other systems through APIs, data exports, and event streams. Once a deletion request has been processed, organizations need to ensure that downstream systems are not continuing to use retained data for purposes that no longer have a valid legal basis.

Organizations often address this through segregated datasets, filtered exports, or other technical controls that enforce purpose-limited access to retained personal data.

For example, financial systems may need continued access to records associated with deleted customers, while marketing and personalization systems should only have access to records of active, consenting customers.

## Deletion, suppression, and restricted processing

Depending on retention requirements and business purpose, a system may:
* Fully delete customer records;
* Remove or suppress personal identifiers while retaining underlying records for operational or analytical use;
* Restrict access to retained data based on business purpose or role; or
* Retain data in a restricted state until a defined retention period expires.

However systems implement deletion, the resulting behavior must ensure that retained personal data is not used for purposes without a valid legal basis.

For a deeper discussion of common deletion mechanisms and their technical tradeoffs, see ["Why deletion means different things in different systems"]({% post_url 2026-06-03-why-deletion-means-different-things %}).

## Defining system-specific deletion expectations

Across dozens or hundreds of interconnected systems, deletion requires consistent enforcement of retention rules, purpose limitations, and access controls - not just record removal.

In practice, this means defining, for each system:

* What data is considered in scope for deletion;
* How deletion is represented (removal, suppression, or restriction);
* What data is exempt due to retention obligations; and
* How deletion should be enforced for downstream consumers.

These definitions establish a shared contract between systems. Without them, deletion semantics are implicitly redefined by each integration path, often inconsistently, especially where data is replicated through APIs, exports, or event streams.

Once defined, these expectations allow deletion workflows to remain consistent across the ecosystem, even when the underlying implementation differs from system to system.

## Scheduling deletion after retention requirements expire

Retention rules only matter if they can be enforced over time. In practice, many systems define retention periods but lack reliable mechanisms to act when those periods end, leaving data to persist by default.

To operationalize retention, organizations need to translate policy into **explicit deletion triggers** tied to either time or business events.

Common patterns include:

* **Time-based expiry** (eg. 7 years after account closure, 18 months after ticket resolution)
* **Event-based expiry** (eg. account closure, transaction finalization, legal hold removal)
* **System lifecycle rules** that automatically purge data over a certain age

At a minimum, retention must be treated as an executable rule, not just a policy definition. Without this, retention expiration becomes unreliable and enforcement depends on ad-hoc cleanup rather than predictable system behavior.

## Demonstrating compliance

Once deletion and retention behavior is defined and implemented across systems, an equally difficult problem is proving it actually happened. In practice, many compliance gaps stem from the inability to consistently verify outcomes across distributed systems.

Demonstrating compliance requires more than a single "deletion successful" response. Different systems produce different evidence, and that evidence needs to be traceable back to the original request and retention requirement.

At a minimum, organizations typically need to maintain:

* **Request traceability**: a link between the deletion request and every system that was expected to act on it.
* **Execution evidence**: logs or records showing what action each system took (delete, suppress, restrict, or retain).
* **Retention justification**: explicit recording of why data was retained where deletion did not occur (eg. legal obligation, audit requirement, or active legal hold).
* **Expiry verification**: proof that time-based or event-based retention rules were eventually enforced.

This evidence is often distributed across APIs, data pipelines, and storage systems that were not designed with coordinated auditability in mind. As a result, compliance verification tends to rely on aggregation layers rather than individual system logs.

In more mature implementations, organizations treat deletion requests as **auditable workflows rather than point-in-time operations**. Each step — propagation, enforcement, and retention exception handling — is recorded in a way that can be reconstructed later for audit, regulatory inquiry, or internal validation.

Finally, audit trails demonstrating that systems acted on a deletion request and reported "deletion successful" do not prove that personal data is actually *absent* and removed from future processing. Proving absence is a substantially harder problem that often amounts to showing no data was found after querying for it.

Ultimately, compliance in deletion programs is less about proving that data was deleted everywhere at once, and more about demonstrating that each system behaved consistently with its defined retention and processing obligations over time.
