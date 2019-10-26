---
layout: post
title:  "Diving into the Essential Eight strategies to mitigate security incidents (part 1: preventing delivery and execution of malware)"
date:   2019-08-30 12:00:00 -0800
categories: security
---
I introduced some of the security guides published by the Australian Cyber Security Centre and their [Essential Eight](https://www.cyber.gov.au/publications/essential-eight-explained) mitigation strategies for businesses [in my last post]({% post_url 2019-08-25-top-mitigation-strategies-from-acsc %}), and I'd like to dive deeper into the first four mitigation strategies for preventing delivery and execution of malware.

The Essential Eight mitigation strategies:

1. **Application whitelisting**
2. **Patching applications**
3. **Configuring Microsoft Office macro settings**
4. **Hardening user applications**
5. Restricting administrative privileges
6. Patching operating systems
7. Multi-factor authentication
8. Daily backups

The [Essential Eight to ISM Mapping](https://www.cyber.gov.au/publications/essential-eight-to-ISM-mapping) guide recommends specific security controls to implement for each of these mitigation strategies, and reflects a subset of controls from the [Australian Cyber Security Centre's Information Security Manual](https://www.cyber.gov.au/ism) (ISM).

## Application whitelisting
ISM security controls:

* _An application whitelisting solution is implemented on all workstations to restrict the execution of executables, software libraries, scripts and installers to an approved set._
* _An application whitelisting solution is implemented on all servers to restrict the execution of executables, software libraries, scripts and installers to an approved set._
* _Microsoft's latest recommended block rules are implemented to prevent application whitelisting bypasses._

Why use a whitelist?  The number of malware signatures that need to be blocked is constantly growing and it's becoming more common for malware to automatically mutate to avoid being recognized, so blacklists that block specific malware signatures will always be behind the curve.  On the other hand, if you have a controlled list of trusted applications, you can block all others by default.

If you can pull it off, this mitigation is quite powerful since it effectively blocks a large subset of malware from ever being activated, even if rogue executables make it past your initial defenses or are built on your machines.  Malware will eventually get through, but if it can't run via normal means, the bar to entry just got a lot higher for attackers.

### Servers are simpler to manage
Servers should require a more limited set of applications than workstations, and should in fact have any unnecessary applications removed to reduce the number of points that need to be protected and kept up to date.  This makes them a good candidate for application whitelisting.  Servers also often handle companies' critical systems and data, so they are both targets for attackers and a priority to protect.

### Workstations: much more work but may be feasible?
At first glance, it seems like working in an environment that uses a whitelist approach for running applications would be cumbersome for teams that rely on a large and ever-changing set of software, specifically software development teams.

However, reputation-based approaches for whitelisting trusted vendors based on digital signatures may significantly reduce the required effort, since you can approve all future software from a software publisher in a single rule.

Also, most companies will likely have a baseline of applications that are commonly used, with a long tail of less common applications that a security team may need to evaluate before approving for all subsequent downloaders.

The more heterogenous your teams and their workflows are, the harder it will be to maintain this whitelist, and keeping an approval process running smoothly and efficiently will likely require dedicated time from security engineers to ensure that employees can be unblocked in a reasonable amount of time while minimizing the likelihood of allowing malware through.

### Test and monitor before enforcing
An application whitelist that is enforced, by definition, blocks any applications not on the whitelist from running.  If you haven't verified that all of the applications required for your systems to function have been whitelisted, enforcing the whitelist could cause a service outage.

To avoid this, many guides such as those by the US National Institute of Standards and Technology and the US Department of Homeland Security [[1](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-167.pdf), [2](https://www.us-cert.gov/sites/default/files/documents/Guidelines%20for%20Application%20Whitelisting%20in%20Industrial%20Control%20Systems_S508C.pdf)] suggest taking the time to establish a baseline of all required services for the whitelist, monitoring for long enough to capture and audit both common and uncommon system use cases, and running in an alerting mode rather than a blocking mode in the beginning, or even in perpetuity if an inaccurate block would have a severe impact.

It's important to verify whether running applications not on your whitelist are legitimate before adding them, otherwise you may put yourself into the uncomfortable scenario of incorrectly marking malware that's already on your systems as trusted and missing current and future compromises associated with that malware.

If you do leave your application whitelist in an alerting mode to avoid causing outages, then it will no longer act as a preventative control, while it can still provide a lot of value as a way to detect potential bad activity, _if you are actively monitoring the alerts_.  If you iterate on validating and whitelisting new trusted applications and follow up on applications that are against policy and either remove them or work with the teams relying on the applications to help them follow policy, then the alerts should yield fewer false positives over time, and any alerts should be able to be taken seriously.

If you have the capability to automatically quarantine systems with unauthorized applications until you have added them to your whitelist or the user has removed them, that may reduce your risk level without requiring blocking mode.

If you're confident that you will not break functionality by enabling blocking mode and have been running in alert mode for long enough to cover all applications that should be allowed to run, you can switch from alerting mode to blocking mode and transform this into a preventative control that automatically blocks untrusted executables from running.

## Patching applications
ISM security controls:

* _Security vulnerabilities in applications and drivers assessed as extreme risk are patched, updated or mitigated within 48 hours of the security vulnerabilities being identified by vendors, independent third parties, system managers or users._
* _An automated mechanism is used to confirm and record that deployed application and driver patches or updates have been installed, applied successfully and remain in place._
* _Applications that are no longer supported by vendors with patches or updates for security vulnerabilities are updated or replaced with vendor-supported versions._

A 48-hour patching window is ambitious, but may be possible if you design your infrastructure in such a way that you can automatically and securely deploy patches.  Many companies implement mechanisms to automatically quarantine workstations that are out of compliance to prevent them from accessing the Internet or sensitive internal resources until the user has installed important updates.

Note also how the first bullet point implies being able to respond when critical vulnerabilities are reported for any of your applications, in turn implying the need to be aware of all installed applications and monitoring and acting on vulnerability advisories, or automatically updating your applications as soon as patches become available.  This function may require dedicated resources to properly vet, prioritize, and schedule patches that have to be rolled out to applicable systems.

For truly critical vulnerabilities that would cause a major business impact if exploited, it may be necessary to move this quickly, but more vulnerabilities, any patching window is better than none.

The [Essential Eight Maturity Model](https://www.cyber.gov.au/publications/essential-eight-maturity-model) has a first maturity level that involves patching vulnerabilities with extreme risk within a month, a second maturity level patching within two weeks, and a third maturity level within two days.  If you can ensure that security patches are installed within a month for critical vulnerabilities across your systems, you're in a much better world than the majority of companies that have been hacked due to unpatched vulnerabilities since [most exploited vulnerabilities have had patches available for years](https://www.csoonline.com/article/3075830/zero-days-arent-the-problem-patches-are.html), and you can work on incrementally improving your window to reduce your risk level.

The second bullet point, an automated mechanism to confirm successful application of patches and verify that they stay in place, is a doozie.  This security control is in the third maturity level, and is an advanced function that can provide validation of patching efforts as well as alert you of rollbacks to insecure versions of applications.

The final bullet point, updating or replacing applications that are no longer supported with security updates, should be universally followed.  If you rely on software that is past its end-of-life date, the list of known vulnerabilities for that software is likely to pile up over time and encourage exploitation.  End-of-life software is a favourite target of hackers and malware writers, since exploits can be reused again and again, and should be avoided at all costs.

It may be prudent to maintain a central repository of trusted software that is used across your company to deploy to your hosts or allow hosts to download from, and to maintain the last few known good major versions so that you can easily rollback if there turns out to be a major bug introduced by the latest version of a given application.

## Configuring Microsoft Office macro settings
ISM security controls:

* _Microsoft Office macros are only allowed to execute in documents from trusted locations where write access is limited to personnel whose role is to vet and approve macros._
* _Microsoft Office macros in documents originating from the Internet are blocked._
* _Microsoft Office macro security settings cannot be changed by users._

In 2016 Microsoft announced that [1.2 billion people were using Microsoft Office products](https://www.windowscentral.com/there-are-now-12-billion-office-users-60-million-office-365-commercial-customers), so yes, Office is pretty popular.  Macros, small programs embedded in Office documents, are also popular, especially among power users who have the need to automate repetitive tasks and generate complex reports.

However, by the very design of how Microsoft Office products allow user-defined macros to be written and executed willy-nilly, often with broad permissions, [there has been a steady flow of macro-related vulnerabilities for years](https://insights.sei.cmu.edu/cert/2016/06/who-needs-to-exploit-vulnerabilities-when-you-have-macros.html).  Attackers commonly use them to embed malware in Office documents that they can distribute widely through email, infecting any recipients who open the documents.

Configuring Office applications to block macros in documents from untrusted sources can help to mitigate against this method of delivering malware.

Why continue to allow macros at all?  You may prefer to block all use of macros, but they are undeniably useful, and there's arguably less risk from those that your users have written.  This does allow for the odd chance that an employee copies malicious macro code from the Internet, however, that may be an acceptable risk in return for not disrupting normal workflows.

## Hardening user applications
ISM security controls:

* _Web browsers are configured to block or disable support for Flash content._
* _Web browsers are configured to block web advertisements._
* _Web browsers are configured to block Java from the Internet._
* _Microsoft Office is configured to disable support for Flash content._
* _Microsoft Office is configured to prevent activation of Object Linking and Embedding packages._

Hardening is the process of reducing the available points of attack on a system, removing or deactivating potentially vulnerable functionality that is not needed, and/or setting up other protections to make exploitation more difficult for attackers.

The listed browser and Office features are rarely necessary for day-to-day work, while they're popular vectors for malware, so it can make sense to block them by default and avoid users accidentally running malicious code or being redirected to untrusted websites.  At the very least, Flash and Java applets should be blocked by default in web browsers.  Most modern websites are moving towards HTML5 and other technologies in place of Flash, given its poor reputation.

You can go further in hardening your systems by uninstalling unused applications that have ports that are open to the Internet or which have elevated privileges, and there are excellent hardening guides online for most operating systems.  The Essential Eight guide focuses on web browser and Office configuration for giving significant security benefit for minimal effort.

## Effectiveness and difficulty scores

The Australian Signals Directorate (ASD) [Strategies to Mitigate Cyber Security Incidents](https://www.cyber.gov.au/publications/strategies-to-mitigate-cyber-security-incidents) guide covers a number of mitigation strategies from the Information Security Manual including the Essential Eight, and their guide suggests order of implementation based on effectiveness scores, as well as measures of the effort required to implement them, which is helpful and somewhat rare to see in this clear a format.

Relative security effectiveness ratings range from Limited to Essential, and as per their name, the Essential Eight are the mitigation strategies that are seen as essential based on their effectiveness at mitigating information security events.

The mitigation strategies covered in this post have the following difficulty scores in the ASD guide:

|Mitigation strategy|Potential user resistance|Upfront cost|Ongoing maintenance|
|-|-|-|-|
|**Application whitelisting**|Medium|High|Medium|
|**Patching applications**|Low|High|High|
|**Configuring Microsoft Office macro settings**|Medium|Medium|Medium|
|**Hardening user applications**|Medium|Medium|Medium|

Not surprisingly, it's fairly difficult to implement application whitelisting, particularly in blocking mode.  However, servers that are used for specific business functions (eg. email servers, Sharepoint servers, payment processing servers) may be easier to begin with as well as a higher priority to protect.  Whitelisting in these domains can help you to build familiarity with best practises before moving on to client devices.  Once you've set up a good baseline and validated that your whitelist works, it's easier to maintain while still requiring attention as applications are added, replaced, or updated.

Patching applications is the most widely accepted mitigation strategy of the four, while it has high upfront and maintenance costs as you need to implement a streamlined process for managing applications across all of your systems, detecting when security patches become available, vetting and scheduling patches, deploying those patches to all applicable systems, and verifying that those patches have been installed.

Configuring Office macro settings and hardening the highlighted user applications are easier mitigations since there are just a few steps that need to be taken when setting up each workstation, while you may want automatic monitoring for changes to those settings to ensure that your work isn't undone.

## Summary
There are always new ways to deliver and run malware, and these strategies won't cover all of them.  However, they make it much more difficult for attackers to compromise your system, and even if partially implemented can help detect when a compromise is being attempted.

Application whitelisting is a very powerful tool if you can maintain an accurate baseline of trusted applications, and in blocking mode it can prevent entire categories of malware from running.

It's safer to start in alerting mode, which automatically detects when unauthorized applications are run, and you can implement automated mechanisms for notifying yourself when an alert is triggered.

Patching applications is necessary for any business, and just focusing on patching high criticality vulnerabilities on a monthly basis can protect you from the most common malware.  The more you can automate the process by which software is deployed to your machines, the easier it will be to shorten your patching cycles, until it's a breeze to patch critical vulnerabilities the same day fixes are released.

Disabling insecure settings in web browsers and Microsoft Office applications is fairly straightforward, and ideally you can preconfigure clients to start off with secure settings and monitor for reversions so that you can fix or quarantine hosts that are breaking policy.

Together with the rest of the Essential Eight, these mitigation strategies form an excellent security baseline that you can work towards one concrete step at a time.

In a follow-up post I'll dive into the last four Essential Eight mitigation strategies:

* Restricting administrative privileges
* Patching operating systems
* Multi-factor authentication
* Daily backups

## Resources

The Australian Cyber Security Centre:

* [Essential Eight Explained](https://www.cyber.gov.au/publications/essential-eight-explained)
* [Essential Eight Maturity Model](https://www.cyber.gov.au/publications/essential-eight-maturity-model)
* [Essential Eight to ISM Mapping](https://www.cyber.gov.au/publications/essential-eight-to-ISM-mapping)
* [Information Security Manual](https://www.cyber.gov.au/ism)
* [Strategies to Mitigate Cyber Security Incidents](https://www.cyber.gov.au/publications/strategies-to-mitigate-cyber-security-incidents)

The US National Institute of Standards and Technology:

* [Guide to Application Whitelisting](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-167.pdf)

The US Department of Homeland Security:

* [Guidelines for Application Whitelisting in Industrial Control Systems](https://www.us-cert.gov/sites/default/files/documents/Guidelines%20for%20Application%20Whitelisting%20in%20Industrial%20Control%20Systems_S508C.pdf)
