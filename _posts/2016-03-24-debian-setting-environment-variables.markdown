---
layout: post
title:  "(Debian) Setting environment variables"
date:   2016-03-24 20:30:00 -0800
categories: linux debian
---
In this post we'll set up environment variables for Debian, using Golang as an example.

I'd like to be able to run Go programs easily from terminal, and also have Golang environment variables accessible from applications such as Sublime Text Editor.

Environment variables can be set globally (/etc) or for individual users (~ is a shortcut to the current user's home directory).  I'll set up these environment variables for my user.

On Debian, ~/.bashrc is the user's configuration file for non-login, interactive bash sessions.  We'll use this for variables we want to access from new *XTerm instances.  I don't have this file yet, so let's create it.

{% highlight bash %}
touch ~/.bashrc
leafpad ~/.bashrc
{% endhighlight %}

{% highlight bash %}
# Set up Golang environment variables
export GOPATH=<pathToProject>
export GOROOT=/usr/local/go
export PATH=$PATH:$GOROOT/bin
{% endhighlight %}

Let's test our changes.  We'll run "source your_config_file" to update the variables in the current shell, and then run a simple go command to verify it's taken effect.

![alt-text](/images/20160324_go_version.png "Picture of successful go command execution")

Other distributions use different configuration files, so check out the documentation for your distribution of choice.

Helpful resources:

* Arch Linux: [https://wiki.archlinux.org/index.php/Environment_variables](https://wiki.archlinux.org/index.php/Environment_variables)
* Debian: [https://wiki.debian.org/EnvironmentVariables](https://wiki.debian.org/EnvironmentVariables)
* Ubuntu: [https://help.ubuntu.com/community/EnvironmentVariables#Persistent_environment_variables](https://help.ubuntu.com/community/EnvironmentVariables#Persistent_environment_variables)
