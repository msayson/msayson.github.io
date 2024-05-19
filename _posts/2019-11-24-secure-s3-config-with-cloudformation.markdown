---
layout: post
title:  "Setting up secure AWS S3 buckets with CloudFormation"
date:   2019-11-24 20:00:00 -0800
categories: aws security
excerpt: "In this post I'll go over a few of the configuration settings that you can use to secure your S3 resources, with a base CloudFormation template at the end that you can play with and extend."
---

Many applications using Amazon Web Services (AWS) will interact with the Amazon Simple Storage Service (S3) at some point, since it's an inexpensive storage service with high availability and durability guarantees, and most native AWS services use it as a building block.

In this post I'll go over a few of the configuration settings that you can use to secure your S3 resources, with a base CloudFormation template at the end that you can play with and extend.

<!--more-->

My provided examples are in YAML, while you can also use JSON in CloudFormation.  Which one you use is largely a matter of personal preference.

## Encryption at rest

It's a good idea to encrypt your data wherever it's stored so that only those with access to the keys can read it.  Any sensitive data should always be encrypted, and it's usually only acceptable to leave data unencrypted if it's intended to be readable by everyone, for all time.

AWS S3 supports several mechanisms for server-side encryption of data:

* [S3-managed AES keys (SSE-S3)](https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html)
    * Every object that is uploaded to the bucket is automatically encrypted with a unique AES-256 encryption key.
    * Encryption keys are generated and managed by S3.
* [Customer-managed keys stored in the AWS Key Management Service (SSE-KMS)](https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingKMSEncryption.html)
    * Every object that is uploaded to the bucket is automatically encrypted with a unique data key generated from a KMS master key. You can specify the master key to use in your [PutObject request](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html), or use the bucket's default KMS master key.
    * You can generate or import custom keys in KMS to allow you to disable or rotate keys in the future.
    * KMS provides audit logs showing when and where keys were accessed.
