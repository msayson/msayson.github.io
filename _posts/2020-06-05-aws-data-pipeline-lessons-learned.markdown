---
layout: post
title:  "Lessons learned from using AWS Data Pipeline"
date:   2020-06-05 20:00:00 -0700
categories: aws
excerpt: "<p>One of the projects I worked on last year had a requirement to sync daily snapshots of data from Amazon RDS to Amazon S3 in order to support other internal services that ingested from S3 data providers.</p><p>I decided to use AWS Data Pipeline since it seemed to be a good fit for our use cases and worked well in a proof-of-concept.</p><p>This turned out to be a less than ideal solution although it did the job, and I learned several lessons from the experience.</p>"
---

One of the projects I worked on last year had a requirement to sync daily snapshots of a subset of data from an Amazon RDS database to Amazon S3 in order to support other internal services that ingested from S3 data providers.

I negotiated requirements with the stakeholders who were requesting the data, and decided to use AWS Data Pipeline since it seemed to be a good fit for our use cases and worked well in a proof-of-concept.

This turned out to be a less than ideal solution although it did the job, and I learned several lessons from the experience.

## Lesson 1: Security requirements should be explicitly defined at the start of a project and incorporated into proof-of-concepts.

We had user requirements for the data syncs, and knew that we would encrypt data at rest in S3 and encrypt in transit between S3 and downstream services.

However, I found that integrating with internal services that had specific assumptions for how security requirements would be implemented introduced more work than expected, and a number of Data Pipeline security limitations came up over the course of the project.

After several days of debugging an integration with an internal security template for S3 buckets, I found that the template assumed that KMS encryption would be used for all files saved to S3.  The template blocked all other forms of encryption, while AWS Data Pipeline supported AES but not KMS encryption.

I confirmed with our security team that AES was an acceptable encryption protocol to use, and was able to build a custom template that satisfied security requirements.  However, the extra work to debug and resolve the issue added about a week of engineering time to the project.

Next, I found that AWS Data Pipeline does not by default encrypt data in transit between Amazon RDS and itself, while it does encrypt data between itself and S3.

AWS Support suggested a possible workaround to force encryption between RDS and AWS Data Pipeline that would involve:

* setting up a script to pre-install RDS certificates on the Data Pipeline compute instances,
* maintaining a JRE 7-compatible version of the JDBC driver in S3,
* referring Data Pipeline instances to the custom JDBC driver, and
* configuring the Data Pipeline JDBC connection to use the RDS SSL certificate.

While it would be ideal to encrypt data in transit between any AWS services, I confirmed with our security team that for the data we were handling, this extra work would not be needed if we ensured that data would only be unencrypted in transit within a secured AWS Virtual Private Cloud (VPC) and would always be encrypted when leaving the VPC.  I configured the Data Pipeline compute instances to run in the same VPC as the RDS instance so that this was not an issue.

## Lesson 2: AWS Data Pipeline has several functional limitations to be aware of.

Some of these limitations can be worked around, while others make it less suitable for many projects:

* Data Pipeline does not encrypt data from a source RDS instance and itself, while there is a potential workaround as described earlier in this post.
* Data Pipeline does not support KMS encryption for writing data to S3, while it does support AES encryption.
* Data Pipeline does not support including column headers in exports of RDS tables to S3 by default.  A workaround for PostgreSQL databases is to update the SQL SELECT statement to force a SQL UNION between column headers and data fields casted to strings.  However, this workaround requires all columns to be specified in the query, which adds manual effort to update data schemas.
* A number of Data Pipeline attributes cannot be updated after creation.  A workaround is to update the CloudFormation template to no longer include the Data Pipeline resource while retaining other template resources.  This deletes the Data Pipeline without affecting any data.  Then, update the CloudFormation template to include the Data Pipeline with the new attributes.  This creates a new Data Pipeline which continues to sync data to the existing S3 bucket.
* Data Pipeline supports CSV exports but not JSON or Parquet.
* Data Pipeline compute instances must be explicitly defined by users, meaning that you manage the types and numbers of compute instances to set up for your pipeline.
* Data Pipeline is no longer being actively developed, as engineering resources have been allocated to the newer and more featureful AWS Glue service.

## Lesson 3: When producing data for partners, talk directly with the engineers on their team.

