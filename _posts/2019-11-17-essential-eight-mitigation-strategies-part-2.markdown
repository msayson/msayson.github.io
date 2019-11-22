---
layout: post
title:  "Diving into the Essential Eight strategies to mitigate security incidents (part 2: limiting blast radius and recovering)"
date:   2019-11-17 20:00:00 -0800
categories: security
---
This is the second part of a deep dive into the Australian Cyber Security Centre's Essential Eight mitigation strategies, following up on [an overview of guides from the Australian Cyber Security Centre (ACSC)]({% post_url 2019-08-25-top-mitigation-strategies-from-acsc %}), and [a deep dive into the first four of the Essential Eight]({% post_url 2019-08-30-essential-eight-mitigation-strategies-part-1 %}).

To recap, the [Essential Eight](https://www.cyber.gov.au/publications/essential-eight-explained) are the ACSC's top eight recommended strategies for mitigating security incidents.  This post will focus on the last four mitigation strategies.

The Essential Eight are:

1. Application whitelisting
2. Patching applications
3. Configuring Microsoft Office macro settings
4. Hardening user applications
5. **Restricting administrative privileges**
6. **Patching operating systems**
7. **Multi-factor authentication**
8. **Daily backups**

For each of the highlighted strategies, I'll review security controls from the Australian [Information Security Manual](https://www.cyber.gov.au/ism) (ISM), incremental steps to achieve them following the [Essential Eight Maturity Model](https://www.cyber.gov.au/publications/essential-eight-maturity-model), and comments on the overall strategy.

## Restricting administrative privileges

_Privileged access in the ISM context refers to having extended permissions on systems or applications or access to confidential information._

### ISM security controls

* _Privileged access to systems, applications and information is validated when first requested and revalidated on an annual or more frequent basis._
* _Privileged access to systems, applications and information is limited to that required for personnel to undertake their duties._
* _Technical security controls are used to prevent privileged users from reading emails, browsing the web and obtaining files via online services._

### Maturity levels

|Level 1|Level 2|Level 3|
|-|-|-|
|Privileged access to systems, applications and information is validated when first requested.|Privileged access to systems, applications and information is validated when first requested <i>and revalidated on an annual or more frequent basis.</i>|Privileged access to systems, applications and information is validated when first requested <i>and revalidated on an annual or more frequent basis.</i>|
|<i>Policy</i> security controls are used to prevent privileged users from reading emails, browsing the Web and obtaining files via online services.|<i>Policy</i> security controls are used to prevent privileged users from reading emails, browsing the Web and obtaining files via online services.|<i>Technical</i> security controls are used to prevent privileged users from reading emails, browsing the Web and obtaining files via online services.|
|||Privileged access to systems, applications and information is limited to that required for personnel to undertake their duties.|
{:.table-with-minimal-border}

### Comments on restricting administrative privileges

If all users have administrative privileges on computers and shared services, then it's more serious when any account is hacked, since the attacker immediately has a broad range of actions they can take.  If they control an admin account on a computer, they can run any commands they like on it and can install malware or encrypt and hold files ransom.  If the user who was hacked has admin privileges to services across the company and multi-factor authentication is not required by those services, this expands the potential "blast radius" of the attack.

Admin privileges are a major prize for hackers for these reasons, and limiting access to privileges goes a long way to limiting the scope of attacks.  If few users have admin privileges and extended permissions to systems are only granted on an as-needed basis, then it's more likely for a hack to be isolated to specific computers and systems.

A general security principle known as the "[principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege)" states that users and software systems should have only the privileges that are required for them to be able to do their jobs, and following this is a highly effective way to reduce risk.

As referenced in the ISM security controls, in addition to only granting permissions as needed for business functions, it's worth annually reviewing the set of users with privileged access to services to remove permissions that are no longer needed.

## Patching operating systems

### ISM security controls

* _Security vulnerabilities in operating systems and firmware assessed as extreme risk are patched, updated or mitigated within 48 hours of the security vulnerabilities being identified by vendors, independent third parties, system managers or users._
* _An automated mechanism is used to confirm and record that deployed operating system and firmware patches or updates have been installed, applied successfully and remain in place._
* _Operating systems for workstations, servers and ICT equipment that are no longer supported by vendors with patches or updates for security vulnerabilities are updated or replaced with vendor-supported versions._

### Maturity levels

|Level 1|Level 2|Level 3|
|-|-|-|
|Security vulnerabilities in operating systems and firmware assessed as extreme risk are patched, updated or mitigated within <i>one month</i> of the security vulnerabilities being identified by vendors, independent third parties, system managers or users.|Security vulnerabilities in operating systems and firmware assessed as extreme risk are patched, updated or mitigated within <i>two weeks</i> of the security vulnerabilities being identified by vendors, independent third parties, system managers or users.|Security vulnerabilities in operating systems and firmware assessed as extreme risk are patched, updated or mitigated within <i>48 hours</i> of the security vulnerabilities being identified by vendors, independent third parties, system managers or users.|
|Operating systems for workstations, servers and ICT equipment that are no longer supported by vendors with patches or updates for security vulnerabilities are updated or replaced with vendor-supported versions.|Operating systems for workstations, servers and ICT equipment that are no longer supported by vendors with patches or updates for security vulnerabilities are updated or replaced with vendor-supported versions.|Operating systems for workstations, servers and ICT equipment that are no longer supported by vendors with patches or updates for security vulnerabilities are updated or replaced with vendor-supported versions.|
|||An automated mechanism is used to confirm and record that deployed operating system and firmware patches or updates have been installed, applied successfully and remain in place.|
{:.table-with-minimal-border}

### Comments on patching operating systems

Security vulnerabilities are regularly found and patched in operating systems and firmware, and exploits for known vulnerabilities are often "in the wild" before or soon after the patches are made available, depending on how easy the vulnerabilities are to discover and how quickly the vendors are able to fix the vulnerabilities after they've been reported.

Patching within a few days of major security updates being released helps your organization to stay ahead of many types of attacks and limit the scope of security incidents when malware gets onto an endpoint for any reason.  If vulnerabilities that the malware exploits in order to run commands locally and on other endpoints have been patched, then the device has effectively been innoculated, isolating the malware and preventing it from spreading.

The more devices across your network have been given their "immunization shots", the more likely that the resulting "herd immunity" will prevent malware that takes advantage of these operating system-level vulnerabilities from causing significant damage.

In some cases, a single unpatched host can serve as a stepping stone for malware to breach a network and use other techniques to spread to both patched and unpatched endpoints, such as if the malware is able to collect user credentials that it can use to access other devices and services.  This was the case with NotPetya, which was [one of the most destructive and illustrative examples of ransomware able to spread from unpatched to patched hosts](https://www.wired.com/story/notpetya-cyberattack-ukraine-russia-code-crashed-the-world/).  Any organizations that had one or more unpatched Windows computers exposed to the Internet were at risk.

Patching operating systems is easier than patching applications (which may differ widely between employees and be installed in any number of ways), however, it still takes some effort to set up a sane architecture that allows you to patch all endpoints in a timely manner with minimal overhead.

The easiest way to consistently patch computers across an organization is by setting up a centralized system for managing devices and deploying patches.  Some of these systems have additional features that allow you to monitor and isolate unpatched hosts to ensure that the patches are successfully applied before the host is allowed to access critical services, which can help to contain potential risks if a host is too many days or weeks behind a critical security update.

## Multi-factor authentication

### ISM security controls

* _Multi-factor authentication is used to authenticate all privileged users and any other positions of trust._
* _Multi-factor authentication is used to authenticate all users of remote access solutions._
* _Multi-factor authentication is used to authenticate all users when accessing important data repositories._
* _Multi-factor authentication uses at least two of the following authentication factors: passwords with six or more characters, Universal 2nd Factor (U2F) security keys, physical one-time password (OTP) tokens, biometrics or smartcards._

### Maturity levels

|Level 1|Level 2|Level 3|
|-|-|-|
|Multi-factor authentication is used to authenticate all users of remote access solutions.|Multi-factor authentication is used to authenticate all users of remote access solutions.|Multi-factor authentication is used to authenticate all users of remote access solutions.|
|Multi-factor authentication uses at least two of the following authentication factors: <i>passwords with six or more characters, Universal 2nd Factor security keys, physical one-time password tokens, biometrics, smartcards, mobile app one-time password tokens, SMS messages, emails, voice calls or software certificates.</i>|Multi-factor authentication uses at least two of the following authentication factors: <i>passwords with six or more characters, Universal 2nd Factor security keys, physical one-time password tokens, biometrics, smartcards or mobile app one-time password tokens.</i>|Multi-factor authentication uses at least two of the following authentication factors: <i>passwords with six or more characters, Universal 2nd Factor security keys, physical one-time password tokens, biometrics or smartcards.</i>|
||Multi-factor authentication is used to authenticate all privileged users and any other positions of trust.|Multi-factor authentication is used to authenticate all privileged users and any other positions of trust.|
|||Multi-factor authentication is used to authenticate all users when accessing important data repositories.|
{:.table-with-minimal-border}

### Comments on multi-factor authentication

I used to think that multi-factor authentication and other steps required after entering a username and password were just a pain in the neck, especially after poor experiences with a few services that required entering credentials, copying one-time codes from emails or text messages, and solving multiple rounds of captchas in order to log in.  These services were extremely frustrating to use.  Captchas aren't really a form of authentication since they are intended to be solvable by any human user, but I like to pick on them as an example of how poorly considered methods of protecting a service can make the user experience noticeably worse.

I still think that multi-factor authentication is a pain in many places it's implemented, but I also see the huge benefit of implementing it for services where the systems and information are critical to protect.  There are a range of more and less user-friendly ways to integrate multi-factor authentication into services, and choosing one that has minimal impact on your users while making it much less likely for an attacker to remotely take over an account can be a win-win for organizations, their employees, and customers.

Requiring a second form of authentication that requires physical access to the device, such as facial recognition, a thumbprint, or a YubiKey tap, may not be infallible, but it eliminates the risk of most remote attacks.  Passwords are terrible on their own, mostly because of how we use, choose, and re-use them, and if your users pick passwords that are easy to crack, it's not entirely their fault.  A strong second authentication factor can still save them and your services from being taken advantage of when their credentials are compromised.

[Google famously declared victory over account takeovers due to phishing attacks](https://krebsonsecurity.com/2018/07/google-security-keys-neutralized-employee-phishing/) a year after they transitioned their workforce to physical security keys for multi-factor authentication, and many companies who were concerned about phishing but hadn't yet transitioned took notice.  Some Google employees were still clicking on links from phishing emails and entering their credentials into malicious websites, but since physical access to the device was needed to complete authentication to internal services, it didn't matter that hackers had the usernames and passwords of some Google staff.  They couldn't use them anymore.

Authentication factors such as email and text messages are fine if you don't have the resources to do better, but they aren't as strong as authentication factors that require physical access to the endpoint.

In general, there are several types of authentication factors, including but not limited to the following:

* Knowledge, such as passwords ("something you know")
* Biometric data, such as fingerprints ("something you are")
* Possession of unique resources, such as physical security tokens ("something you have")
* Behaviour, such as the way you type or walk ("something you do")

Passwords are both the most weakest and the cheapest to implement, so they are unlikely to go away anytime soon, while biometric factors are becoming more common and inexpensive to authenticate.

Physical security tokens are more expensive since a unique token has to be distributed to each user, however they are well worth using to protect critical services and information, and many finance and technology companies that have a high security bar rely on physical tokens to authenticate their employees to internal systems.

## Daily backups

### ISM security controls

* _Backups of important information, software and configuration settings are performed at least daily._
* _Backups are stored offline, or online but in a non-rewritable and non-erasable manner._
* _Backups are stored for three months or greater._
* _Full restoration of backups is tested at least once when initially implemented and each time fundamental information technology infrastructure changes occur._
* _Partial restoration of backups is tested on a quarterly or more frequent basis._

### Maturity levels

|Level 1|Level 2|Level 3|
|-|-|-|
|Backups of important information, software and configuration settings are performed <i>monthly</i>.|Backups of important information, software and configuration settings are performed <i>weekly</i>.|Backups of important information, software and configuration settings are performed <i>at least daily</i>.|
|Backups are stored for at least <i>one month</i>.|Backups are stored for at least <i>one month</i>.|Backups are stored for at least <i>three months</i>.|
|Partial restoration of backups is tested <i>annually</i>.|Partial restoration of backups is tested <i>every six months</i>.|Partial restoration of backups is tested <i>quarterly</i>.|
||Backups are stored offline, or online but in a non-rewritable and non-erasable manner.|Backups are stored offline, or online but in a non-rewritable and non-erasable manner.|
||Full restoration of backups is tested at least once.|Full restoration of backups is tested at least once when initially implemented <i>and each time fundamental information technology infrastructure changes occur</i>.|
{:.table-with-minimal-border}

### Comments on daily backups

Unlike the other mitigation strategies discussed here, backups aren't focused on preventing or reducing the likelihood of security incidents.  They're instead focused on recovery, and are essential to recovering from any kind of system failure, accidental change, or security incident which may have impacted the integrity of your systems and data.

Being able to promptly restore services and data from a healthy state limits the damage from many security incidents, and can reduce otherwise crippling events into minor inconveniences.  If you lose access to all customer data and have no backups to recover from, it may be extremely costly or impossible to return to normal operations.  Sporadic manual backups are better than no backups, while automated, regular backups are necessary for long-term operations.

Not everything has to be backed up, only the systems and information that would be difficult to replace if they disappeared tomorrow.  For some organizations, there may be a few critical file servers, financial documents, and code repositories that would need to be recovered immediately, and other systems that are easily replaced.

Having virtual machine images and scripts for setting up most device configurations, and sourcing the content hosted on your servers from code repositories, may mean that you only need to back up a small subset of file systems on most of your servers, while other systems may need more complete backups.

When considering how frequently to schedule backups, it's worth asking how expensive it would be to roll back services a day, a week, or a month.  For most services, there's no reason not to have daily backups, and it may be desirable to maintain a month or so of daily backups, and less frequent snapshots that are retained for a longer period of time.

As important as setting up backups is testing that they are working as expected and can be easily used to restore service.

Short anecdote: In one of my prior positions, I accidentally deleted a file that was necessary for the service that I was setting up, and when I went to our automated backup service to recover from the last daily backup, I found out that the backup service wasn't actually working.  I was able to recover the file from a manual virtual machine snapshot from when the service was first installed, so it wasn't a problem, but this was a good "game day" that highlighted where server backups hadn't been tested, and therefore hadn't been shown to not be working until they were needed.  After a quick conversation, the automated backup service was fixed and validated to ensure that services would be able to rely on it going forward.

It's worth having a "game day" of critical services at least once to verify that you can actually recover from backups and identify gaps that need to be filled.  You can also use this chance to time how long it would actually take you to recover from a given service or file system going down.  This can usually be done without affecting production services by running the tests on spare servers, and it's far better to catch issues this way than to realize that you're missing a backup in an actual production situation.

Once you've hit the initial bar of having periodic backups for all critical services and data, the ISM makes an interesting point on the importance of these backups being stored in a way that ensures that they cannot be overwritten or deleted.  If backups are saved on the same devices as live data and in the same rewritable format, then if the server becomes infected with malware, both the live data and the backups may be compromised.  Likewise, if you have separate backup servers but the systems that push backups to them have permissions to overwrite or delete old backups, then it's possible for an attacker with access to those systems to wipe out all of your backups.  The first step is to have any backups at all, but once you've established automated backups, it's worth working on improving the security of how they're generated and stored to avoid these scenarios.

Backups are rarely called upon, but their important can't be stressed enough when they are needed.  I'd go as far as to say that if you don't already have backups set up for critical services and data, this should be prioritized ahead of other mitigation strategies.

## Effectiveness and difficulty scores

|Mitigation strategy|Potential user resistance|Upfront cost|Ongoing maintenance|
|-|-|-|-|
|**Restricting administrative privileges**|Medium|High|Medium|
|**Patching operating systems**|Low|Medium|Medium|
|**Multi-factor authentication**|Medium|High|Medium|
|**Daily backups**|Low|High|High|
{:.table-with-minimal-border}

## Summary

Restricting administrative privileges, patching operating systems, and implementing multi-factor authentication are effective strategies for limiting the impact of endpoint compromises, and daily backups are essential to quickly recover from a security incident or any event that you need to roll back.

Out of the four mitigation strategies, the Australian Cyber Security Centre rates patching operating systems as having the least relative effort to set up and maintain, since there are proven centralized mechanisms for deploying and monitoring system updates for many common environments.  There is still an up-front cost to set this up, but it's worth the effort and pays off as you scale up in the number of endpoints you have to manage.

Restricting administrative privileges and implementing multi-factor authentication are effective mitigation strategies that come with a higher upfront cost, and there is ongoing effort required to maintain them across new users and services.

Daily backups are necessary for any organization and have widely recognized value for both regular operations and recovery from security incidents.  They do come with an upfront and ongoing cost since backups need to be configured for new services.  You can reduce the pain involved by establishing best practises and easy-to-follow documentation, configuring a few sample services, and looking into automation for onboarding subsequent services.  However, there will always be some decisions that need to be made on a service-by-service basis as to what should be backed up and how.

## Posts in this series

* [Top mitigation strategies from the Australian Cyber Security Centre]({% post_url 2019-08-25-top-mitigation-strategies-from-acsc %})
* [Diving into the Essential Eight strategies to mitigate security incidents (part 1: preventing delivery and execution of malware)]({% post_url 2019-08-30-essential-eight-mitigation-strategies-part-1 %})
* (Current post) {{page.title}}

## Resources

The following are links to key articles and guides from the Australian Cyber Security Centre that I've referenced in this post:

* [Essential Eight Explained](https://www.cyber.gov.au/publications/essential-eight-explained)
* [Essential Eight Maturity Model](https://www.cyber.gov.au/publications/essential-eight-maturity-model)
* [Essential Eight to ISM Mapping](https://www.cyber.gov.au/publications/essential-eight-to-ISM-mapping)
* [Information Security Manual](https://www.cyber.gov.au/ism)
* [Strategies to Mitigate Cyber Security Incidents](https://www.cyber.gov.au/publications/strategies-to-mitigate-cyber-security-incidents)

