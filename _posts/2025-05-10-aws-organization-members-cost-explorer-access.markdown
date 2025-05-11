---
layout: post
title: "Granting AWS Organization member accounts access to Cost Explorer"
date: 2025-05-10 00:00:00 +0000
categories: aws
excerpt: "<p>By default, adding accounts to an AWS Organization results in consolidated billing and cost management in the Organization management account, and Organization member accounts lose access to Cost Explorer, Billing, and other cost management services.</p><p>This post walks through how to allow member accounts to access cost management services, to enable each team to review and manage their AWS spending.</p>"
---

## Introduction

By default, adding accounts to an AWS Organization results in consolidated billing and cost management in the Organization management account, and Organization member accounts lose access to Cost Explorer, Billing, and other cost management services unless access is explicitly enabled from the Organization management account.

This post walks through how to allow member accounts to access cost management services, to enable each team to review and manage their AWS spending.

## Enabling Cost Explorer and Cost Optimization Hub

Cost Explorer allows you to analyze AWS service costs and usage changes over time, and is free to access through the AWS UI.  You can filter and group costs and usage across multiple dimensions including AWS service, resource, usage type, region, and tag.

![Cost Explorer Screenshot](/images/20250510_CostExplorer.png)

After logging into the Organization management account using the root user, navigate to the Cost Explorer service to automatically enable it from the current time onwards.  You will need to do this once per account in your Organization, logging in as the root user for each account.

Cost Optimization Hub is a free service that provides cost optimization recommendations across multiple services.  To enable member accounts access, we'll need to enable the services from the AWS Organizations management account, and explicitly add permissions to the Permission Sets granting them access.

To enable Cost Optimization Hub, navigate to the Cost Optimization Hub landing page, scroll down, select "Enable Cost Optimization Hub for this account and all member accounts", and click "Enable".

As indicated by the prompt, to fully benefit from this service you'll also need to opt into the free AWS Compute Optimizer service to import service rightsizing recommendations.  Follow the link to navigate to AWS Compute Optimizer, and click "Get started".

![Prompt to enable Compute Optimizer](/images/20250510_CostOptimizationHub.png)

![Compute Optimizer Enable Link](/images/20250510_ComputeOptimizerEnablePage.png)

![Compute Optimizer Enable Page](/images/20250510_ComputeOptimizerEnablePage2.png)

Select to opt in all member accounts, and click "Opt in".

## Enabling access for member accounts

