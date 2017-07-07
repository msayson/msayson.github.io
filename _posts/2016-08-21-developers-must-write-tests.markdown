---
layout: post
title:  "Developers must write tests"
date:   2016-08-21 20:30:00 -0800
categories: software-development
excerpt: "<p>Software developers must test their own code.  There's no way around it, and especially no \"but Quality Assurance does that for us.\"</p>"
redirect_from:
  - "/software-development/2016/08/22/developers-must-test"
  - "/blog/developers-must-test/"
---

#### Software developers must test their own code.

There's no way around it, and especially no "but Quality Assurance does that for us."

Having an independent person functionally verify changes is a great practice, and should supplement rather than replace unit testing.

If software isn't properly tested at the code level, problems inevitably remain hidden for longer and become embedded into the system as it grows in complexity.

Many developers are warming up to the idea of writing unit tests and higher level functional tests, and it's easy to find good resources on effective testing of software throughout the development cycle.  Test automation keeps improving, and many continuous integration tools now automatically verify tests before pushing changes to the code base or generating builds.

Even so, discomfort around writing and verifying tests seems to linger at some workplaces, even at a few established companies that rely on internally developed software for most of their revenue.

This came up in a conversation I had with a recruiter at a university job fair.  I asked her how their development team tested their software, and was looking forward to hearing about their testing practices since they were a fairly well-known software company.

She told me that I wouldn't need to write tests if I worked for them.  Their developers didn't worry about unit tests.  "Our Quality Assurance team takes care of testing for us!"  She smiled broadly as she said this, and I immediately resolved not to apply to them.

This might seem extreme, but not writing unit tests is a major red flag, and suggests significant development and maintenance challenges down the road.

If you're comfortable with introducing testing practices to your team, by all means, you might be able to make a great impact at a company where testing isn't the norm.  Once you've proven yourself and established strong relationships with the rest of your team, it is possible to introduce changes where you can demonstrate great value for the least amount of effort.  Building out a minimal set of unit tests for the code you write and setting up continuous integration builds is a great place to start.

However, especially if you're looking to learn good development practices, it might be more productive to seek out companies that already integrate testing into their development process, and that continually look for ways to improve the way they develop software.  This kind of environment naturally encourages self-development and creative exchange between teams, as developers learn from one another and rethink the way they build systems.

#### Automate where it makes sense to.

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