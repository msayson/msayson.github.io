---
layout: post
title:  "Developers must test"
date:   2016-08-21 20:30:00 -0800
categories: testing
---

#### Software developers must test their own software.

There is no way around it; no "buts", and especially no "but Quality Assurance does that for us".

Having an independent person functionally verify changes is a great practice, but should be done in addition to unit testing, not in place of it.

If software is not properly tested at the code level, problems will inevitably remain hidden for longer and become embedded into the system as it continues to grow in size and complexity.  Any developer can say how difficult it can be to triage issues from vague bug reports or inconsistent system behaviour, and even simple issues can sometimes take hours to track down and fix.

Many developers are warming up to the idea of writing unit tests and higher level functional tests.  It's now easy to find resources on how to effectively test software throughout the development cycle, and there are many excellent continuous integration tools that automatically run tests before pushing changes to the code base or generating a release build.

Even so, discomfort around testing and verifying software as a software developer still appears to be a problem in some workplaces, even at some well-established companies that rely on internally developed software as a major part of their business.

At a job fair I attended a few months ago, this came up with one of the recruiters I chatted with.  I asked her how their development team tested their software, and was looking forward to hearing about their testing practises since they were a fairly well-known software company.

She told me that I wouldn't need to write tests if I worked for them.  Their developers didn't worry about writing unit tests.  "Our Quality Assurance team takes care of testing for us!"  She smiled broadly as she said this, and I immediately resolved not to apply to them.

If you're comfortable with introducing testing practises to your team, by all means, you may be able to make a great impact at a company where testing is not the norm.  It is possible to gradually introduce changes where you can demonstrate great value for the least amount of effort.  Building out a minimal set of unit tests for the code you write and setting up continuous integration builds is a great place to start.

However, especially if you're looking to learn good development practises, it might be more productive to seek out companies that already integrate testing into their development process, and continually look for ways to improve the way they develop software.  This kind of environment naturally encourages self-development and creative exchange between teams, as developers learn from one another and rethink the way they build systems.

#### Automate where it makes sense to do so.

Software testing is important throughout the development lifecycle.  From the design stage to release and maintenance, an evolving web of user requirements must be balanced with time considerations and the existing code base.  The more complex the system becomes, the wider the effects of code changes at the base level, and the more important automated tests become.

Changes that break common functionality should not even be able to make it into a build, and will do so much less frequently if each code module is accompanied by a set of tests that are required to pass before code submission.

The great thing is that most continuous integration tools automate this process, and reduce it to the following:

1. Developer implements a feature with relevant unit tests.
2. Developer pushes the code changes.
3. Continuous integration system picks up the change and runs all applicable tests.
4. If any tests fail, the error log is saved and the developer is notified of the failure.  Otherwise, the change is integrated into the code base.

Whenever you implement a new feature or fix a bug, write a few simple tests to cover the behaviour, and add them to your test suite.

Now, if anything breaks functionality that your tests verify, you'll know before they get into the code base.

If you already have a large untested code base, writing tests for everything might not be immediately realistic.  Instead, you can write tests for areas that you work on, and gradually refactor code you touch to make the code base a better place, one step at a time.

Let's start writing tests!