On the top right hand of the AWS console, select your account name to open the account dropdown, and click "Account", or directly navigate to [https://us-east-1.console.aws.amazon.com/billing/home?region=us-east-1#/account](https://us-east-1.console.aws.amazon.com/billing/home?region=us-east-1#/account).

![AWS account dropdown](/images/20250510_AwsAccountDropdown.png)

Scroll down to "IAM user and role access to Billing information" section and click "Edit".  Select "Activate IAM Access" and click "Update".

![Enable IAM access to Billing](/images/20250510_AccountSettings_EnableIamAccessToBilling.png)

Navigate to "Billing and Cost Management" > "Cost Management Preferences".

Under the "General" tab, enable the options below, then select "Save preferences" at the bottom of the page and confirm changes.

* Linked account access
* Linked account refunds and credits
* Linked account discounts

![Enable linked accounts access to cost management services](/images/20250510_CostManagementPrefs_GeneralPrefs.png)

Under the "Cost Explorer" tab, enable "Granular data" with "Resource-level data at daily granularity", and select "All services", then click "Save preferences" at the bottom of the page and confirm changes.

![Enable Cost Explorer data at daily granularity](/images/20250510_CostManagementPrefs_CostExplorerPrefs.png)

Under the "Cost Optimization Hub" tab, under "Organization and member account settings", select "Enable Cost Optimization Hub for all member accounts" and "Allow member account discount visibility", then click "Save preferences" and confirm changes.

![Enable linked accounts access to Cost Optimization Hub](/images/20250510_CostManagementPrefs_CostOptimizationHubPrefs.png)

## Accessing Cost Explorer from member accounts

At this point, team members logging into Organization member accounts to view Cost Explorer will still see access denied errors across all widgets, even if their IAM permissions grant access to all Cost Explorer actions.

![Cost Explorer Access Denied](/images/20250510_CostExplorerAccessDenied.png)

When clicking on one of the errors, we can see the following message:

> You don’t have permission to [Cost Explorer:]. To request access, copy the following text and send it to your AWS administrator. Learn more about troubleshooting access denied errors
>
> User: [REDACTED_ACCOUNT_ID]
>
> Service: [Cost Explorer]
>
> Name: [AccessDeniedException]
>
> HTTP status code: [400]
>
> Context: [IAM user access not activated]
>
> Request ID: [REDACTED_REQUEST_ID]

To resolve this error, we need to:
* Log into the Organization member account as the root user.
* Visit AWS Cost Explorer once to enable this service if we haven't done this before.
* Navigate to Account settings via the top right hand account dropdown > "Account".
* Scroll down to "IAM user and role access to Billing information" section and click "Edit".
* Select "Activate IAM Access" and click "Update".

![Enable IAM access to billing](/images/20250510_AccountSettings_EnableIamAccessToBilling_EditPage.png)

Non-root users with billing permissions should now have access to Cost Explorer, while the page may initially show zero costs and only show correct spending for the current time going forward.

![Cost Explorer page](/images/20250510_CostExplorerZeroCosts.png)

After waiting for a few days, I noticed that the default view still shows zero spending, while after updating the time period to the last 7 days and updating the granularity to daily, I see correct costs for the past few days up to the date when Cost Explorer was enabled from the Organization management account.

![Cost Explorer filtered to last 7 days](/images/20250510_CostExplorerLast7Days.png)

We can now add any filters or groupings we like, such as grouping costs by usage type to see what specify AWS service usages are contributing to our daily spending.

![Cost Explorer filtered to last 7 days, grouped by usage type](/images/20250510_CostExplorerLast7DaysGroupByUsageType.png)

## Granting cross-account user groups access to Cost Explorer

We need to explicitly grant user groups access to Cost Explorer, otherwise they will be denied by default.

Users with full read permissions across all AWS services will be able to view Cost Explorer after the earlier steps in this post, but we may want to allow additional user roles access as well.

See my last post's ["Creating cross-account role-based permission groups"]({% post_url 2025-05-07-aws-organizations %}) section for how to create a Permission Set and assign user groups these permissions on specific linked accounts.

To manage your Permission Sets, navigate to "IAM Identity Center" > "Multi-account permissions" > "Permission sets".

Assuming you have created a Permission Set that does not have explicit permissions to Cost Explorer, and you want that group to have read access to all cost management services, select that Permission Set.

In this case, I have a SupportUser Permission Set where I want my support team to be able to view cost and usage data for their assigned accounts.

![Enable linked accounts access to Cost Optimization Hub](/images/20250510_SupportUserPermissionSetWithoutBillingAccess.png)

While this Permission Set only has the SupportUser policy assigned, users logging in with this role will be denied access to all Cost Explorer widgets with the error:

> User: [REDACTED_ACCOUNT_ID]
>
> Service: [Cost Explorer]
>
> Name: [AccessDeniedException]
>
> HTTP status code: [400]
>
> Context: [User: arn:aws:sts::REDACTED_ACCOUNT_ID:assumed-role/REDACTED_ROLE_ID is not authorized to perform: ce:GetCostAndUsage on resource: arn:aws:ce:us-east-1:REDACTED_ACCOUNT_ID:/GetCostAndUsage because no identity-based policy allows the ce:GetCostAndUsage action]

Under the Permission Set's "Permissions" > "Inline policy" section, select "Edit".

Enter the following IAM policy document, or the scoped permissions you want to grant:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CostManagementViewAccess",
            "Effect": "Allow",
            "Action": [
                "account:GetAccountInformation",
                "aws-portal:ViewBilling",
                "billing:Get*",
                "billing:List*",
                "budgets:ViewBudget",
                "budgets:Describe*",
                "ce:Describe*",
                "ce:Get*",
                "ce:List*",
                "consolidatedbilling:Get*",
                "consolidatedbilling:List*",
                "cur:Describe*",
                "cur:Get*",
                "freetier:Get*",
                "sustainability:GetCarbonFootprintSummary"
            ],
            "Resource": "*"
        }
    ]
}
```

Scroll to the bottom of the page and save your changes.

Validate that users assigned this Permission Set on a given account now have read access to Billing and Cost Management pages.

![Support user now able to view Cost Explorer pages](/images/20250510_CostExplorerAccessAsSupportUser.png)

## Posts in this series

* [Using AWS Organizations to standardize security controls across AWS accounts]({% post_url 2025-05-07-aws-organizations %})
* (Current post) {{page.title}}

## References

AWS Organizations User Guide: [https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html)

AWS Cost Explorer Access User Guide: [https://docs.aws.amazon.com/cost-management/latest/userguide/ce-access.html](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-access.html)

AWS IAM Identity Center Permission Sets User Guide: [https://docs.aws.amazon.com/singlesignon/latest/userguide/permissionsetsconcept.html](https://docs.aws.amazon.com/singlesignon/latest/userguide/permissionsetsconcept.html)