* [Customer-managed keys provided in S3 requests (SSE-C)](https://docs.aws.amazon.com/AmazonS3/latest/dev/ServerSideEncryptionCustomerKeys.html)
    * Object are encrypted using encryption keys that you provide in S3 [PutObject requests](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html).

It usually makes sense to use SSE-S3 or SSE-KMS unless you have a good reason to do otherwise.  SSE-S3 is very simple to use since all the details are taken care of for you, while SSE-KMS provides additional auditing and credential rotation capabilities.

The decision for which one to use usually depends on your security requirements and support by the services that will be interacting with S3.  Many AWS services natively support KMS encryption, while a few services only support SSE-S3.

If both SSE-S3 and SSE-KMS are options for you, then I'd recommend using SSE-KMS with custom keys generated in KMS, since this provides you with auditing by default and allows you to disable or rotate encryption keys with minimal effort.

### Enabling encryption by default

You can enable encryption by default for your S3 bucket with either SSE-S3 or SSE-KMS.

S3 bucket properties for SSE-S3 encryption:

```yaml
BucketEncryption:
  ServerSideEncryptionConfiguration:
    - ServerSideEncryptionByDefault:
        SSEAlgorithm: AES256
```

S3 bucket properties for SSE-KMS encryption using the default account KMS key:

```yaml
BucketEncryption:
  ServerSideEncryptionConfiguration:
    - ServerSideEncryptionByDefault:
        SSEAlgorithm: 'aws:kms'
```

S3 bucket properties for SSE-KMS encryption using a custom KMS key:

```yaml
BucketEncryption:
  ServerSideEncryptionConfiguration:
    - ServerSideEncryptionByDefault:
        KMSMasterKeyID: 'Your key ID goes here'
        SSEAlgorithm: 'aws:kms'
```

I'd suggest setting up a custom KMS key if you want to use KMS by default since this allows you to disable and rotate your key as needed, which is a helpful security capability.

See the [ServerSideEncryptionByDefault documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-serversideencryptionbydefault.html) for more details on these configuration options.

### Requiring uploaded files to be encrypted

The following S3 bucket policy statement ensures that PutObject requests for uploading files to your S3 bucket use server-side encryption:

```yaml
- Action: 's3:PutObject'
  Condition:
    'Null':
      's3:x-amz-server-side-encryption': true
  Effect: Deny
  Principal: '*'
  Resource: !Sub 'arn:${AWS::Partition}:s3:::your-bucket-name-goes-here/*'
  Sid: DenyPublishingUnencryptedResources
```

`Sid` stands for "statement identifier" and can be set to anything you like; this is primarily a label that can also be used as a sub-identifier within the policy.  `Sid` values must be unique within a given policy, while they can be repeated across different policies.

### Requiring a specific encryption mechanism to be used

The following S3 bucket policy statement requires SSE-KMS to be used if a server-side encryption header is provided:

```yaml
- Action: 's3:PutObject'
  Condition:
    'StringNotEquals':
      's3:x-amz-server-side-encryption': 'aws:kms'
  Effect: Deny
  Principal: '*'
  Resource: !Sub 'arn:${AWS::Partition}:s3:::your-bucket-name-goes-here/*'
  Sid: DenyIncorrectEncryptionHeader
```

The following S3 bucket policy statement requires either SSE-S3 or SSE-KMS to be used if a server-side encryption header is provided:

```yaml
- Action: 's3:PutObject'
  Condition:
    'ForAllValues:StringNotEquals':
      's3:x-amz-server-side-encryption':
        - AES256
        - 'aws:kms'
  Effect: Deny
  Principal: '*'
  Resource: !Sub 'arn:${AWS::Partition}:s3:::your-bucket-name-goes-here/*'
  Sid: DenyIncorrectEncryptionHeader
```

## Encryption in transit

Any sensitive data that is being stored in S3 should be uploaded and retrieved using encrypted connections, otherwise it's possible for the data to be read and modified between endpoints.

### Requiring encrypted connections when accessing resources

The following S3 bucket policy statement requires encrypted connections when uploading or reading S3 resources:

```yaml
- Action:
    - 's3:GetObject'
    - 's3:PutObject'
  Condition:
    Bool:
      'aws:SecureTransport': false
  Effect: Deny
  Principal: '*'
  Resource: !Sub 'arn:${AWS::Partition}:s3:::your-bucket-name-goes-here/*'
  Sid: DenyUnencryptedConnections
```

## Access control

While encrypting your data at rest and in transit is important, controlling who is able to view and download sensitive files is essential, and misconfiguring S3 buckets to allow public read or write access is a security risk if you're working with confidential data.

### Using a base access control list (ACL) that grants limited permissions

You can optionally specify one of a set of [predefined values for the `AccessControl` bucket property](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket.html#cfn-s3-bucket-accesscontrol) to use a pre-defined access control list to build on via IAM and S3 bucket policies.  See the [documentation for "canned" S3 ACLs](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) for more information on the underlying permissions granted for each value.

By default, the most locked-down base ACL is used, `Private`, which only grants the account owner full control over the bucket and its resources by default.

`BucketOwnerFullControl` grants both the bucket owner and the object owner full control over an object (eg. file) that has been uploaded to the bucket, which may be helpful for some applications.

ACLs that grant public read or write access should be avoided for any buckets that store sensitive data.

### Blocking public access by default

S3 bucket properties for blocking public access by default:

```yaml
PublicAccessBlockConfiguration:
  BlockPublicAcls: true
  BlockPublicPolicy: true
  IgnorePublicAcls: true
  RestrictPublicBuckets: true
```

S3 bucket policy statements for preventing S3 requests that grant public access to resources:

```yaml
- Action:
    - 's3:PutBucketAcl'
    - 's3:PutObject'
    - 's3:PutObjectAcl'
  Condition:
    StringEquals:
      's3:x-amz-acl':
        - authenticated-read
        - public-read
        - public-read-write
  Effect: Deny
  Principal: '*'
  Resource:
    - !Sub 'arn:${AWS::Partition}:s3:::your-bucket-name-goes-here'
    - !Sub 'arn:${AWS::Partition}:s3:::your-bucket-name-goes-here/*'
  Sid: DenyPublicReadAcl
- Action:
    - 's3:PutBucketAcl'
    - 's3:PutObject'
    - 's3:PutObjectAcl'
  Condition:
    StringLike:
      's3:x-amz-grant-read':
        - '*http://acs.amazonaws.com/groups/global/AllUsers*'
        - '*http://acs.amazonaws.com/groups/global/AuthenticatedUsers*'
  Effect: Deny
  Principal: '*'
  Resource:
    - !Sub 'arn:${AWS::Partition}:s3:::your-bucket-name-goes-here'
    - !Sub 'arn:${AWS::Partition}:s3:::your-bucket-name-goes-here/*'
  Sid: DenyGrantingPublicRead
```

## Putting it together in a CloudFormation template

Below is a starter CloudFormation YAML template which applies the discussed policies to

* enforce encryption at rest,
* enforce encryption in transit,
* block public access by default, and
* block access control list changes that grant public read permissions to resources.

This example uses SSE-S3 as the default encryption algorithm and allows either SSE-S3 or SSE-KMS encryption to be used when specified, while you can use alternative values from previous sections to use SSE-KMS by default and restrict resources to using a single encryption mechanism.

```yaml
Parameters:
  NameOfBucket:
    Description: 'Name of the S3 bucket, which must be globally unique'
    Type: String
Resources:
  YourS3Bucket:
    Type: 'AWS::S3::Bucket'
    Properties:
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      BucketName: !Ref NameOfBucket
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
  YourS3BucketPolicy:
    DependsOn:
      - YourS3Bucket
    Type: 'AWS::S3::BucketPolicy'
    Properties:
      Bucket: !Ref YourS3Bucket
      PolicyDocument:
        Statement:
          - Action: 's3:PutObject'
            Condition:
              'Null':
                's3:x-amz-server-side-encryption': true
            Effect: Deny
            Principal: '*'
            Resource: !Sub 'arn:${AWS::Partition}:s3:::${YourS3Bucket}/*'
            Sid: DenyPublishingUnencryptedResources
          - Action: 's3:PutObject'
            Condition:
              'ForAllValues:StringNotEquals':
                's3:x-amz-server-side-encryption':
                  - AES256
                  - 'aws:kms'
            Effect: Deny
            Principal: '*'
            Resource: !Sub 'arn:${AWS::Partition}:s3:::${YourS3Bucket}/*'
            Sid: DenyIncorrectEncryptionHeader
          - Action:
              - 's3:GetObject'
              - 's3:PutObject'
            Condition:
              Bool:
                'aws:SecureTransport': false
            Effect: Deny
            Principal: '*'
            Resource: !Sub 'arn:${AWS::Partition}:s3:::${YourS3Bucket}/*'
            Sid: DenyUnencryptedConnections
          - Action:
              - 's3:PutBucketAcl'
              - 's3:PutObject'
              - 's3:PutObjectAcl'
            Condition:
              StringEquals:
                's3:x-amz-acl':
                  - authenticated-read
                  - public-read
                  - public-read-write
            Effect: Deny
            Principal: '*'
            Resource:
              - !Sub 'arn:${AWS::Partition}:s3:::${YourS3Bucket}'
              - !Sub 'arn:${AWS::Partition}:s3:::${YourS3Bucket}/*'
            Sid: DenyPublicReadAcl
          - Action:
              - 's3:PutBucketAcl'
              - 's3:PutObject'
              - 's3:PutObjectAcl'
            Condition:
              StringLike:
                's3:x-amz-grant-read':
                  - '*http://acs.amazonaws.com/groups/global/AllUsers*'
                  - '*http://acs.amazonaws.com/groups/global/AuthenticatedUsers*'
            Effect: Deny
            Principal: '*'
            Resource:
              - !Sub 'arn:${AWS::Partition}:s3:::${YourS3Bucket}'
              - !Sub 'arn:${AWS::Partition}:s3:::${YourS3Bucket}/*'
            Sid: DenyGrantingPublicRead
```

You can add additional policy statements to whitelist specific IAM users to perform specific actions on specific resources.

Depending on your needs, you can also set up auditing and alarming for when S3 resources are accessed or when access policies are modified, update your bucket configuration to [prevent data from being overwritten](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lock.html), and set up additional mechanisms to control where S3 queries can be initiated from.

See [the S3 security best practices guide](https://docs.aws.amazon.com/AmazonS3/latest/dev/security-best-practices.html) for more information on where to go next.

## Resources

AWS documentation:

* [Security best practices for Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/security-best-practices.html)
* [CloudFormation properties for S3 buckets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket.html)
* [CloudFormation S3 properties for enabling encryption by default](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-serversideencryptionbydefault.html)

AWS blog posts:
* [How to Use Bucket Policies and Apply Defense-in-Depth to Help Secure Your Amazon S3 Data](https://aws.amazon.com/blogs/security/how-to-use-bucket-policies-and-apply-defense-in-depth-to-help-secure-your-amazon-s3-data/)
* [How to Prevent Uploads of Unencrypted Objects to Amazon S3](https://aws.amazon.com/blogs/security/how-to-prevent-uploads-of-unencrypted-objects-to-amazon-s3/)
