---
layout: post
title: "Why deletion means different things in different systems"
date: 2026-06-03 20:30:00 -0800
categories: privacy-engineering right-to-be-forgotten
excerpt: "A data deletion request may have a single intent, but the systems receiving it often implement deletion in very different ways."
---

A customer submits a data deletion request. The deletion workflow executes across dozens of systems, and every system reports success.

Yet weeks later, the customer's records still exist in a data warehouse, a search index, database backups, and a fraud investigation system.

At first glance, this looks like a deletion failure. However, every system may have behaved exactly as designed. The problem is that "delete" meant something different in each environment, and the organization may struggle to explain the discrepancy during an audit.

## Deletion is not a single operation

Privacy requirements are typically expressed as a desired outcome, such as removing personal data that should no longer be retained or processed.

Translating this into technical requirements is difficult because organizations store data across systems designed for different purposes, such as:

* Transaction processing
* Search
* Analytics and machine learning
* Logging and observability
* Archival storage

A transactional database may physically remove records or mark them as inactive to preserve referential integrity. A search index may remove documents asynchronously and update indexes over time. A data warehouse may rewrite partitions or de-identify records containing personal data. An event stream may represent deletion through tombstone events and downstream compaction.

As a result, the same deletion request can produce different outcomes across systems, depending on how each system interprets what deletion should do.

## Common deletion patterns

These outcomes typically fall into a small number of recurring deletion patterns.

**Hard deletion**: Data is physically removed from the system.

* Most aligned with intuitive expectation of deletion
* Conceptually simple
* Can introduce referential integrity or recovery challenges

**Soft deletion**: Data remains in the system but is marked as inactive or deleted.

* Common in transactional systems
* Supports recovery
* Data still physically exists

Soft deletes can become problematic if the personal data is still readily available to internal teams.

**Tombstoning**: A deletion marker replaces the original record to signal removal.

* Common in event streams and distributed databases
* Supports synchronization across eventually consistent systems
* Original data may persist until compaction processes run

**Anonymization or de-identification**: Identifiers are removed or transformed so that records can no longer be linked back to the user.

* Original identity no longer recoverable
* Data may remain useful for analytics and reporting

Organizations may use anonymization or de-identification when full deletion is not required or feasible. However, preserving analytical utility while removing all identifying information can be difficult. Re-identification risks increase when joining datasets across systems.

**Key destruction**: Encryption keys are deleted so that data can no longer be decrypted.

* Common in cloud architectures
* Encrypted data remains stored
* Access is prevented via inability to decrypt the data rather than through physical deletion

**Suppression**: Data is retained but excluded from operational processing.

* Common in marketing and advertising
* Typically implemented via fine-grained access controls

### Comparison of deletion patterns and their desired outcomes

| Deletion pattern | Original data retained? | Recoverable? | Desired outcome                             |
| ---------------- | ----------------------- | ------------ | ------------------------------------------- |
| Hard delete      | No                      | No           | Data should no longer exist                 |
| Soft delete      | Yes                     | Yes          | Data may need to be restored                |
| Tombstone        | Temporarily             | Sometimes    | Deletion must be communicated to other systems |
| Anonymization    | Partially               | No           | Identity should be removed while preserving analytical value |
| Key destruction  | Yes                     | No           | Data should become permanently inaccessible |
| Suppression      | Yes                     | Yes          | Data must be retained but not actively used |
{:.table-small-bordered}

<br>

## Why inconsistent deletion semantics create operational problems

The existence of multiple deletion models is not inherently problematic.

The problem arises when organizations assume they are equivalent.

**Example 1: Mismatched hard vs soft deletion expectation**

* Privacy team expects deletion.
* System performs soft delete.
* Downstream systems continue to process soft-deleted data due to inconsistent enforcement of deletion semantics.
* Result: Data remains accessible internally, against intended policy.

![Diagram illustrating compliance gaps from soft deletion mismatching expectation](/images/20260608_SoftDeletionComplianceGapExcalidraw.svg)

**Example 2: Suppression inconsistently applied across data use cases**

* Customer requests deletion.
* Marketing platform suppresses customer data from email campaigns.
* Personal data remains accessible to other operational systems.
* Result: Teams disagree on whether preventing their system's use of data is equivalent to deleting personal data.

**Example 3: Anonymized data re-identified in derived datasets**

* Privacy team expects customer personally identifiable information (PII) to be removed.
* Analytics platform de-identifies records rather than deleting.
* Data scientists continue querying aggregated datasets.
* Privacy reviewers discover that individuals become re-identified when datasets are joined.
* Result: Teams disagree on cross-system anonymization requirements.

**Example 4: Data reappearance via event replays**

* Source system deletes data.
* Replaying historical pipeline events rehydrates AKA recreates deleted records.
* Systems lack mechanisms to prevent or remove rehydrated data after replay.
* Result: Systems differ on whether deletion should prevent historical state from being reintroduced, resulting in an enforcement gap.

![Diagram illustrating compliance gaps from deleted data being rehydrated](/images/20260608_RestoredDeletedDataExcalidraw.svg)

Key insight: Many deletion failures are semantic mismatches rather than execution failures.

## Why this matters for automation

Organizations often want standardized workflows and automated orchestration and reporting.

However, in order for a deletion platform to answer "Did deletion succeed?", it must first answer: "What was the expected outcome for this system?"

Instead of treating deletion as a collection of service-specific scripts, organizations may need a way to declare:

* What deletion means for each system
* Which deletion model applies
* How success is verified
* What evidence should be collected

The challenge is explicitly defining deletion semantics, ensuring each system enforces and verifies the intended deletion mechanism, and validating that personal data has been removed across the organization.
