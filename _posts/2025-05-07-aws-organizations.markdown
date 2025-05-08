---
layout: post
title: "Using AWS Organizations to standardize security controls across AWS accounts"
date: 2025-05-07 00:00:00 +0000
categories: aws
---

## Introduction

AWS Organizations provide a helpful way to centralize management of AWS accounts, with support for consolidating billing, role-based permission sets, service and resource control policies, and AWS service configurations.

Service control policies (SCPs) can be used to enforce security controls such as:
* Requiring multi-factor authentication (MFA) to complete certain actions
* Blocking use of the root user outside of the AWS Organization management account
* Blocking certain changes such as leaving the AWS Organization or disabling security tools
* Blocking access to specific regions or setting a region allow-list, if your organization has policies restricting where services can be deployed
* Blocking granting VPCs direct Internet access

Resource control policies (RCPs) are supported by S3, STS, KMS, SQS, and Secrets Manager, and can be used to enforce security controls such:
* Requiring all queries against in-scope resources to be over HTTPS
* Restricting access to your S3 buckets, KMS encryption keys, and Secrets Manager secrets to principles within your AWS Organization
* Restricting sts:AssumeRoleWithWebIdentity requests to allow-listed OpenID Connect (OIDC) Identity Providers and identities
* Requesting KMS encryption to be used for all S3 objects

SCPs and RCPs are provided at no cost, while only up to 5 SCPs and 5 RCPs can be assigned to a given AWS account or AWS Organizational Unit.

Each AWS Organization has a single management account that can't be changed, and AWS recommends using an account that has no other resources or workloads for this purpose.  Access to the management account should be limited to admin users that need to make organization changes.  SCPs and RCPs do not apply to the management account.

There are no costs associated with using AWS Organizations, so while you do need to take care when using it (with great power comes great responsibility), it's an awesome tool to simplify managing multi-account organizations and services.

## Creating an AWS Organization

Once you've created an AWS account that will be specifically for AWS Organization management, log into that account, navigate to the AWS Organizations service and click "Create an Organization".

![AWS Organizations Landing Page](/images/20250507_AwsOrgs_01_StarterLandingPage.png)

Review the linked recommendations, and click "Create an Organization" to proceed.

![Create AWS Organization Page](/images/20250507_AwsOrgs_02_CreateOrgPage.png)

You can then view and modify Organization settings and Invite Accounts to join the Organization.

![New AWS Organization Page](/images/20250507_AwsOrgs_03_NewOrgPage.png)

## Standardizing user access via IAM Identity Center

From the AWS Organization management account, navigate to the IAM Identity Center service, and enable Identity Center for your Organization if not yet enabled.

Then, under "Settings" > "Identity source", configure an Identity Source that matches your use case.

You can choose between:
* Identity Center directory, where you create users and groups in IAM Identity Center, and users sign in through the AWS access portal with usernames and passwords.
* Active Directory, which many companies already have set up to manage network access controls.
* Other external identity providers that implement supported identity federation protocols.

For my proof-of-concept, Active Directory and external identity providers aren't relevant, so I'll use the native AWS Identity Center directory.

![Choose Identity Source](/images/20250507_IamIdentityCenter_01_ChooseIdentitySource.png)

## Enforcing multi-factor-authentication (MFA)

Especially if using traditional usernames and passwords, multi-factor authentication is critical to protect your accounts from attackers.

MFA requires that after a user enters a correct username and password, they also provide additional verification that they are who they say they are.

