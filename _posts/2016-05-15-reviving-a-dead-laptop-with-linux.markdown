---
layout: post
title:  "Reviving a dead laptop with Linux"
date:   2016-05-15 20:30:00 -0800
categories: linux
redirect_from: "/linux/2016/05/16/reviving-a-dead-laptop-with-linux"
---
My Acer Aspire One has been sitting idle for almost three years now, unable to boot up to Windows 7 32bit.  Hard drive errors prevented operating systems loaded from USB from accessing files on disk.

I decided to give it another go to see if the netbook could be reincarnated under another operating system.

I'm happy to say that the process was successful, and reformatting restored the hard drive to a functioning state!

<!--more-->

This netbook has an Intel Atom N455 CPU (1.66 GHz, 512 KB cache) and 1 GB of RAM, with 250 GB HDD storage.  I aimed for a lightweight Linux distribution that would also be relatively kind to someone coming from a Mac OS or Windows background.

### The LXLE Desktop

The LXLE distribution came up as an interesting option, and was well reviewed for being easy to use and very polished for a lighter distribution.  Their main goal is to be a drop-and-go operating system, primarily for aging computers.

I liked the fact that their website is easy to navigate and read, and provides a succinct and clearly stated description of the distribution, its main features, and their philosophy.  I didn't have to hunt for download links or distribution information as I've become used to doing on most other distribution websites.

The LXLE Desktop home page: [http://lxle.net/](http://lxle.net/)

![alt-text](/images/20160515_lxlewebsite.jpg "Screenshot of the LXLE Linux home page")

It uses more resources than distributions that aim to be able to run on antiquated systems with very limited memory such as Puppy Linux and Crunchbang, and is comparable to Lubuntu, which is still on the light and speedy end of the spectrum.  I've found Lubuntu to be very suitable for netbooks or lower-spec desktops that are struggling to continue running Windows XP.

The LXLE 14.04 release is based on Lubuntu 14.04 Long Term Release with the LXDE desktop.  Its minimum recommended system requirements are 512 MB of RAM and 8 GB of hard drive space.  That will work for this laptop, and being based on a long-term release will make it easier to maintain for a newer Linux user.

Their website's About page states, "Its intention is to be able to install it on any computer and be relatively done after install."  Let's try it out.

### Installing LXLE

I downloaded the LXLE 14.04 32 bit ISO image for my Acer Aspire One from the LXLE website.  A 64 bit image is also available for newer computers.

I've heard about a Universal USB Installer that streamlines creating USB installers from Windows, so I decided to give it a go.  It provides a simple menu for selecting from a number of distributions, then you can enter your image's location via a file picker.  Then it was just click and load.  ([http://www.pendrivelinux.com/universal-usb-installer-easy-as-1-2-3/](http://www.pendrivelinux.com/universal-usb-installer-easy-as-1-2-3/))

Once the USB was loaded with a live image, I plugged it into my Acer netbook and loaded into the BIOS menu to move USB to the top of the loading list.  When the system started up from my new USB installer, I selected the option to install, however you may want to test out the distribution using the live CD option before committing.

### Running LXLE

The boot up time is around 40-45 seconds on my Acer Aspire One.  I'd want to look at improving this if I were to use LXLE for my primary workstation.

The volume and network icons are easily recognizable, and CPU and RAM usage is displayed from the task bar.  Right-clicking on the trash bin provides several options, including the option to empty trash, a convenience that is missed on many other distributions.

As has been widely remarked, LXLE comes with 100 very attractive wallpapers, and you can click on a task bar icon to switch to a new wallpaper.  I couldn't help but enjoy this feature, and spent some time looking through desktop wallpapers like I might on Wallbase or WallHaven.  Similar features can be manually added to any other distribution, but it's a nice touch, and good marketing as more people try out the distribution.

![alt-text](/images/20160515_lxle_screen.jpg "One of the pre-installed LXLE wallpapers")

It comes with a number of software applications pre-installed, including the full LibreOffice suite, Audacity, RecordMyDesktop, GIMP, BleachBit, Seamonkey, KeePassX, and a number of miscellaneous games.

I was able to connect to a wireless network using the WPA2 protocol and update packages without any trouble.  A nice touch is that LXLE comes with many trusted ppa repositories, making installing new software even easier.  Adobe Flash Player is pre-installed, so I was able to play Youtube videos out of the box.

It comes with Lubuntu Software Center as well as Synaptic Package Manager, so people who are uncomfortable working on the terminal will find a decent graphical interface for browsing and installing new software.

Next up: connecting to a printer.  This is something I've had to fiddle with on several distributions to get to work.

It got off to a great start, with the printer tool able to detect my printer on the wireless network and suggest downloadable drivers.  However, the driver installation froze up midway through, and this occurred repeatedly.

LibreOffice Writer and SeaMonkey seem to run very smoothly.  I'll exercise it a bit more tomorrow, but it already looks better than when the Acer was still alive and running Windows 7.

### Conclusion:

LXLE has brought my Acer Aspire One back from the dead, and looks like a very decent Linux distribution<s> for older computers</s> (_see 2016-07-09 footnote_).  The boot time is a bit slow at 40-45 seconds and the printer set up looks like it'll take some more fiddling.  The rest of the distribution looks very elegant and agile, and the netbook is running smoothly.  I'll definitely keep LXLE on to play with it some more.

**_Update (2016-05-16)_**: The printer issue is common across Ubuntu distributions, and can be worked around by installing drivers manually.  I was able to [install the printer-driver-escpr package for Epson printers]({% post_url 2016-05-16-epson-configuring-printers-on-linux %}) to start successfully printing documents.

**_Update (2016-07-09)_**: I've kept LXLE on my Acer Aspire One, and occasionally used it to read ebooks on the bus.  It's about as slow as it was leading up to its original death, and gets noticeably slower when running memory-intensive programs or doing any web browsing with multiple tabs.  This is a huge improvement over not being able to boot up, but I would hesitate to recommend LXLE as an all-cure for very low-spec computers before you've tested it out for a few days.

Helpful resources:

* LXLE home page: [http://lxle.net/](http://lxle.net/)
* Universal USB Installer: [http://www.pendrivelinux.com/universal-usb-installer-easy-as-1-2-3/](http://www.pendrivelinux.com/universal-usb-installer-easy-as-1-2-3/)
