---
layout: post
title:  "Security Engineering, by Ross Anderson"
date:   2016-06-24 20:30:00 -0800
categories: security
redirect_from: "/security/2016/06/25/security-engineering-by-ross-anderson"
---
"Security Engineering: A Guide to Building Dependable Distributed Systems", by Ross Anderson, is one of the most engaging technical books I've seen, and I've taken to reading it on my commute.

It's highly readable, unlike most textbooks, and provides an accessible view into the many areas of security.  The author has made the full book freely available online, so I highly recommend checking it out.

<!--more-->

{% include image.html img="/images/20160624_securityengineering_anderson_cover.jpg"
  title="Security Engineering - A Guide to Building Dependable Distributed Systems"
  url="https://www.cl.cam.ac.uk/~rja14/book.html" %}
<br>

Software Engineering 2/E website: [https://www.cl.cam.ac.uk/~rja14/book.html](https://www.cl.cam.ac.uk/~rja14/book.html)

The second edition was published in 2008, but because of its coverage and wide applicability it continues to be an important text for software developers and security professionals.  It gives an overview of topics including systems security, authentication methods, operational security (training staff to resist external attacks), physical and digital protection of information, and network attack and defense.

Some areas have moved on, but a lot of the material remains relevant.  Organizations and individuals increasingly depend on software to connect, communicate, bank, shop, travel*, and do business, and software engineers are correspondingly called upon to develop systems that can work reliably under stress and unintended use.  For systems that work with confidential or otherwise sensitive information, it's also becoming more important to be able to resist and recover from attacks from parties that seek to obtain that information or otherwise subvert the system for personal gain.

*Cars and particularly planes have an incredible amount of software these days, rendering many pilots back-up operators rather than active controllers.

It's a very different kind of thinking that goes into designing a system that has to be able to withstand the efforts of a motivated attacker, on top of satisfying the evolving requirements of its users.  Thinking from the perspective of an attacker gives a lot of insight into which areas of your system might be most vulnerable and worth protecting, where and how you or your customers might be targeted, and how you might harden your defences and deter would-be attackers.

For example, it's a useful exercise to consider what an attacker could do if they obtained access to your network, or to a customer's account.  What would they be able to access on the system?  What kind of personal or financial information would they be able to read, modify, or delete?  How long would it take for you to notice that a system or account had been compromised, and how would you be able to respond?  If you go down that road and find that some intrusions would be highly damaging, then it's worth considering how you can decrease the probability of such intrusions, and limit the impact when they occur.

Again, the book is freely available on the author's website, so it's worth a look if you're interested!
