---
layout: post
title:  "(LXDE) Monitoring battery life"
date:   2016-03-10 20:30:00 -0800
categories: linux
---
I've noticed that my battery's lifetime decreases by quite a bit when I run Debian.  I'll look into improving this in a couple days, but for now I've installed fdpowermon as a graphical battery life monitor.

In this post I'll show how to set up .desktop files for processes such as fdpowermon, and how to update your system to run fdpowermon on session start using the new fdpowermon.desktop file.

#### Step 1: Installing fdpowermon

fdpowermon is a simple battery monitor that periodically checks your battery's status and estimated lifetime, and provides a graphical representation in the desktop task bar.

You can install fdpowermon manually or through your package manager.

fdpowermon can be started through your terminal, but we'd like to set it up to run automatically from session start up.

#### Step 2: Creating a .desktop file

The following file will start fdpowermon whenever it is executed.  This is hardly an improvement over a shell script, but we'll use it later for our session start script.

fdpowermon.desktop

{% highlight bash %}
[Desktop Entry]
Keywords=fdpowermon
Name=fdpowermon
Comment=Battery life monitor
Exec=fdpowermon
Icon=
Terminal=false
Type=Application
MimeType=text/plain
Categories=Utility;
{% endhighlight %}

Test out the file by double-clicking it in your file manager to run it manually.  You should see fdpowermon's icon appear in your task bar.

![alt-text](/images/20160310_fdpowermontaskbar.png "Picture of the fdpowermon start menu icon")

You can use "pkill fdpowermon" to kill the process.

Move this file to /usr/share/applications.

{% highlight bash %}
sudo mv fdpowermon.desktop /usr/share/applications
{% endhighlight %}

#### Step 3: Adding fdpowermon to autostart

Our last step is to add fdpowermon to our session start script.

{% highlight bash %}
leafpad ~/.config/lxsession/LXDE/autostart
{% endhighlight %}

Add "@fdpowermon" to the end of the file.  Save your changes and close the file.

To test your changes, log out and log in again.  You should see the fdpowermon icon in your task bar.  Note: fdpowermon provides more precise information in its hovertext.

![alt-text](/images/20160310_fdpowermonhovertext.png "Picture of the fdpowermon start menu icon hover text")

That's it.  You can make your own .desktop files for running whatever processes you like, and now you can set them up to run on session start.  I've included a link to the Arch Linux LXDE Wiki at the bottom of this post since I found it to be quite helpful.  You can also check out your existing .desktop files for examples of more advanced processes.

Mistakes made along the way:

I spent a bit of time trying to figure out why adding processes to /etc/xdg/lxsession/LXDE/autostart didn't work.  The Arch Linux LXDE Wiki provided the solution: if a local ~/.config/lxsession/LXDE/autostart exists, the system will use the local version instead of the one from /etc/xdg.

Helpful resources:

[https://wiki.archlinux.org/index.php/LXDE#Desktop_files](https://wiki.archlinux.org/index.php/LXDE#Desktop_files)
