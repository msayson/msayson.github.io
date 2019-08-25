---
layout: post
title:  "Top Mitigation Strategies from the Australian Cyber Security Centre"
date:   2019-08-24 19:00:00 -0800
categories: security
---
The [Australian Cyber Security Centre](https://www.cyber.gov.au/) provides a substantial amount of clear and actionable information on how to improve an organization's security posture, ranging from basic guides for organizations that are just establishing their security teams, to its regularly updated [Australian Government Information Security Manual](https://www.cyber.gov.au/ism), often referred to as the ISM.

## The [Australian Information Security Manual](https://www.cyber.gov.au/ism) (ISM)
The self-described purpose of the ISM is "to outline a cyber security framework that organisations can apply, using their risk management framework, to protect their information and systems from cyber threats."  It describes guiding principles and describes a broad range of recommended security controls, with provided applicability and priority scores.  I mean it when I say broad, it ranges from patching programs, to system backups, to network security monitoring, to email management, to appropriate measures for destroying hard disks that store sensitive information.

While the ISM doesn't get too deep into each security control, it provides enough of them for the manual to be a bit much at first glance, although there's a lot of gold in there.

## The [Essential Eight](https://www.cyber.gov.au/publications/essential-eight-explained)
A better starting point is their Essential Eight, a paired down set of mitigation strategies which can significantly improve an organizations security posture on their own.

These consist of:

1. **Application whitelisting**
2. **Patching applications**
3. **Configuring Microsoft Office macro settings**
4. **Hardening user applications**
5. **Restricting administrative privileges**
6. **Patching operating systems**
7. **Multi-factor authentication**
8. **Daily backups**

Implementing whitelist policies for trusted applications which are able to run on client devices, patching applications and operating systems regularly, only allowing Office trusted macros to run, and hardening user applications by blocking insecure features by default, are all effective strategies to mitigate malware delivery and execution.

Restricting administrative privileges (whether to systems, applications, or users) and requiring multi-factor authentication for access to sensitive resources can significantly limit the impact of security incidents, and daily backups of systems and data are essential to quickly recover when outages occur for any reason.

The [Essential Eight Maturity Model](https://www.cyber.gov.au/publications/essential-eight-maturity-model) provides incremental steps to implement each mitigation strategy, assisting organizations with setting clear and achievable milestones.  Each mitigation strategy has three maturity levels, starting with the easiest to implement and increasing in capability in successive levels.

For example, Maturity Level One recommends patching operating systems and firmware with high-risk security vulnerabilities within one month of the vulnerabilities being identified by vendors or internal/external parties, with the target patching timeline improving to two weeks in Maturity Level Two, and 48 hours in Maturity Level Three.

Ideally, security patches would be tested and applied immediately after becoming available, since exploits are often available before or soon after the vulnerabilities are publically announced.  However, it takes time to build up the necessary infrastructure to do this and the maturity model recognizes this and provides a practical approach to get there in stages.  Achieving the first maturity level of a mitigation strategy provides a clear benefit over a baseline of having no strategy in place.

Similarly, the first maturity level starts with monthly backups of important information, stored for up to three months, and recommends testing restoration from backups at least once annually, and the third maturity level builds up to daily backups with quarterly backup recovery tests.

## Summary
The guides by the Australian Cyber Security Centre are some of the best resources I've seen online, and may help any organization that is developing their security team, whether they're just getting started or are seeking additional sources of tried and tested security controls they can apply to protect their organizations and their customers.

## Resources

* [Essential Eight Explained](https://www.cyber.gov.au/publications/essential-eight-explained)
* [Essential Eight Maturity Model](https://www.cyber.gov.au/publications/essential-eight-maturity-model)
* [Essential Eight to ISM Mapping](https://www.cyber.gov.au/publications/essential-eight-to-ISM-mapping)
* [The Australian Information Security Manual](https://www.cyber.gov.au/ism)
* [Australian Cyber Security Centre publications](https://www.cyber.gov.au/publications)