Two limitations that made life more difficult for this project were Data Pipeline not having default support for including column headers in S3 data exports, and Data Pipeline not supporting JSON or Parquet file formats for data exports.

Our customer required column headers to be present in order to process data, and the workaround implemented to support this meant that data syncs were no longer agnostic of data schemas and that manual effort would be needed to sync new fields.

The initial requirements included that data be provided to them in CSV format.  However, engineers on the team later reported to us that their system didn't fully support standards-compliant CSV, while they had better support for JSON and Parquet.

In order to support their use cases, we had to add pre-processing of data to strip out or convert a number of characters that their system had issues with, and we had to continue to iterate on this as records came up including additional characters that their CSV parsers were not able to handle.  These issues were not present in their JSON or Parquet parsers.

Both of these issues could have been discovered earlier if I had scheduled an in-depth design discussion with the engineers on our partner team at the start of the project rather than taking the requirements at face value.

After our integration with them, we agreed that CSV exports should not be recommended for subsequent data providers onboarding to their service.

## Lesson 4: AWS Glue is a more suitable solution for many modern data sync use cases.

Three of the solutions I considered at the start of the project were:

* [AWS Database Migration Service](https://aws.amazon.com/dms/)
* [AWS Data Pipeline](https://aws.amazon.com/datapipeline/)
* [AWS Glue](https://aws.amazon.com/glue/)

AWS Database Migration Service is easy to set up and works well for many use cases that require syncing data from one AWS service to another.  However, some of our specific use cases were not supported by it, such as requiring distinct S3 paths for each sync so that customers could quickly query for data from a specific day's snapshot as well as compare data between snapshots.

AWS Data Pipeline looked like a perfect match at the start of the project, however, as discussed in this post, it has several feature limitations that we discovered after working with it that limit the projects I would recommend it for.

AWS Glue is a newer service that runs on an AWS-managed Spark environment so that you don't have to manage the compute instances as is the case with Data Pipeline.  It supports CSV, JSON, Parquet, and other file formats, and its jobs can be written in either Scala or Python.

When I first looked at AWS Data Pipeline and AWS Glue, I found that I was able to stand up a Data Pipeline proof-of-concept within a day, while Glue appeared to have a steeper learning curve.  Since Data Pipeline was the simplest solution that appeared to satisfy our requirements, I recommended we use it instead of Glue, particularly since no one on our team had used Glue before.

Given what I know today, and now that we have more examples from partners who have successfully used Glue for their workflows, I would tend to recommend going straight to AWS Glue instead of AWS Data Pipeline in use cases that require more complex workflows than are supported by AWS Database Migration Service.

## Lesson 5: AWS Support is an excellent resource for assisting with issues that don't have obvious solutions.

There were a number of issues I came across when working with AWS Data Pipeline where there was minimal information provided in error messages, logs, or public documentation.

These came up when implementing use cases more complicated than examples provided in documentation, such as integrating with VPCs with locked down security groups, or with RDS and S3 resources which have specific security configurations in place.

After attempting to troubleshoot Data Pipeline issues that were lacking error logs for a few days without success, I reached out to AWS Support, where support staff also had difficulty determining the root cause, but were able to reach out to relevant AWS engineering teams who had the background to either diagnose the issue or provide options for moving forward.

One particularly tricky Data Pipeline issue took over two days to work through with AWS Support due to the lack of error logs, while another was resolved within a couple of hours since they quickly recognized it as being a symptom of an encryption protocol mismatch between our security template and what was being used by Data Pipeline's backend.

I had not often leveraged AWS Support before, while I knew that we had access to enterprise support.  This project demonstrated the value of AWS Support when other resources are insufficient for root-causing the issue independently, particularly when working with AWS services in a way that applies restrictions beyond the typical use case.

## Summary of lessons learned

* Security requirements should be explicitly defined at the start of a project and incorporated into proof-of-concepts.
* AWS Data Pipeline has several functional limitations to be aware of that make it unsuitable for some use cases that appear to match on the surface.
* When producing data for partners, talk directly with the engineers on their team to validate the format that they will be able to work with, since they know their services best.
* AWS Glue is a more suitable solution than AWS Data Pipeline in many cases than are too complex for AWS Database Migration Service to support.
* AWS Support is an excellent resource, particularly if you have access to enterprise support.
