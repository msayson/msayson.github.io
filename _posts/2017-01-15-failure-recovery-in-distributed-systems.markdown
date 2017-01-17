---
layout: post
title:  "Failure recovery in distributed systems"
date:   2017-01-15 18:00:00 -0800
categories: distributed-systems
---

Failure recovery is an interesting problem in many applications, but especially in distributed systems, where there may be multiple devices participating and multiple points of failure.

It's very education to identify the distinct roles in a system, and ask for each one, "What would happen if *that* part of the system failed?"

There are several types of failures that come up in practise, including but not restricted to the following.

* Network failures: participants are still running, but the connection between two or more is lost, or one or more messages are dropped before reaching the the recipient.  Some systems may also have issues with unexpected delays in message delivery.
* Crash failures: a participant shuts down unexpectedly.  This can occur as a result of application or environment errors, or simply a loss of power.
* Byzantine failures: a participant may act arbitrarily.  This may be due to an adversary taking control of a server, after which they may actively attempt to undermine the system.  Byzantine failures remain an open research area, and are often difficult to handle unless the system was explicitly designed with potentially compromised participants in mind.
* Simultaneous or repeated failures: these are somewhat meta-failures, in which multiple participants fail at the same time, or a single participant experiences recurring failures.

Fault tolerant systems are those that are able to survive common failures and continue providing service even while failures are occurring.

A lot of the work that results in failure recovery occurs at the design level of a system, so it's useful to consider the types of failures that may occur, the expected frequency and impact of failures, and design choices that may reduce the risk of failures impacting our users.

Common questions to ask include:

* What are the participants in the system?  What are their roles?
* What interactions occur between participants in the system?
* What happens when a participant crashes during or between transactions?
* How can we ensure that our system remains in a good state after a given participant crashes?
* How can we ensure that we continue providing service after an arbitrary server or client crashes or goes offline?
* Are there simple design choices we can make to allow us to recover from a failure and continue providing service?
* How can we best test our distributed systems, including testing of failure recovery?

Helpful resources:

* Course notes from UBC CPSC 416: Distributed Systems: [http://www.cs.ubc.ca/~bestchai/teaching/cs416_2015w2/index.html](http://www.cs.ubc.ca/~bestchai/teaching/cs416_2015w2/index.html)
