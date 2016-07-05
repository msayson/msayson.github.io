---
layout: post
title:  "(LXDE) Customizing the log in background"
date:   2016-03-07 21:30:00 -0700
categories: debian linux
---
For this next post I’ll update the background image for the log in screen.  I’m using Debian LXDE, so the instructions may differ if you are using another distribution or desktop.  I have verified these steps on Debian GNU/Linux 8.3 (jessie) using the LXDE desktop.

For my log in screen background I’ll use the following image of the Orion Nebula:

<img alt="Orion Nebula" src="https://www.nasa.gov/images/content/438018main_spitzer20100401-full.jpg" width="600" height="200" />

File source: [https://www.nasa.gov/mission_pages/spitzer/multimedia/spitzer20100401.html](https://www.nasa.gov/mission_pages/spitzer/multimedia/spitzer20100401.html)

Image credit: NASA/JPL-Caltech

We’ll need to use sudo to copy files to /usr/share/images/desktop-base.  This is a directory that the login manager can access; it doesn’t have permission to read from /home/user files.

{% highlight bash %}
sudo cp YOUR_IMAGE /usr/share/images/desktop-base
{% endhighlight %}

Aside: In general, I’ll try a command without using sudo first, and only use sudo if necessary.  This prevents us from setting improper access permissions on files.

For example:

<img alt="Permission denied when copy to desktop-base without sudo" src="/images/cptodesktoppermissiondenied.png" width="600" />

We need sudo here:

<img alt="Successful sudo copy to desktop-base" src="/images/cptodesktopbasesuccess.png" width="600" />

Success!  Replace orion-nebula.jpg with any image file you’d like to use for your login background.

Now let’s update the background image in the log in config file.  Here I use leafpad, but you can use any other editor.  We need sudo for permission to save changes.

{% highlight bash %}
sudo leafpad /etc/lightdm/lightdm-gtk-greeter.conf
{% endhighlight %}

Look for where the “background” variable is set.  I’ll leave the old background image commented out by adding a “#” before it.  In the following line, add your new background image.

{% highlight text %}
[greeter]
#background=/usr/share/images/desktop-base/login-background.svg
background=/usr/share/images/desktop-base/NEW_BACKGROUND_IMAGE
{% endhighlight %}

Save your changes and close the text editor.

Let’s log out to check our changes.

![alt text](/images/loginscreen_orion.png "Log in screen with Orion Nebula background")
