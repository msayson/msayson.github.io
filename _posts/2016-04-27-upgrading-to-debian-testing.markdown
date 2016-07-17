---
layout: post
title:  "Upgrading to Debian Testing"
date:   2016-04-27 20:30:00 -0800
categories: debian linux
---
Last time I went over [Debian's releases and reasons to either upgrade to Debian Testing or remain on Debian Stable]({% post_url 2016-04-24-debian-releases-and-deciding-to-upgrade %}).

In this post I'll go through the steps I took to upgrade to the current Debian Testing release.

As mentioned last time, each release has a code name, such as "jessie", and you can choose to track releases by name ("jessie") to follow them from testing -> stable, or to track by life stage ("testing") to always use the release currently in that stage.

I chose to update my source list to use "stretch", the current testing release as of April 2016, because I'd like to track the current testing release into stable and switch over to the next release once it looks fairly solid.  However, many people are comfortable simply using "testing" to automatically roll over every release cycle.

### Steps to upgrade your Debian release:

The Debian Wiki recommends starting from a minimal Debian Stable installation before upgrading as the most reliable way to install Debian Testing from scratch.  However, the steps to upgrade are the same if you have additional software installed.

#### Step 1: Update the release names used in your /etc/apt/sources.list file.  This file tracks which repositories to pull packages from.

You can changes references from "stable" or the name of the previous release ("jessie") to "testing" or the name of the current testing release ("stretch" as of April 2016).  I updated my repositories to point to "stretch" to track this release from testing -> stable.

#### Step 2: Run "apt-get update" and "apt-get dist-upgrade" to apply all distribution and packages updates.  Once complete, you can optionally run "apt-get clean" to clear your package cache.

{% highlight bash %}
sudo apt-get update && sudo apt-get dist-upgrade && sudo apt-get clean
{% endhighlight %}

Since my WiFi signal was very weak, I split up the apt-get commands to make sure each step completed before clearing the package cache.

At the distr-upgrade step, read through and accept any prompts describing release changes or security updates.

That's it.  You now have Debian Testing installed and ready to go!

#### Additional notes:

During the distribution update, you may receive the following message indicating that xscreensaver and xlockmore must be restarted before upgrading.

![alt-text](/images/20160427_xscreensaver_must_restart.png "Screenshot of the xscreensaver must be restarted dialog")

In this case, kill these processes in a separate terminal.

{% highlight bash %}
pkill xscreensaver
pkill xlockmore
{% endhighlight %}

You can now type Enter into the terminal running "apt-get dist-upgrade" to continue.

Mistakes made along the way:

1. On my first attempt at upgrading, I used the Synaptic Package Manager GUI and got stuck at the "xscreensaver and xlockmore must be restarted" message.  Even after killing the tasks there didn't seem to be a way to continue or cancel the upgrade, and I eventually tried restarting the package manager.  This resulted in an inability to run the package manager, so I backed up my documents and reinstalled Debian Stable.
2. A friend who works on Debian was very helpful in answering some of my questions and gave tips on the ideal way to upgrade (thanks Vincent!).  Following his advice I took the terminal-based route and was able to upgrade to Debian Testing successfully.

Helpful resources:

* Debian  Wiki: [https://wiki.debian.org/DebianTesting](https://wiki.debian.org/DebianTesting)
