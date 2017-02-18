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

If you want the alias to apply to all repositories on your user account, add the -\-global argument.

### Particularly useful commands to alias

#### Branching

- "branch": list local branches, follow with parameters for other commands
- "checkout -b BRANCH-NAME": create a new branch and check it out
- "push -\-set-upstream origin BRANCH-NAME": push local history to a new remote branch

#### Logging

- "log -\-follow -p -\- FILE-PATH": display history of a file across file moves and renames
  - eg. ```git log --follow -p -- **/*computer-vision*```
- "log -\-graph -\-name-status -\-oneline": display a concise view of your commit history
  - I have this aliased to "lg": easier to remember.

{% highlight bash %}
$ git lg
* 97daf65 Added blog post - A Seminar on Computer Vision - Notes and Discussion
| A     _includes/image.html
| A     _posts/2016-06-06-a-seminar-on-computer-vision-notes-and-discussion.markdown
| M     _sass/_base.scss
| A     images/20160606_long_tail_labeled.png
| A     images/20160606_realtimefacialrecognition.jpg
| A     images/20160606_skeletalhand_razvan.jpg
| A     images/20160606_terrykimura_stuffedanimals_facialrecognition.jpg
| A     images/20160606_vislab_followingaperson.jpg
* b0afc06 Added pagination to the blog posts listing, with page size 16
| M     Gemfile
| M     Gemfile.lock
| M     _config.yml
| A     _includes/pagination_bar.html
| M     index.html
{% endhighlight %}

### Personal aliases

As an example, the following commands set global aliases that I have for my current user.  You can set the names of aliases to whatever you like.

{% highlight bash %}
git config --global alias.aa "add ."
git config --global alias.ad add
git config --global alias.br branch
git config --global alias.cb "checkout -b"
git config --global alias.ci "commit -m"
git config --global alias.cfg "config --global -l"
git config --global alias.co checkout
git config --global alias.lf "log --follow -p --"
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