Companies such as [Google](https://security.googleblog.com/2019/05/new-research-how-effective-is-basic.html) and [Microsoft](https://www.microsoft.com/en-us/security/blog/2019/08/20/one-simple-action-you-can-take-to-prevent-99-9-percent-of-account-attacks/) that have enforced MFA have reported 99%+ decreases in successful account take-overs when requiring on-device prompts, and 100% decreases when requiring physical security keys.

To enforce MFA for your Organization:
* Navigate to "IAM Identity Center" > "Settings" > "Authentication".
* Under "Multi-factor authentication", click "Configure".
* Under "Prompt users for MFA", select "Every time they sign in".
* Under "Users can authenticate with these MFA types", select one or more of the following:
  * Security keys (eg. YubiKey) and built-in authenticators (eg. Apple TouchID) - recommend always enabling so can users can choose the strongest MFA type available; or
  * Authenticator apps (eg. Authy, Google Authenticator) - good back-up if not all users can use the first option.
* Under "If a user does not yet have a registered MFA device", select "Require them to register an MFA device at sign in".
* Click "Save changes".

![Enforce MFA](/images/20250507_IamIdentityCenter_02_EnforceMfa.png)

MFA will now be automatically enforced for all users.

## Adding AWS accounts to an AWS Organization

From the AWS Organization's "AWS accounts" page, click "Add an AWS account".

From here, you can either create new AWS accounts under the Organization, or invite existing AWS accounts to join the Organization.

![Invite AWS Account Page](/images/20250507_AwsOrgs_04_InviteAccountPage.png)

To invite an existing account, click "Invite an existing AWS account", enter the account's details, and click "Send invitation".

You can then log into the invited AWS account, select "Invitations", and accept or decline the invite.

![View Invite to AWS Organization](/images/20250507_AwsOrgs_05_MemberAccountInvitation.png)

After accepting the invite, billing for the member account will be managed by the Organization's management account, and any Organization-level security controls and AWS service configurations will be automatically applied.

![Invite Accepted Page](/images/20250507_AwsOrgs_06_MemberAccountInviteAccepted.png)

Member accounts can leave the Organization at any time from their AWS Organizations dashboard, unless the Organization has enforced a service control policy (SCP) blocking this action.  It's a good practice to implement such an SCP to prevent actors who've compromised an account from leaving the Organization to disable its security controls.

## Creating cross-account role-based permission groups

A permission set is a collection of IAM policies and permission boundaries that defines the access that will be granted to a logged in user.

Multiple permission sets can be created and assigned to user groups to enable those users to log into a AWS account with one of the permission sets that have been made available to them.

To manage your permission sets, navigate to "IAM Identity Center" > "Multi-account permissions" > "Permission sets".

If you click "Create permission set", you can select from a number of AWS-defined template permission sets, or create a custom permission set with any combination of managed and inline IAM policies and an optional permission boundary.

![Create Permission Set](/images/20250507_IamIdentityCenter_04_CreatePermissionSet.png)

For example, we could create the following predefined permission sets for our Organization:
* AdministratorAccess: provides full access to AWS services and resources
* PowerUserAccess: provides full access to AWS services and resources, but does not allow management of Users and groups
* SupportUser: provides permissions to troubleshoot and resolve issues in an AWS account, and contact AWS support to create and manage cases
* ReadOnlyAccess: provides read-only access to AWS services and resources

![Permission Sets List View](/images/20250507_IamIdentityCenter_03_PermissionSets.png)

We can then create a user group and grant that group a subset of these permission sets on specific member accounts in our Organization, depending on the level of access they need on the given accounts for their business functions.

Under "IAM Identity Center" > "Groups", you can manage permission groups that you can assign role-based permissions, and these groups can be assigned to any selection of Organizational Units or accounts within your AWS Organization.

![Groups List View](/images/20250507_IamIdentityCenter_05_GroupsList.png)

To create a new group, select "Create group", enter a group name and optional description, optionally add users, and click "Create group".

Then open that group and under AWS accounts, select "Assign accounts".

Select accounts and permission sets that the given group should have on those accounts, the click "Assign" to apply the permissions.

![Assign permission sets and accounts to a group](/images/20250507_IamIdentityCenter_06_GroupAssignPermissionSets.png)

You can then add users to the group, and after they log into their provided AWS access portal, they will be able to select an account and a permission set out of those assigned to their group for that account.

![User portal with accounts and permission sets](/images/20250507_UserLoginPermissionSetsView.png)

A common use case for setting up multiple permission sets on a group is to allow developers to log into accounts with read-only access by default to validate workflows, and only have them log in with admin permissions when necessary to manually remediate issues.

## Setting up Service Control Policies

From your AWS Organization management account, navigate to "AWS Organizations" > "Policies".

Click "Service control policies" and enable this feature.

![Security Control Policies page](/images/20250507_AwsOrgs_07_SecurityControlPoliciesPage.png)

Click "Create policy" and create a policy based on your use cases.

For example, to create a policy that blocks member accounts from leaving the AWS Organization, disabling or modifying GuardDuty config, or attaching their VPCs directly to the Internet, we can create a SCP with:
* Policy name: DenyBypassOrgSecurityControls
  * Note: Will likely want a more specific policy and name, using this for testing purposes.
* Description: Prevent member accounts from leaving the AWS Organization, disabling or modifying GuardDuty configurations, or opening direct VPC access to the Internet.
* Policy JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyLeaveOrganization",
      "Effect": "Deny",
      "Action": [
        "organizations:LeaveOrganization"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyModifyGuardDuty",
      "Effect": "Deny",
      "Action": [
        "guardduty:AcceptInvitation",
        "guardduty:ArchiveFindings",
        "guardduty:CreateDetector",
        "guardduty:CreateFilter",
        "guardduty:CreateIPSet",
        "guardduty:CreateMembers",
        "guardduty:CreatePublishingDestination",
        "guardduty:CreateSampleFindings",
        "guardduty:CreateThreatIntelSet",
        "guardduty:DeclineInvitations",
        "guardduty:DeleteDetector",
        "guardduty:DeleteFilter",
        "guardduty:DeleteInvitations",
        "guardduty:DeleteIPSet",
        "guardduty:DeleteMembers",
        "guardduty:DeletePublishingDestination",
        "guardduty:DeleteThreatIntelSet",
        "guardduty:DisassociateFromMasterAccount",
        "guardduty:DisassociateMembers",
        "guardduty:InviteMembers",
        "guardduty:StartMonitoringMembers",
        "guardduty:StopMonitoringMembers",
        "guardduty:TagResource",
        "guardduty:UnarchiveFindings",
        "guardduty:UntagResource",
        "guardduty:UpdateDetector",
        "guardduty:UpdateFilter",
        "guardduty:UpdateFindingsFeedback",
        "guardduty:UpdateIPSet",
        "guardduty:UpdatePublishingDestination",
        "guardduty:UpdateThreatIntelSet"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyOpenVpcInternetAccess",
      "Effect": "Deny",
      "Action": [
        "ec2:AttachInternetGateway",
        "ec2:CreateInternetGateway",
        "ec2:CreateEgressOnlyInternetGateway",
        "ec2:CreateVpcPeeringConnection",
        "ec2:AcceptVpcPeeringConnection",
        "globalaccelerator:Create*",
        "globalaccelerator:Update*"
      ],
      "Resource": "*"
    }
  ]
}
```

Click "Create policy" to save your changes.

Then, from the "Service control policies" page, select your created policy and select "Actions" > "Attach Policy".

![Security Control Policies actions](/images/20250507_AwsOrgs_08_SecurityControlPoliciesPage_AttachPolicyDropdown.png)

Select the Organizational Units or specific accounts you want to apply the policy to, and click "Attach policy".

![Security Control Policies attach policy page](/images/20250507_AwsOrgs_09_SecurityControlPolicies_AttachPolicyPage.png)

The security controls will now be automatically enforced for the associated member accounts.

## References

AWS Organizations User Guide: [https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html)

AWS Organizations Best Practices: [https://docs.aws.amazon.com/organizations/latest/userguide/orgs_best-practices_mgmt-acct.html](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_best-practices_mgmt-acct.html)

AWS Organizations Security Control Policies User Guide: [https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)

AWS Organizations Security Control Policies Best Practices: [https://aws.amazon.com/blogs/industries/best-practices-for-aws-organizations-service-control-policies-in-a-multi-account-environment/](https://aws.amazon.com/blogs/industries/best-practices-for-aws-organizations-service-control-policies-in-a-multi-account-environment/)

AWS IAM Identity Center MFA User Guide: [https://docs.aws.amazon.com/singlesignon/latest/userguide/mfa-configure.html](https://docs.aws.amazon.com/singlesignon/latest/userguide/mfa-configure.html)
