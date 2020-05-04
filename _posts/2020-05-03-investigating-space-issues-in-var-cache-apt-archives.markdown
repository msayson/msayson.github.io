---
layout: post
title:  "Investigating 'You don't have enough free space in /var/cache/apt/archives/' errors"
date:   2020-05-03 10:30:00 -0800
categories: linux
---

I was recently having issues upgrading the operating system on my laptop running Debian Linux due to `You don't have enough free space in /var/cache/apt/archives/` errors, and it took an hour or so to resolve the root cause of the issue.

### Updating packages

Debian has decent guides on upgrading packages (see guides for upgrading [stable](https://www.debian.org/releases/stable/amd64/release-notes/ch-upgrading.en.html) or [testing](https://www.debian.org/releases/testing/amd64/release-notes/ch-upgrading.en.html) releases), which are good to follow and give pointers for common issues.

I was able to run `sudo apt update` to fetch the latest list of available packages, and `sudo apt-get upgrade` to upgrade packages that didn't require other packages to be removed or installed.  However, when running `sudo apt full-upgrade` to complete the main part of the operating system update, the process failed with the message: `E: You don't have enough free space in /var/cache/apt/archives/`.

The Debian guides have a few tips for how to free up space, which were a good starting point, after which I had to go a bit further to figure out what exactly was taking up all the space in /var.

### Starting with the basics: `apt-get autoremove` and `apt-get clean`

The first steps are to clear unused packages via `sudo apt-get autoremove`, and remove old install files from the package cache via `sudo apt-get clean`.

This wasn't enough in this case, I still didn't have enough space to run the OS upgrade.

### Uninstalling packages which are no longer needed

[This StackOverflow answer](https://stackoverflow.com/a/60252818) provided the following command for listing manually installed packages minus those from the base Debian install:

`sudo grep -oP "Unpacking \K[^: ]+" /var/log/installer/syslog | sort -u | comm -13 /dev/stdin <(apt-mark showmanual | sort)`

WARNING: The generated list will still include some packages which may not be safe to uninstall.  However, if you see packages you know you no longer need, you can mark them as automatically installed to signal to the package manager that they can be safely uninstalled if no other installed packages depend on them.

`sudo apt-mark auto PACKAGENAME`, replacing PACKAGENAME with the package you don't think you need anymore (eg. `sudo apt-mark auto 2048-qt`), marks the given package as automatically installed.

After marking several packages as automatically installed (eg. mutt and 2048-qt), I ran `sudo apt-get autoremove` to uninstall all packages which were marked as automatically installed and not depended on by any other installed packages.

This cleared up a few hundred megabytes, but not the gigabytes I needed for the OS upgrade.

### Isolating directories taking up the most space

`df` is a helpful utility for reporting disk space usage across mounted file systems, where `df -h` displays sizes in a more readable format (eg. 26G instead of 27262976 for 26 gigabytes).

`df -h` immediately showed that my root file system only had 23.8G out of 26G in use, leaving insufficient space for downloading all the packages for the system updates.

```
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            2.9G     0  2.9G   0% /dev
tmpfs           586M  8.5M  577M   2% /run
/dev/sda6        26G  23.8G 2.2G  92% /
tmpfs           2.9G   45M  2.9G   2% /dev/shm
tmpfs           5.0M  4.0K  5.0M   1% /run/lock
tmpfs           2.9G     0  2.9G   0% /sys/fs/cgroup
/dev/sda2       256M   56M  201M  22% /boot/efi
/dev/sda8       157G   58G   91G  39% /home
tmpfs           586M   12K  586M   1% /run/user/1000
```

The `du` utility estimates file space usage by specific files or directories, and I used the following command to check what the top consumers of disk space were within /var, since I needed more space for /var/cache/apt/archives/.

```
$ sudo du -h --max-depth=1 /var | sort -h | tail -n 10
[sudo] password for mark:
4.0K  /var/local
4.0K  /var/opt
1.4M  /var/mail
1.9M  /var/spool
12M /var/tmp
16M /var/backups
20M /var/log
1020M /var/cache
14.7G /var/lib
15.7G /var
```

/var/lib is the clear outlier, taking up almost all of the space in /var.

By rerunning the command on /var/lib instead of /var, we can check for the top consumers within that directory.

```
$ sudo du -h --max-depth=1 /var/lib | sort -h | tail -n 10
4.1M  /var/lib/aspell
8.3M  /var/lib/gems
8.5M  /var/lib/tor
8.7M  /var/lib/texmf
17M /var/lib/aptitude
26M /var/lib/mlocate
38M /var/lib/postgresql
85M /var/lib/dpkg
130M  /var/lib/apt
14.4G /var/lib/docker
14.7  /var/lib
```

Bingo.  Docker was eating up all my root disk space, likely through a combination of program files and docker images.

### Uninstalling docker

I was fine with purging my system of docker since I wasn't actively using it and could bring it back later, and [this AskUbuntu post](https://askubuntu.com/questions/935569/how-to-completely-uninstall-docker) was helpful for collecting the steps to completely uninstall it.

```sh
sudo apt-get purge -y docker*
sudo apt-get autoremove -y --purge docker*
sudo rm -rf /var/lib/docker /etc/docker
sudo rm /etc/apparmor.d/docker
sudo groupdel docker
sudo rm -rf /var/run/docker.sock
sudo rm /usr/local/bin/docker-compose
```

### Success!

```
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            2.9G     0  2.9G   0% /dev
tmpfs           586M  8.5M  577M   2% /run
/dev/sda6        26G  9.4G   15G  39% /
tmpfs           2.9G   45M  2.9G   2% /dev/shm
tmpfs           5.0M  4.0K  5.0M   1% /run/lock
tmpfs           2.9G     0  2.9G   0% /sys/fs/cgroup
/dev/sda2       256M   56M  201M  22% /boot/efi
/dev/sda8       157G   58G   91G  39% /home
tmpfs           586M   12K  586M   1% /run/user/1000
```

Excellent, we're back down to just using 9.4G out of 26G of the root file system.

After this I was able to complete my system upgrade without issues.

### References

* Debian upgrade guide for the stable release: https://www.debian.org/releases/stable/amd64/release-notes/ch-upgrading.en.html
* StackOverflow post on listing manually installed packages: https://stackoverflow.com/a/60252818
* AskUbuntu post on how to completely uninstall docker: https://askubuntu.com/questions/935569/how-to-completely-uninstall-docker
