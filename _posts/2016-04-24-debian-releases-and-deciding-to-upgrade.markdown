---
layout: post
title:  "Debian releases and deciding to upgrade"
date:   2016-04-24 20:30:00 -0800
categories: linux
redirect_from: "/linux/2016/04/25/debian-releases-and-deciding-to-upgrade"
---
Debian Stable, or just "stable", is the default release for new Debian installs, with "testing" and "unstable" being the next releases along the development pipeline.

Debian Stable is the rock-solid release with few major changes going in and slightly older supported packages, while many downstream distributions like Ubuntu pull from Debian Testing, which gets more action throughout the year.

Each release is given a Toys Story-derived name from when it enters Testing through the remainder of its life, such as "woody", "wheezy" or "jessie".  Unstable is always called "sid", in reference to the child down the block in the original movie.

You can choose to track releases by their name to stick with them as they move from testing -> stable, or by their position in the life cycle in order to pick up whatever is currently in the stable/testing/unstable release.

#### Why upgrade to Testing?

* You like having the latest and greatest versions of operating systems.
* You like having access to newer packages, or need them for development purposes.
* You want to help Debian develop, and are willing to figure out issues yourself or contribute to issue tracking.

#### Why stay on Stable?

* You prefer having an ultra-reliable system that requires few updates.
* Access to new packages isn't a priority.
* You want to wait for the current testing release to mature a bit before switching.
* You can't risk security on your platform.  Debian advises that Testing can receive slower security updates than Stable or Unstable.

The Debian Wiki recommends the following steps before upgrading to Debian Testing:

1. Assess the current state of testing.  [https://wiki.debian.org/DebianTesting](https://wiki.debian.org/DebianTesting)
   * Look at the maturity of the current testing branch, check the issues list, and determine whether you're comfortable figuring out any issues that might occur.
2. If you're comfortable moving to Debian Testing, the recommended route is to start from a minimal Debian Stable install, then upgrade to Debian Testing.

Moving from stable -> testing is advertised as a one-way street unless you plan to start from a fresh install.  There are probably ways to downgrade manually, but this isn't officially supported, so be sure to check the state of the testing release before upgrading.

In the next post I'll go over [the steps I took to get it working]({% post_url 2016-04-27-upgrading-to-debian-testing %}), since it seems to be very smooth if you know how to upgrade, but with pits that are easy to fall into if you're doing this for the first time.

Helpful resources:

* Debian Wiki: [https://wiki.debian.org/DebianReleases](https://wiki.debian.org/DebianReleases)
