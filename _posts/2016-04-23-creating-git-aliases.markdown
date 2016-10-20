---
layout: post
title:  "Creating Git aliases"
date:   2016-04-23 20:30:00 -0800
categories: git
---
A few months ago a friend introduced me to Git aliases, and I've come to enjoy using them enough to set them up on every workspace I use.

Aliases are customizable shortcuts for full or partial commands, allowing the user to enter something like "git ci" instead of "git commit -m".

{% highlight bash %}
git ci 'User can edit display name'
{% endhighlight %}

{% highlight bash %}
git commit -m 'User can edit display name'
{% endhighlight %}

They can cut down on the typing required for common commands, but can also be appreciated when you find that you no longer have to keep on searching for that twenty-character command you use every few days.

Git aliases are set using the following command:

{% highlight bash %}
git config alias.<CUSTOM_NAME> "<COMMAND> <COMMAND_ARGS>"
{% endhighlight %}

If you want the alias to apply to all repositories on your user account, add the --global argument.

As an example, the following commands set global aliases that I have for my current user.  You can set the names of aliases to whatever you like.

{% highlight bash %}
git config --global alias.aa "add ."
git config --global alias.ad add
git config --global alias.bl "branch -l"
git config --global alias.br branch
git config --global alias.cb "checkout -b"
git config --global alias.ci "commit -m"
git config --global alias.cfg "config --global -l"
git config --global alias.co checkout
git config --global alias.lg "log --graph --name-status --oneline"
git config --global alias.pl pull
git config --global alias.pu push
git config --global alias.st status
git config --global alias.up "push --set-upstream origin"
{% endhighlight %}

On Linux devices, global Git settings are stored in ~/.gitconfig.
On Windows, this is C:/Users/USERNAME/.gitconfig.

Once you've set up an alias, you can start using it immediately, for example, by using "git cfg" to list all global Git config settings.

If you tend to be trigger-happy, you may want to avoid setting aliases for commands that are difficult to reverse.  I prefer using branches over stashes, and stay away from aliases for commands like merge, rebase and reset to give a few extra seconds to think about whether that's really what I want to do.

If you enjoy using Git aliases, you may like bash aliases even more!

Helpful resources:

* Git config documentation: [https://git-scm.com/docs/git-config](https://git-scm.com/docs/git-config)
