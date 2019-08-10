---
layout: post
title:  "JDK distributions, JDK distributions everywhere"
date:   2019-08-09 12:00:00 -0800
categories: programming-languages
excerpt: Taking a look at the number of JDKs, I'd like to start from a simple set of criteria to pick one to use for a new project, assuming zero budget and a desire for maximum flexibility.
---
### The end of Oracle JDK's free long-term support (LTS) builds

In 2018, [Oracle announced plans to stop providing free LTS JDK builds for production services](https://blog.joda.org/2018/09/do-not-fall-into-oracles-java-11-trap.html), triggering a stream of angry and confused posts and prompting more developers to consider moving to alternative JDK distributions.

A year later, the number of production-ready JDK distributions has blossomed, more companies are building their own (you can now pick between Oracle, Red Hat, IBM, SAP, Bellsoft, Amazon, Alibaba, Azul, etc.), and it's more difficult to decide which one to use.

This is almost like choosing a Linux distribution!  Taking a look at the number of JDKs, I'd like to start from a simple set of criteria to pick one to use for a new project, assuming zero budget and a desire for maximum flexibility.

[DevExperts](https://devexperts.com/blog/oracle-jdk-vs-openjdk-builds-comparison/) put out a good comparison of JDK distributions in February 2019, and while it doesn't include some JDK builds and may become dated, it was very helpful for a first pass.  They compare Oracle JDK, Oracle OpenJDK, Red Hat OpenJDK, Azul Zulu, Amazon Corretto, and AdoptOpenJDK.

### My requirements for a JDK build

* It must be free for use in development and deployment.
* It must support development and deployment across operating systems (Linux, Windows, Mac OS X).
* It must be verified as compliant with the Java specification (eg. Technology Compatibility Kit compliant, or TCK-compliant).

I would prefer a JDK build which offers long-term support (1-2+ years) with the guarantee of security updates.  Long-term support doesn't matter if you keep everything up-to-date at all times, but in practise it's nice to have the extra breathing room.

### JDK builds considered, in alphabetical order

* [AdoptOpenJDK](https://adoptopenjdk.net/)
* [Alibaba Dragonwell8](https://github.com/alibaba/dragonwell8)
* [Amazon Corretto](https://aws.amazon.com/corretto/)
* [Azul Zulu](https://www.azul.com/downloads/zulu-community/)
* [Liberica JDK](https://bell-sw.com/pages/java-12.0.2/)
* [Oracle JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html)
* [Oracle OpenJDK](https://jdk.java.net/)
* [Red Hat OpenJDK](https://developers.redhat.com/products/openjdk/overview)
* [SapMachine](https://sap.github.io/SapMachine/)

### Filtering out builds with paid licenses

Oracle JDK charges licensing fees for Java 11 onwards based on how many hosts your application is installed on, which rules it out.  Oracle OpenJDK is free, and has a 6-month support cycle after which point you have to migrate to a newer release to continue receiving security updates.

Red Hat OpenJDK is only free to use on Red Hat Enterprise Linux (RHEL) distributions, which require paid per-host licenses.  This rules it out for my use case since I'd like to run on machines besides RHEL hosts, while it wouldn't be a factor at workplaces where RHEL hosts are already used.

Azul Zulu's OpenJDK community builds do not have long-term support, and their enterprise builds charge licensing fees based on the number of hosts running your application.

### Filtering out builds without cross-platform support

This rules out Alibaba Dragonwell8, which only supports Linux x64 as of August 2019.

### Filtering out builds which are not TCK-compliant

AdoptOpenJDK is one of the easier non-Oracle distributions to find, however, due to licensing difficulties they are not TCK-compliant and do not support certain tools such as JavaFX.

### Comparing the remaining JDK builds

Out of the builds that are free to deploy, multi-platform, and TCK-compliant, Oracle OpenJDK and Azul Zulu's community edition unfortunately do not provide long-term support.

In a [September 2018 blog post from Oracle](https://blogs.oracle.com/java-platform-group/oracle-jdk-releases-for-java-11-and-later), Oracle announced that their OpenJDK would be almost identical to their commercial JDK for Java 11 onwards, which makes it likely that Oracle OpenJDK for Java 11+ will work out-of-the-box with most development tools.  For this reason, I prefer Oracle OpenJDK over Azul Zulu's community edition.

Amazon Corretto, Liberica JDK, and SapMachine are free, cross-platform, TCK-compliant, and provide long-term support builds.  It's difficult to find good comparisons between them, and Liberica JDK and SapMachine seem to be targeted towards Bellsoft and SAP customers.

Amazon Corretto is an open-source distribution provided by Amazon under the same open-source license as OpenJDK, and adds performance and security improvements.  It is fairly new, having been publicly released in January 2019, and as per [the product FAQ](https://aws.amazon.com/corretto/faqs/), it is used internally on thousands of production services at Amazon and has satisfying support terms.  Corretto 8, which builds on OpenJDK 8, will be supported for free until June 2023, and Corretto 11, which builds on OpenJDK 11, will be supported for free until August 2024.

This leaves Oracle OpenJDK and Amazon Corretto as my main JDK builds under consideration, while there are doubtless more alternatives out there.

I haven't used Amazon Corretto before, but will try it out and see how it goes.