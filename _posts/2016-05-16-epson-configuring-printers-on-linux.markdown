---
layout: post
title:  "(Epson) Configuring printers on Linux"
date:   2016-05-16 20:30:00 -0800
categories: linux
redirect_from: "/linux/2016/05/17/epson-configuring-printers-on-linux"
---
Configuring printers on Linux computers often takes a bit of trial and error, especially since many printer companies don't tend to update drivers for Linux distributions as often as with Windows and Mac OS.

On the plus side, if someone finds a solution for any Debian-derived distribution, it often works for Ubuntu and its derivations, and vice versa.

I've been trying to configure an Epson Workforce 3640 printer for a netbook running the LXLE Linux distribution, which is closely derived from Lubuntu and Ubuntu.

<!--more-->

Although LXLE's printer wizard is able to detect the printer and recommend a driver, system-config-printer keeps on freezing during the driver installation.  This issue has been noted by Ubuntu users using other printers (Bugs [#1253361](https://bugs.launchpad.net/ubuntu/+source/system-config-printer/+bug/1253361) and [#1248303](https://bugs.launchpad.net/ubuntu/+source/gnome-control-center/+bug/1248303)), and some have reported success in manually downloading printer drivers instead of going through their respective wizards.

Fortunately, Seiko Epson Corporation provides a GPL-licensed [Epson Inkjet Printer Driver for Linux](https://www.openprinting.org/driver/epson-escpr) that supports a large number of Epson printers.  It's available to Debian-derived distributions as "printer-driver-escpr", so Ubuntu, Kubuntu, LXLE and other derivations that pull from Debian can also access the same package.

### Steps to install:

Step 1. First we have to clean up the state left by system-config-printer. Otherwise we'll receive errors regarding debconf/config.dat being locked when we try to install new printer drivers.

{% highlight bash %}
sudo rm /var/cache/debconf/*dat
{% endhighlight %}

Step 2. Now we can install the driver package.

{% highlight bash %}
sudo apt-get install printer-driver-escpr
{% endhighlight %}

Step 3. Now when we start up our printers utility, we can choose our printer's driver from local drivers.  I found that the recommended driver (Epson Workforce 3540) worked fine for my printer (Epson Workforce 3640) even though it wasn't exactly the same model.

<table style="width: 80%;">
  <tr>
    <td>
      <img alt="Printer configuration - detecting your printer" src="/images/20160516_printerconfig_1_findprinter.png" width="250" />
    </td>
    <td>
      <img alt="Printer configuration - detecting your printer" src="/images/20160516_printerconfig_2_chooselocaldriver.png" width="250" />
    </td>
    <td>
      <img alt="Printer configuration - detecting your printer" src="/images/20160516_printerconfig_3_localepsondriver.png" width="250" />
    </td>
  </tr>
  <tr>
    <td>
      <img alt="Printer configuration - detecting your printer" src="/images/20160516_printerconfig_4_chooseepsondriver.png" width="250" />
    </td>
    <td>
      <img alt="Printer configuration - detecting your printer" src="/images/20160516_printerconfig_5_nameprinter.png" width="250" />
    </td>
    <td>
      <img alt="Printer configuration - detecting your printer" src="/images/20160516_printerconfig_6_testpage.png" width="250" />
    </td>
  </tr>
</table>

![alt-text](/images/20160516_printerconfig_7_printerready.png "Printer configuration - printer is ready")

Our printer is now ready for use, and you can test this by printing a test page or other document.

Helpful resources:

* AskUbuntu post suggesting installing the driver manually (thanks Ciro Santilli): [https://askubuntu.com/questions/415099/13-10-network-epson-printer-stuck-on-installing](https://askubuntu.com/questions/415099/13-10-network-epson-printer-stuck-on-installing)
* AskUbuntu post suggesting printer-driver-escpr (thanks sshades): [https://askubuntu.com/questions/612577/printer-drivers-for-epson-wf-3640/716169#716169?newreg=c53e68481a804a1d8226e7d670e361d5](https://askubuntu.com/questions/612577/printer-drivers-for-epson-wf-3640/716169#716169?newreg=c53e68481a804a1d8226e7d670e361d5)
* Original driver software from Seiko Epson Corporation: [https://www.openprinting.org/driver/epson-escpr](https://www.openprinting.org/driver/epson-escpr)
* Debian packages: [https://packages.debian.org/jessie/printer-driver-escpr](https://packages.debian.org/jessie/printer-driver-escpr)
* Ubuntu packages: [http://packages.ubuntu.com/search?keywords=printer-driver-escpr&searchon=names](http://packages.ubuntu.com/search?keywords=printer-driver-escpr&searchon=names)
