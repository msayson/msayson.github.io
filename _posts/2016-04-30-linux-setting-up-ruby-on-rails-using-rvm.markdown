---
layout: post
title:  "(Linux) Setting up Ruby on Rails using RVM"
date:   2016-04-30 20:30:00 -0800
categories: programming-languages
---
In this post I'll go over how to install Ruby on Rails on Linux using [Ruby Version Manager, or RVM](https://rvm.io).

RVM simplifies maintaining one or more independent Ruby environments, which can be helpful for development and testing.  You can run builds on multiple gemsets this way, and if you so choose you can set up self-contained environments for each project.

### Express install, using default Rails environment:

Step 1: First we'll download the keychain for verifying our download, and install curl.

Curl is an information transfer tool that supports many file transfer protocols, and we'll use it to get the latest version of rvm.

{% highlight bash %}
gpg2 --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
sudo apt-get install curl
{% endhighlight %}

Step 2: Now we can use curl to install RVM.  For the express install I'll assume we want the default version of rails, and add the --rails argument to install it automatically.

{% highlight bash %}
\curl -L https://get.rvm.io | bash -s stable --rails
{% endhighlight %}

Step 3: Finally, let's add a line to our .bashrc file to ensure we can access ruby, rails, rake and more from terminal.

{% highlight bash %}
leafpad ~/.bashrc
{% endhighlight %}

Add "source $HOME/.rvm/scripts/rvm" to the end of your .bashrc file and save your changes.

Run "source ~/.bashrc". You should now have access to your Ruby on Rails tools.

![alt-text](/images/20160430_testing_rails_install.png "Testing our Rails installation")

### Custom install, using specific Ruby versions:

Step 1: As before, we'll download the keychain for verification and install curl.

{% highlight bash %}
gpg2 --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
sudo apt-get install curl
{% endhighlight %}

Step 2: This time we'll set a specific Ruby version.

{% highlight bash %}
\curl -L https://get.rvm.io | bash -s stable --ruby=SPECIFIED_VERSION
{% endhighlight %}

Step 3: As before, add "source $HOME/.rvm/scripts/rvm" to the end of your ~/.bashrc file, and run "source ~/.bashrc".

Since we only installed Ruby and not Rails, let's install the Rails gem ourselves.

{% highlight bash %}
gem install rails
{% endhighlight %}

### Adding or switching between Ruby environments:

{% highlight bash %}
rvm list                        # view installed environments
rvm list known                  # view Ruby versions available to install
rvm use SPECIFIED_VERSION       # switch to an environment for the current session
rvm use --default SPECIFIED_VERSION # switch to an environment for this and future sessions
rvm install SPECIFIED_VERSION   # install a new environment
rvm uninstall SPECIFIED_VERSION # remove an environment
{% endhighlight %}

You can find additional information in the RVM documentation, linked below.

Helpful resources:

* RVM Install Guide: [https://rvm.io/rubies/installing](https://rvm.io/rubies/installing)
