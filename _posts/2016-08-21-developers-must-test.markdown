---
layout: post
title:  "Developers must test"
date:   2016-08-21 20:30:00 -0800
categories: software-development
excerpt: "Software developers must test their own software.  There's no way around it, and especially no \"but Quality Assurance does that for us.\""
---

#### Software developers must test their own software.

There's no way around it, and especially no "but Quality Assurance does that for us."

Having an independent person functionally verify changes is a great practice, and should be done in addition to unit testing.

If software isn't properly tested at the code level, problems inevitably remain hidden for longer and become embedded into the system as it grows in complexity.  Any developer can talk about how difficult it can be to triage issues from vague bug reports or inconsistent system behaviour, and even simple issues can sometimes take hours to track down and fix.

Many developers are warming up to the idea of writing unit tests and higher level functional tests.  It's now easy to find resources on how to effectively test software throughout the development cycle, and there are many excellent continuous integration tools that automatically run tests before pushing changes to the code base or generating a release build.

Even so, discomfort around verifying and writing tests for software as a software developer appears to persist in some workplaces, even at established companies that rely on internally developed software for a major part of their revenue.

At a job fair I attended a few months ago, this came up with one of the recruiters I chatted with.  I asked her how their development team tested their software, and was looking forward to hearing about their testing practices since they were a fairly well-known software company.

She told me that I wouldn't need to write tests if I worked for them.  Their developers didn't worry about writing unit tests.  "Our Quality Assurance team takes care of testing for us!"  She smiled broadly as she said this, and I immediately resolved not to apply to them.

This might seem extreme, but not writing unit tests is a major red flag, and suggests significant development and maintenance challenges down the road.

If you're comfortable with introducing testing practices to your team, by all means, you may be able to make a great impact at a company where testing isn't the norm.  You can take time to listen first, to learn how their team works and adapt to their processes.  You're in a much better place to suggest changes once you've proven yourself and established strong relationships with the rest of your team.

It is possible to gradually introduce changes where you can demonstrate great value for the least amount of effort.  Building out a minimal set of unit tests for the code you write and setting up continuous integration builds is a great place to start.

However, especially if you're looking to learn good development practices, it might be more productive to seek out companies that already integrate testing into their development process, and continually look for ways to improve the way they develop software.  This kind of environment naturally encourages self-development and creative exchange between teams, as developers learn from one another and rethink the way they build systems.

#### Automate where it makes sense to do so.

The more complex a system becomes, the wider the effects of code changes at the base level, and the more important automated tests become.

Changes that break common functionality shouldn't even be able to make it into a build, and will do so much less frequently if each code module is accompanied by a set of tests that are required to pass before code submission.

The great thing is that most continuous integration tools automate this process, and reduce it to the following:

1. Developer implements a feature with relevant unit tests.
2. Developer pushes the code changes.
3. Continuous integration system picks up the change and runs all applicable tests.
4. If any tests fail, the error log is saved and the developer is notified of the failure.  Otherwise, the change is integrated into the code base.

Whenever you implement a new feature or fix a bug, write a few simple tests to cover the behaviour, and add them to your test suite.

Now, if anything breaks functionality that your tests verify, you'll know before they get into the code base.

If you already have a large untested code base, writing tests for everything might not be realistic.  Instead, you can write tests for areas that you work on, and gradually refactor code you touch to make the code base a better place, one step at a time.

Let's start writing tests!