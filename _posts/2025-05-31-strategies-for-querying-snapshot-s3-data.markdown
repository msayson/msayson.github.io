---
layout: post
title: "Strategies for querying periodic S3 data snapshots"
date: 2025-05-31 00:00:00 +0000
categories: aws
excerpt: "<p>A common AWS analytics use case is making aggregate queries across multiple data sets stored in S3.  For example, one partner team may store product metadata, while another team stores purchase order metadata, and we may want to join these data sets to determine which products are most popular across each marketplace.</p><p>In this post I'll cover a few options for syncing data to S3 and retrieving data snapshots for use in aggregate queries, and specifically discuss the use case where we need to maintain access patterns to complete, recent data snapshots without partial unavailability during data syncs.</p>"
---

## Background

A common AWS analytics use case is making aggregate queries across multiple data sets stored in S3.  For example, one partner team may store product metadata, while another team stores purchase order metadata, and we may want to join these data sets to determine which products are most popular across each marketplace.

In this post I'll cover a few options for syncing data to S3 and retrieving data snapshots for use in aggregate queries, and specifically discuss the use case where we need to maintain access patterns to complete, recent data snapshots without partial unavailability during data syncs.

## A few options for syncing data to S3

### 1. Syncing each record to a unique, stable file path
Pros:
- Provides a stable "latest" data set that always represents all records.
- Enables O(1) look-ups of specific records if data consumers query by S3 key ("filepath").
- Low storage costs since only a single copy of each record is stored.

Cons:
- Poor performance and higher costs for aggregate queries at scale. Retrieving tens of thousands of small files is much slower than retrieving a few multi-MB files.
- Limits design choices for data providers and may increase complexity of their implementation (eg. AWS Glue defaults to writing aggregated partial result files).
- No historical data is retained unless explicitly backed up elsewhere.

This is best suited to when data consumers retrieve specific records, only need their latest state, and don't make aggregated queries across a large number of records.

### 2. Appending all events as new data without overwriting prior events
Pros:
- Provides a complete history of events, allowing for time-series analysis.
- If partition data by time, supports efficient queries of specific time periods.

Cons:
- Increase storage costs as accumulate historical data.
- Increased complexity, latency, and cost to retrieve the latest version of each record.
- If data isn't partitioned in a way that aligns with query use cases, may have very inefficient scans.
- If upstream workflows fail, may not have a way to recover data, and have missing records.

This is best suited to queries of time-partitioned events, rather than needing the latest state of records.

### 3. Overwriting one or more files that include multiple records
Pros:
- Consumers always access the most up-to-date version of the dataset.
- More efficient aggregate queries than retrieving thousands of single-record files.
- Low storage costs since only a single copy of each record is stored.

Cons:
- Risk of data loss if a failure occurs during the overwrite process.
- Data consumers querying during a data sync may receive incomplete or duplicate data.
- No historical data is retained unless explicitly backed up elsewhere.

This can work for aggregated queries of the latest records, but if we can't accept the risk of corrupt/partial/duplicate data during sync failures or read/write race conditions, we may prefer writing to separate snapshot partitions.

### 4. Periodically writing complete data to time-based partitions
Pros:
- Consumers always access a complete dataset when querying a completed/past partition.
- More efficient aggregate queries than retrieving thousands of single-record files.
- Maintain historical data for as long as prior time partitions are kept in storage.

Cons:
- More complex to identify the latest complete partition.
- Data consumers querying the most recent partition during a data sync may receive incomplete data.  Need some type of completeness signal to mitigate.
- Increase storage costs as accumulate historical data.

We can mitigate storage costs by setting a lifecycle rule to automatically delete S3 files past a certain age, eg. auto-delete files over 2 weeks old, if we only need to query recent snapshots.

## Case study: Aggregate queries where completeness is important
For this post, we'll consider the case where we want to optimize for aggregated queries against hundreds of thousands of records, with filter criteria applied across all records.  Our business requirements are that data consumers must always have access to complete and accurate data (no duplicates or missing records), but data does not need to be real-time as long as it's up to date within a few hours.

