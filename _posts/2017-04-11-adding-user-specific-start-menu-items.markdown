---
layout: post
title:  "(LXDE) Adding user-specific start menu items"
date:   2017-04-11 20:30:00 -0800
categories: linux
---

In this post we'll add a user-specific start menu item for an npm application, [Evolus Pencil V3](https://github.com/evolus/pencil).

To create a start menu item with a custom icon, we will:

1. Define the start menu item in a .desktop file
2. Add an icon to the filepath specified in the .desktop file
3. Refresh the start menu to view our changes

<!--more-->

The following steps were verified on Debian Linux "Stretch" with the LXDE desktop environment.  As such, they should apply to other Linux distributions using LXDE, and other environments such as KDE may differ in the commands or filepaths used.

## Creating the .desktop file

User-specific start menu items should be saved in ~/.local/share/applications/, and their corresponding icons saved in ~/.local/share/pixmaps/.

For start menu items you would like to share across all users, the files should be saved in /usr/share/applications/ and /usr/share/pixmaps/ instead.

{% highlight bash %}
$ vim ~/.local/share/applications/pencil.desktop
{% endhighlight %}

```txt
[Desktop Entry]
Encoding=UTF-8
Version=1.0
Type=Application
Categories=Graphics
Exec=npm start /home/mark/Programs/pencil
Name=Evolus Pencil v3
Comment=A tool for making diagrams and GUI prototypes
Icon=/home/mark/.local/share/pixmaps/evoluspencillogo48x48.png
```

Notice the Exec field, which can be set to any command you wish to run.  The Name field defines the label you'll see on the start menu, the Categories field defines which submenus it will show up under, the Comment field defines the hover text, and the Icon field defines the filepath of the icon to display.

The Icon field is optional; if you don't include it, then a default gear icon will be used instead.

## Adding the image for the start menu icon

Start menu icons have standard dimensions of 48x48 pixels, so I resized the Pencil logo in advance.

![alt text](/images/20170411_evoluspencillogo48x48.png "The image we'll use for the Evolus Pencil 3 start menu icon")

We'll add the icon to ~/.local/share/pixmaps/ since the application will be local to our user.

{% highlight bash %}
$ mkdir ~/.local/share/pixmaps
$ cp 20170411_evoluspencillogo48x48.png ~/.local/share/pixmaps/
{% endhighlight %}

You can update your .desktop Icon fields at any point if you decide to change your start menu icons.

## Refreshing the start menu

{% highlight bash %}
$ lxpanelctl restart
{% endhighlight %}

This command restarts the lxpanelctl utility, and updates the start menu to use the latest .desktop shortcuts.

Under the start menu, Graphics, we now have a menu item for "Evolus Pencil v3".

![alt text](/images/20170411_evoluspencil3startmenuitem.jpg "The Evolus Pencil 3 start menu icon and hover text")

We can now start Evolus Pencil 3 from the start menu as well as from terminal.

![alt text](/images/20170411_evolusPencil3.png "Running Evolus Pencil 3")

Resources:

* Arch Linux Wiki article on desktop entries: [https://wiki.archlinux.org/index.php/Desktop_entries](https://wiki.archlinux.org/index.php/Desktop_entries)
* Arch Linux Wiki article on LXDE: [https://wiki.archlinux.org/index.php/LXDE#LXPanel_icons](https://wiki.archlinux.org/index.php/LXDE#LXPanel_icons)
