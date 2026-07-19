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

For many organizations, a single deletion request can produce different outcomes across systems depending on the purpose of processing personal data, applicable retention requirements, and the legal basis for continued retention or processing.

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

## Scheduling deletion after retention requirements expire

In practice, many systems define retention periods but lack reliable mechanisms to act when those periods end, causing data to persist indefinitely by default.

To operationalize retention, organizations need to translate policy into **explicit deletion triggers** tied to either time or business events.

Common patterns include:

* **Time-based expiry** (eg. 7 years after account closure, 18 months after ticket resolution)
* **Event-based expiry** (eg. account closure, transaction finalization, legal hold removal)
* **System lifecycle rules** that automatically purge data over a certain age

At a minimum, retention must be treated as an executable rule, not just a policy definition. Without this, retention expiration becomes unreliable and enforcement depends on ad-hoc cleanup rather than predictable system behavior.

## Demonstrating compliance

Once deletion and retention behavior is defined and implemented across systems, an equally difficult problem is proving it actually happened. In practice, many compliance gaps stem from the inability to consistently verify outcomes across distributed systems.

Demonstrating compliance requires more than a single "deletion successful" response. Different systems produce different evidence, and that evidence needs to be traceable back to the original request and retention requirement. In many organizations, that evidence is generated by different teams, stored in different systems, and retained for different periods of time.

At a minimum, organizations need to maintain:

* **Request traceability**: a link between the deletion request and every system that was expected to act on it.
* **Execution evidence**: logs or records showing what action each system took (delete, suppress, restrict, or retain).
* **Retention justification**: explicit recording of why data was retained where deletion did not occur (eg. legal obligation, audit requirement, or active legal hold).
* **Expiry verification**: proof that time-based or event-based retention rules were eventually enforced.

This evidence is often distributed across APIs, data pipelines, and storage systems that were not designed with coordinated auditability in mind. As a result, compliance verification tends to rely on aggregation layers rather than individual system logs.

In more mature implementations, organizations treat deletion requests as **auditable workflows rather than point-in-time operations**. Each step — propagation, enforcement, and retention exception handling — is recorded in a way that can be reconstructed later for audit, regulatory inquiry, or internal validation.

Even when audit trails demonstrate that systems acted on a deletion request and reported success, this does not prove that personal data is absent or no longer subject to processing. Proving absence is a substantially harder problem because it requires validating that personal data cannot be found in any systems where it should have been removed, while distinguishing those systems from others where retention is justified.

Ultimately, compliance in deletion programs is less about proving that data was deleted everywhere at once, and more about demonstrating that each system behaved consistently with its defined retention and processing obligations over time.

## Posts in this series

1. [Why data deletion is still an unsolved infrastructure problem]({% post_url 2026-05-30-why-data-deletion-is-still-unsolved %})
2. [Why deletion means different things in different systems]({% post_url 2026-06-03-why-deletion-means-different-things %})
3. [Gaps in data deletion verification and auditability]({% post_url 2026-06-12-gaps-in-data-deletion-verification-auditability %})
4. (Current post) Deletion is not always deletion: retention exceptions and competing obligations