In this case, single-record files and time-series events are not a good fit due to increased latency to query latest state across this number of records.  We may prefer time-based partitions with complete data written to a new partition every N hours, eg. hourly, to mitigate partial/duplicate data issues during concurrent read/write operations.

## A few options for querying time-partitioned snapshots

A common challenge for time-partitioned partitions is identifying the latest complete partition, especially if upstream data syncs are not 100% successful.

### 1. Retrieve a specific snapshot relative to the current time

Assuming we have hourly snapshots that are partitioned by `snapshot_date` and `snapshot_hour`, where `snapshot_date` is formatted as `"2025-01-31"` and `snapshot_hour` is formatted as `"01"` or `"23"` to support consistent string comparisons, the following Athena SQL query retrieves data from the last hour's time partition:

```sql
SELECT * FROM upstream_dataset
WHERE snapshot_date = CAST(DATE_FORMAT(CURRENT_TIMESTAMP - INTERVAL '1' HOUR, '%Y-%m-%d') AS VARCHAR)
AND snapshot_hour = CAST(DATE_FORMAT(CURRENT_TIMESTAMP - INTERVAL '1' HOUR, '%H') AS VARCHAR);
```

Pros:
- Simple, easy to understand.
- Very efficient since only querying data from a single partition, and it's O(1) to locate that partition.

Cons:
- May fail to get any data if there were upstream sync issues for the selected partition. **This is a blocker for us.**
- May get partial data if query the most recent partition during an ongoing sync.
- May need to query older and more out-of-date partitions to avoid the above race condition.

### 2. Retrieve most recent snapshot

We can improve on the prior option by using an initial query to identify the most recent snapshot partition that has data.

Since it could be expensive to search across all partitions, we can set a maximum look-back period, for example, the last 7 days, to allow for occasional upstream failures that may take a few days to resolve.

Example Athena SQL query:

```sql
WITH MostRecentSnapshotPartition AS (
    SELECT DISTINCT snapshot_date, snapshot_hour
    FROM upstream_dataset
    -- Set a maximum look-back period to reduce query search space while allowing a few days of upstream failures
    WHERE snapshot_date >= CAST(CURRENT_DATE - INTERVAL '7' DAY AS VARCHAR)
    ORDER BY snapshot_date DESC, snapshot_hour DESC
    LIMIT 1
)
SELECT upstream_dataset.*
FROM upstream_dataset
INNER JOIN MostRecentSnapshotPartition
    ON upstream_dataset.snapshot_date = MostRecentSnapshotPartition.snapshot_date
    AND upstream_dataset.snapshot_hour = MostRecentSnapshotPartition.snapshot_hour;
```

Pros:
- Relatively simple and easy to understand.
- Guaranteed to get most recent snapshot with data within the given look-back period.

Cons:
- May get partial data if query the most recent partition during an ongoing sync.

### 3. Retrieve the second most recent snapshot

If we need to mitigate race conditions where the latest partition may have partial data, we could always query for the second most recent partition.

We can maintain the same maximum look-back period to limit the query search space for performance reasons, while accounting for a few days of upstream failures.

Example Athena SQL query:

```sql
WITH RecentSnapshotPartitions AS (
    SELECT DISTINCT snapshot_date, snapshot_hour
    FROM upstream_dataset
    -- Set a maximum look-back period to reduce query search space while allowing a few days of upstream failures
    WHERE snapshot_date >= CAST(CURRENT_DATE - INTERVAL '7' DAY AS VARCHAR)
    -- Get the two most recent partitions with data
    ORDER BY snapshot_date DESC, snapshot_hour DESC
    LIMIT 2
),
RankedSnapshotPartitions AS (
    SELECT
        snapshot_date,
        snapshot_hour,
        -- Set a row number so we can select the second most recent partition
        ROW_NUMBER() OVER (ORDER BY snapshot_date DESC, snapshot_hour DESC) AS recency_rank
    FROM RecentSnapshotPartitions
)
SELECT upstream_dataset.*
FROM upstream_dataset
INNER JOIN RankedSnapshotPartitions
    ON upstream_dataset.snapshot_date = RankedSnapshotPartitions.snapshot_date
    AND upstream_dataset.snapshot_hour = RankedSnapshotPartitions.snapshot_hour
    AND RankedSnapshotPartitions.recency_rank = 2;
```

