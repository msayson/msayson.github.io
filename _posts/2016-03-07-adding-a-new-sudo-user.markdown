---
layout: post
title:  "Adding a new sudo user"
date:   2016-03-07 21:10:35 -0800
categories: debian linux
---
Now that we’ve installed Debian, we’ll want to add our main user to the sudo group.

“sudo” is Debian’s super user group, and its members can temporarily act as if they are system administrators by using the “sudo” keyword before a given command and confirming their password.

Let’s call the user “fred” for now.  Once fred is added to the sudo group, sudo powers will still be disabled by default for safety.  However, if an operation requires super user permissions, we’ll be able to use the sudo keyword to get the work done.

Step 1:
We’ll have to log in as root in order to add our first user to the sudo group.  We want to spend as little time in the root account as possible, since sudo is always turned on in here.

Step 2:
Once we’re logged in as root, let’s open up a terminal (eg. Start Menu/System Tools/LXTerminal).

{% highlight bash %}
adduser fred sudo
{% endhighlight %}

Step 3:
Log out of root and log in as your main user (fred)

We now have access to sudo privileges!  The sudo timeout is often quite long by default (5 – 15 minutes), so let’s set the timeout to 1.

Step 4:
{% highlight bash %}
sudo visudo
{% endhighlight %}

Add the following to the end of the file:
{% highlight text %}
Defaults:fred timestamp_timeout=1
{% endhighlight %}

![alt-text](/images/20160307_visudo_setting_timeout.png "Setting default sudo timeout")

Enter Ctrl+X to exit visudo.  Enter Y to save your changes to /etc/sudoers.tmp.

You can change the value to N for a timeout of N minutes.  eg. timestamp_timeout=3 sets a timeout period of 3 minutes.

And we’re done!

Notes:

* At first I set the timeout to zero to require a password on every sudo command, but this becomes impractical as soon as you need to run network queries or other iterative commands.
* “sudo -k” can be used to end the super user session before the timeout expires.
