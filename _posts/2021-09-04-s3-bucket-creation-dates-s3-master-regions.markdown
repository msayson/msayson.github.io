---
layout: post
title:  "AWS S3 bucket creation dates and S3 master regions"
date:   2021-09-04 20:00:00 -0700
categories: aws
---

While working on functionality that depended on AWS S3 bucket ages, I noticed that published bucket CreationDate values didn't always reflect when the buckets were created.

For example, when I called the S3 ListBuckets API a few minutes after updating a bucket access policy, the CreationDate value returned for that bucket was the time that I had modified the policy rather than the time that I had created the bucket.  This was also reproduced when using the AWS CLI via the `aws s3api list-buckets` command.

<!--more-->

It turns out that the [S3 CLI documentation for list-buckets](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3api/list-buckets.html) explicitly states that CreationDate values can change when you make changes to your bucket:

> CreationDate -> (timestamp)
>
> > Date the bucket was created. This date can change when making changes to your bucket, such as editing its bucket policy.

However, in [this GitHub issue](https://github.com/aws/aws-cli/issues/3597), an AWS engineer confirmed there was in fact one AWS region you could query to get the original creation times, the "us-east-1" region, and that this was a feature of how S3 was designed.  Other regions' CreationDate values would change when key bucket attributes or access policies were modified.

Why does only one region give the correct creation time? It turns out that all S3 buckets are created in one master region, and then replicated globally.  Each region's replica is only aware of its own creation date.  When bucket changes are propagated across regions via new replication events, the new replica creation dates are what are reflected in regions other than the master region.

I followed up with the S3 team for more details since my team interacts with services across multiple AWS partitions and regions, and from tests it looked like the master region differed between partitions.  As of September 4, 2021, [AWS documentation](https://docs.aws.amazon.com/sdk-for-ruby/v2/api/Aws/Partitions.html) indicates that there are currently three AWS partitions:

* "aws", the classic AWS partition
* "aws-cn", AWS China
* "aws-us-gov", AWS GovCloud

The S3 engineer confirmed that each AWS partition has a single S3 master region, and that querying S3 from that master region would be reliable for retrieving original bucket creation dates.  The master regions are:

* "us-east-1" for the "aws" partition
* "cn-north-1" for the "aws-cn" partition
* "us-gov-west-1" for the "aws-us-gov" partition

Demo:

```sh
# Queries from us-west-2 yield an incorrect creation time which is actually the time when the bucket policy was updated.
% aws configure set region "us-west-2" && aws s3api list-buckets | grep -A 1 "masayson-creation-date-test-20210829-1725" | grep CreationDate
            "CreationDate": "2021-08-30T20:12:58+00:00"

# Queries from us-east-1 yield the original bucket creation time
% aws configure set region "us-east-1" && aws s3api list-buckets | grep -A 1 "masayson-creation-date-test-20210829-1725" | grep CreationDate
            "CreationDate": "2021-08-29T17:25:45+00:00"
```

References:
* S3 ListBuckets API documentation: [https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html)
* S3 list-buckets CLI documentation: [https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3api/list-buckets.html](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3api/list-buckets.html)
* GitHub issue describing changing S3 bucket creation dates: [https://github.com/aws/aws-cli/issues/3597](https://github.com/aws/aws-cli/issues/3597)