Pros:
- If the second most recent partition is always complete, this guarantees complete data.

Cons:
- More complex and difficult to understand than other options.
- Less efficient than other options.

### 4. Retrieve the most recent snapshot older than the period between data syncs

If we need to account for temporary upstream failures and cannot accept race conditions where the most recent partition may sometimes be complete, we can simplify from Option 1 by querying for the most recent partition older than the time between syncs, eg. the most recent partition more than 1 hour old.

```sql
WITH RecentCompleteSnapshotPartition AS (
    SELECT DISTINCT snapshot_date, snapshot_hour
    FROM upstream_dataset
    -- Get snapshots from more than 1 hour ago, to avoid querying a partition with an ongoing sync if have race conditions near the start of an hour
    WHERE snapshot_date <= CAST(DATE_FORMAT(CURRENT_TIMESTAMP - INTERVAL '1' HOUR, '%Y-%m-%d' AS VARCHAR))
    AND snapshot_hour < CAST(DATE_FORMAT(CURRENT_TIMESTAMP - INTERVAL '1' HOUR, '%H') AS VARCHAR)
    -- Set a maximum look-back period to reduce query search space while allowing a few days of upstream failures
    AND snapshot_date >= CAST(CURRENT_DATE - INTERVAL '7' DAY AS VARCHAR)
    ORDER BY snapshot_date DESC, snapshot_hour DESC
    LIMIT 1
)
SELECT upstream_dataset.*
FROM upstream_dataset
INNER JOIN RecentCompleteSnapshotPartition
    ON upstream_dataset.snapshot_date = RecentCompleteSnapshotPartition.snapshot_date
    AND upstream_dataset.snapshot_hour = RecentCompleteSnapshotPartition.snapshot_hour;
```

Pros:
- If populated partitions that are older than the period between syncs are always complete, guarantees complete data.
- Simpler and more efficient than Option 3, while covering the flaws of Options 1-2.

Cons:
- Slightly more complex query than Options 1-2.

### 5. Send data completeness events to trigger downstream queries

If we can request that our data provider pushes a data completeness signal file such as an empty file named `_SUCCESS` to the latest S3 directory after completing a data sync, we can set up S3 PutObject notifications that filter for this specific filename and trigger downstream workflows whenever this signal is received.

This is ideal for event-based workflows that only need to listen for a single trigger, while it may not be sufficient if there are multiple upstream datasets that we need to query that have different schedules and may not all be complete at the same time.

Pros:
- Guarantees completeness of the given data set at the time we receive the event.
- Allows downstream workflows to run with the most recent data possible, as soon as data is received.

Cons:
- More complex to support multiple upstream data sets, best for single-dependency workflows.
- May not work with workflows that are strictly schedule-based and cannot be easily triggered by an event.

### 6. Leverage AWS Glue Catalog, trigger Glue Crawler from Glue job event

If we populate our S3 bucket with an AWS Glue job, we can set up a Glue Catalog and a Glue Crawler that updates the catalog with an abstracted representation of the source data and its available partitions for downstream services such as AWS Athena to query.

If we set up the Glue Catalog Table as the data source for our downstream queries, we will only query partitions that it has crawled.

