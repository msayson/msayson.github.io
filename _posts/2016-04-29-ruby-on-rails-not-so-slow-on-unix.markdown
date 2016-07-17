---
layout: post
title:  "Ruby on Rails not so slow on Unix"
date:   2016-04-29 20:30:00 -0800
categories: rubyonrails
---
I've been starting to work in Ruby on Rails, and the Rails experience seems to be much smoother on Linux than on Windows.

More tools work out of the box, and there are significant performance improvements.  Search for "rails slow on windows" and you'll find many results, with the most common suggestion being to move to Unix.

For instance, test builds that take a few seconds to run on Linux often take up to a minute on Windows.  The difference for general Ruby tasks is supposedly closer to 70% - 100% faster on Linux than on Windows.  ([http://programmingzen.com/2009/08/10/how-much-faster-is-ruby-on-linux/](http://programmingzen.com/2009/08/10/how-much-faster-is-ruby-on-linux/))

These are rough benchmarks, but why this discrepency?  Frequently quoted reasons are that Ruby has primarily been developed on Linux, Windows has been treated as a lower priority since most web applications will be run on Linux servers anyway, Unix has the benefit of an excellent gcc compiler while the Windows version has been compiled using Visual C++, and so on.

These answers are not satisfactory, and there's a lot of work to be done on this front.  However, at least for now, Rails developers are often recommended to either work in Unix or use a virtual machine loaded with Unix.  More tools work out of the box, and performance is less of an issue, especially with builds and test runs.

The Rails development experience is said to be quite excellent on Linux and OSX, with a development community that continues to grow.

Next time I'll go over [how to set up Ruby on Rails on Linux]({% post_url 2016-04-30-linux-setting-up-ruby-on-rails-using-rvm %}).
