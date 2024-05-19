---
layout: post
title:  "(LXDE) Customizing key bindings"
date:   2016-03-08 20:30:00 -0800
categories: linux
redirect_from: "/linux/2016/03/09/lxde-customizing-key-bindings"
---
A few key bindings are helpful to save time, especially for tasks such as changing volume or screen brightness settings.  These key bindings did not work out of the box for me, so this was one of the first things I wanted to set up.

I've verified these steps on Debian GNU/Linux 8.3 (jessie) using the LXDE desktop.  Other desktops may have their own locations for key bindings.

<!--more-->

For Debian LXDE, our key bindings are stored in ~/.config/openbox/lxde-rc.xml.

{% highlight bash %}
leafpad ~/.config/openbox/lxde-rc.xml
{% endhighlight %}

If you scroll down to the keyboard section, you'll see all of your current key bindings.

For example, this is the pre-existing ToggleShowDesktop key binding for my desktop:

{% highlight xml %}
  <keybind key="C-A-d">
    <action name="ToggleShowDesktop"/>
  </keybind>
{% endhighlight %}

C: Ctrl

A: Alt

S: Shift

W: Windows key

Lowercase letters indicate the same letter keys, and there are a number of other named keys or key binding aliases available.

I'm missing a key binding for starting a terminal, so I'll add one for lxterminal.

{% highlight xml %}
  <!-- Launch LXTerminal when Ctrl+Alt+T is pressed -->
  <keybind key="C-A-t">
    <action name="Execute">
      <command>lxterminal</command>
    </action>
  </keybind>
{% endhighlight %}

Once set, this will bind the Ctrl+Alt+t sequence to the command "lxterminal".  We can execute more complex commands as well, whatever you would like to bind to a key sequence.

You can look through your existing key bindings for examples, and [http://openbox.org/wiki/Help:Actions](http://openbox.org/wiki/Help:Actions) has helpful explanations on how to set up other types of key bindings.

I'd also like to be able to easily lock my screen, and wake to the login screen with unfilled fields rather than the less attractive default dialog with the counter and prefilled username.  "dm-tool lock" will do the job.

{% highlight xml %}
  <!-- Keybinding for screen lock, wake to login screen -->
  <keybind key="C-A-l">
    <action name="Execute">
      <command>dm-tool lock</command>
    </action>
  </keybind>
{% endhighlight %}

Lets save and reconfigure openbox to use the latest bindings.

{% highlight bash %}
openbox --reconfigure
{% endhighlight %}

Ctrl+Alt+t will now start up a new LXTerminal instance for us, and Ctrl+Alt+l will lock our screen and wake to the login screen.

### Slightly more advanced key bindings:

Some keys may not be named what we expect, or have unusual aliases for key sequences such as "XF86...".  If possible we'd like a standard way to determine what codes individual keys or key sequences translate to.

We can use the xev tool to help with this.

![alt-text](/images/20160308_xevmanpage.png "Picture of the xev tool man page")

Once we run "xev", it will generate a small window which will capture our following key sequences.  When we're done we can close that window to end the xev session.

![alt-text](/images/20160308_xevrunning.jpg "Picture of the xev tool running")

Using this tool I was able to determine that Fn+F9, Fn+F10 and Fn+F11 translate to "XF86AudioLowerVolume", "XF86AudioRaiseVolume" and "XF86AudioMute" for my computer.

I used the amixer tool for my volume control actions since none of them were set yet.

Example: key binding for toggling mute/unmute

{% highlight xml %}
  <keybind key="XF86AudioMute">
    <action name="Execute">
      <command>amixer -q set Master toggle</command>
    </action>
  </keybind>
{% endhighlight %}

Using xev, you should be able to find the codes or aliases for most key sequences you'd like to bind to commands or other actions.

Helpful Resources:

[http://openbox.org/wiki/Help:Actions](http://openbox.org/wiki/Help:Actions)
