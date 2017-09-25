---
layout: post
title:  "Staging environments and deployment pipelines"
date:   2017-09-24 12:00:00 -0800
categories: software-development
excerpt: A staging environment mimics the environment our users interact with as closely as possible, so that we can verify changes and catch issues that may not occur on a local developer environment before promoting changes to production.
---
## Why have a staging environment?

A staging environment mimics the environment our users interact with as closely as possible, so that we can verify changes and catch issues that may not occur on a local developer environment before promoting changes to production.

There are often several differences between development and production environments: how services are deployed, which configuration settings are used, how assets and data are managed, and what data is available.

Every difference introduces a gap for issues to slip through even after careful testing.  Just in the last two weeks I've seen a few issues in staging that weren't reproduceable on a developer desktop.  We disabled the downstream pipeline and resolved the issues before promoting the changes to production.  None of these issues reached users, because we had a staging environment for catching them.

When we have a focused set of automated tests in place, incorporating a staging environment into our deployment pipeline can protect against losing availability due to breaking changes and improve our production service's overall quality, because incoming issues can be caught before they even have a chance to reach users.

## Staging environments and continuous deployment
*You've updated your field validation and added unit tests to cover the new behaviour.  After passing a code review, you push in your changes.  All unit and integration tests pass, so the changes are automatically promoted to your staging server.*

*End-to-end tests are run on your staging server, and one test fails because your UI hasn't been updated to respect the new validation rules.  The staging-to-production pipeline is automatically disabled, and you receive a notification of the failure.*

*You fix the bug and push the changes.  This time all tests pass, so the changes go out to production.*

One of the most powerful applications of staging environments is with continuous deployment.

By automating the promotion of code changes to our staging server, we can easily add additional types of automated tests to increase our confidence in our system, and have deployments happen *when the code is ready*, rather than when we have time to go through a manual process.

A tiered set of tests for each stage represents the increasing level of confidence we have in the code as it approaches production.

![alt text](/images/20170924_simple_deployment_pipeline.png "Example of a simple automated deployment pipeline")

Once all unit and integration tests pass, the code is ready for end-to-end tests that verify our API or user interface.  Requiring all low-level tests to pass before moving forward keeps our feedback loop fast and allows us to detect and diagnose issues sooner.

Once all end-to-end tests pass, we're fairly confident that basic functionality is working, and can run any performance or reliability tests.

After passing unit, integration, end-to-end, and performance tests, our code is ready for production.

## Is our project ready for continuous deployment?

A completely automated deployment pipeline is often considered the gold standard, but teams should have a reasonable set of unit and integration tests in place first.  When the quality of automated tests overtakes manual testing, we're ready for full continuous deployment.

If our testing isn't quite there yet (several critical use cases are lacking unit or integration tests), we may still want a manual approval step for promoting changes from staging to production, and that's perfectly fine.  Our customers' experience is more important than checking a box for full automation.

As our testing process matures we can get closer to automated deployments, until we're at the point where we're comfortable deploying multiple times per day.

## Manual testing with continuous deployment

With a focused set of integration and system tests that you add to as you develop new functionality, automated testing can quickly improve in both depth and breadth beyond what a developer or QA tester could manually go through for every code change.

However, manual testing is still important for catching use cases the developer may not have thought of, or where automation is too complicated to implement.

When we already know our basic functionality is working, manual testing can have the greatest impact, because the most obvious issues have already been covered and there can be more meaningful testing of our product.

## Summary

* Staging environments are most useful when they closely mimic the production environment.
* Verifying changes in staging allows issues to be caught before they impact users.
* Once the quality and coverage of automated testing supercedes manual testing, continuous deployment is a natural next step.
* Manual testing continues to bring value and can become more meaningful when basic functionality is covered by automated tests.