We can set up a [Glue trigger](https://docs.aws.amazon.com/glue/latest/dg/about-triggers.html) to automatically run the Crawler after the upstream Glue job that populates new S3 partitions has succeeded, or after [some event is received via EventBridge](https://docs.aws.amazon.com/glue/latest/dg/starting-workflow-eventbridge.html), such as creation of a `_SUCCESS` file, to automatically make new partitions available only after their sync jobs have completed.

We could then use the Athena SQL query from Option 2 but with the Glue Table as our source, to simplify querying the most recent complete partition.

```sql
WITH MostRecentSnapshotPartition AS (
    SELECT DISTINCT snapshot_date, snapshot_hour
    FROM upstream_dataset
    -- Set a maximum look-back period to reduce query search space while allowing a few days of upstream failures
    WHERE snapshot_date >= CAST(CURRENT_DATE - INTERVAL '7' DAY AS VARCHAR)
    ORDER BY snapshot_date DESC, snapshot_hour DESC
    LIMIT 1
)
SELECT upstream_dataset.*
FROM upstream_dataset
INNER JOIN MostRecentSnapshotPartition
    ON upstream_dataset.snapshot_date = MostRecentSnapshotPartition.snapshot_date
    AND upstream_dataset.snapshot_hour = MostRecentSnapshotPartition.snapshot_hour;
```

Pros:
- Abstracts logic for how to identify the most recent partition from data consumers.
- Enables always querying the most recent complete partition.
- Avoids the incomplete/duplicate data issues from Options 1-2 and the query complexity from Options 3-4.

Cons:
- Requires additional infrastructure set-up and hardware costs for Glue resources and event-based triggers.
- May add several minutes of data latency from events -> Glue trigger -> Glue crawler -> Glue catalog update, compared to directly querying S3 for the most recent partition more than N hours old.

### 7. Leverage AWS Glue Catalog, use AWS Lambda to update a "latest" table after completeness events

If we have multiple upstream data sets which rules out Option 5, and we're willing to invest a few developer weeks to optimize and simplify queries for data consumers, we could create a custom Lambda function that programmatically updates Glue resources to point to a "latest" S3 partition whenever a data sync completes.

We could require data providers to write an empty `_SUCCESS` file to the new partition after a successful sync.  We can then set up a S3 PutObject notification that filters for `_SUCCESS` files, and make this a trigger to our Lambda function.

The Lambda function will then:
1. Query the S3 directory for files in the new partition and scan them to infer their partitions and table schema.
2. Query Glue's [UpdateTable API](https://docs.aws.amazon.com/glue/latest/webapi/API_UpdateTable.html) to update the Glue Catalog Table that represents the latest version of the snapshot-based data set, to have the latest data schema and point to the new partition.

Data consumers can then simplify their queries to the following, without needing to select snapshot partition attributes:

```sql
SELECT * FROM upstream_dataset;
```

Pros:
- Significantly simplifies queries for data consumers.
- Enables always querying the most recent complete partition.
- Avoids the incomplete/duplicate data issues from Options 1-2 and the query complexity from Options 3-6.

Cons:
- Adds multiple weeks of developer effort to replicate AWS Glue's functionality for inferring schemas and updating Glue Catalog Tables.
- Increases backend architecture and code complexity, with more points of failures that need to be maintained and supported.

If this works, the end result may be great from the data consumer side, but in many cases this developer time is more valuable spent on other problems, and we're willing to accept either slightly more complex but well-documented queries for data consumers, or occasional race conditions where recent snapshots may be incomplete if we happen to be reading at the same time that a data sync is occurring.

## Case study: Retrieving recent data when completeness is critical and developer time is limited

Take the case where we are limited to a few days of developer time to set up associated infrastructure, while we have the business requirements that:

1. Data consumers must always be able to query complete and accurate data that is no more than a few hours old.  Missing or duplicate data due to read/write race conditions is not acceptable.
2. Data consumers must be able to aggregate data from multiple upstream sources while satisfying the above conditions for completeness without partial data if querying during data syncs.

In this scenario, Option 6 may be an acceptable tradeoff, where we leverage existing AWS Glue functionality to automatically surface new partitions and schemas after receiving a data sync completion signal, and point data consumers to the Glue Catalog Table to query partitions that have completed syncs.

Data consumers will then need to be aware of snapshot partition attributes to select data from the most recent partition, but they can simply query for the most recent partition since we will only surface partitions after receiving a data sync completion signal.
