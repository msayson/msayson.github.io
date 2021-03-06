---
layout: post
title:  "Diving into information security principles"
date:   2018-05-24 22:00:00 -0800
categories: security
excerpt: "<p>I'm interested in how information security can be better integrated into software development, and how services can be developed in a way that makes good security a natural part of the process.  It'll take a lot of effort to get there, but continual improvement in security is achievable at any scale.</p><p>There are new skills to develop and many segmented fields to learn from, which is both exciting and challenging, but the good thing is that there've been many lessons learned that we can take advantage of to develop more secure systems today.</p>"
---
I'm interested in how information security can be better integrated into software development, and how services can be developed in a way that makes good security a natural part of the process.  It'll take a lot of effort to get there, but continual improvement in security is achievable at any scale.

One of the reasons why it makes sense to build security into development is that many security-related challenges are much easier to address at the planning and design stages than during implementation and system testing, and a lot of this work requires both development and security skill sets.

For example, suppose that your payment system relies on being able to authenticate that a user has entered a correct password, but password verification only occurs on the client side and can be easily bypassed.  Suppose that this flaw is baked into your protocol and hardware, and you've already deployed this hardware to millions of customers.  While it could have been possible to fix this at the design phase, fixing it now could be prohibitively expensive.  Suppose that this has [already happened](https://www.cl.cam.ac.uk/research/security/banking/nopin/oakland10chipbroken.pdf), making passwords almost useless for a common payment system.

Many security fields have developed over the years, including encryption, network security, vulnerability scanning, and threat detection and remediation, but they can be completely undermined when the services they aim to protect are inherently insecure.

There are new skills to develop and many segmented fields to learn from, which is both exciting and challenging, but the good thing is that there've been many lessons learned that we can take advantage of to develop more secure systems today.

I'll dive into some of the security design principles that have evolved over the years, adding commentary as I go.  These posts are mostly for my own reference, with the hope that some of them will be interesting or helpful to other people as well.

{% include info-sec-principles-table-of-contents.html %}
