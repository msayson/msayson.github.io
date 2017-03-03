---
layout: post
title:  "Setting up Sublime Text Editor for Ruby on Rails"
date:   2016-05-04 20:30:00 -0800
categories: ides-and-editors
redirect_from: "/ides-and-editors/2016/05/05/setting-up-sublime-text-editor-for-ruby-on-rails"
---
In this post I'll go over how I set up Sublime Text Editor for Ruby on Rails development.

Sublime Text Editor is a popular proprietary text editor that runs on Windows, Linux and Mac OS.  It's highly customizeable, and there are many user-developed plugins that tweak various parts of the interface.  It can be evaluated for free with no time limit, however, it is paid software ($70 USD as of May 2016).  While in evaluation mode, you'll receive a prompt asking if you want to buy a license after every few saves.

#### Step 1: Download Sublime Text Editor 3 from [https://www.sublimetext.com/3](https://www.sublimetext.com/3) and install.

Note: Linux users can install .deb files by running "sudo dpkg -i package_name.deb".

#### Step 2: Install Package Control Manager.

Follow the instructions on [https://packagecontrol.io/installation](https://packagecontrol.io/installation).  Package Control Manager can be used to list, enable/disable, install/uninstall Sublime Text Editor plugins.

#### Step 3: Install any Sublime Text Editor plugins.

Once you have Package Control Manager installed, you can open "Preferences/Package Control" to access the package manager interface.

Enter "Install Package" to get a list of all available plugins.

I currently use the following plugins.  Links are provided for interest only, you can install the plugins within Sublime Text Editor using the package manager.

* GitGutter: [https://github.com/jisaacks/GitGutter](https://github.com/jisaacks/GitGutter)
  * Indicates all uncommitted changes by overlaying color-coded icons to the left of the changed lines.
  * Added lines are indicated using a green "+" icon, removed lines with a red arrow, and modified lines with a yellow square.
* SublimeLinter: [http://www.sublimelinter.com/en/latest](http://www.sublimelinter.com/en/latest)
  * Base for other programming-language-specific extensions which check against customizeable syntax and code style guidelines.
* SublimeLinter-ruby: [https://github.com/SublimeLinter/SublimeLinter-ruby](https://github.com/SublimeLinter/SublimeLinter-ruby)
  * Checks against syntax and code style guidelines for the Ruby programming language.
* SublimeLinter-rubocop: [https://github.com/SublimeLinter/SublimeLinter-rubocop](https://github.com/SublimeLinter/SublimeLinter-rubocop)
  * Adds more advanced static code analysis to the Ruby linter.
  * Before this plugin can be used, you must run "gem install rubocop" to install the backend code analysis tool.

#### Step 4: Add global key-bindings under "Preferences/Key Bindings - User".

You can see "Preferences/Key Bindings - Default" for examples.

I like to set a key binding for reindenting files.

{% highlight xml %}
{ "keys": ["ctrl+a+i"], "command": "reindent", "single_line": false }
{% endhighlight %}

#### Step 5: Add global settings under "Preferences/Settings - User".

You can add any settings you want to apply across Sublime Text Editor to this file.  ([https://www.sublimetext.com/docs/3/settings.html](https://www.sublimetext.com/docs/3/settings.html)).

#### Step 6: Add project-specific settings.

If this is a new project, you can create a project-specific settings file by going to "Project/Save Project As..." and saving a file as project_name.sublime-project.

For my current project I'm using 2-space indentation, so I have the following settings in my sublime-project file:

{% highlight xml %}
"settings":
{
	"tab_size": 2,
	"translate_tabs_to_spaces": true
}
{% endhighlight %}

See [https://www.sublimetext.com/docs/3/projects.html](https://www.sublimetext.com/docs/3/projects.html) for more on Sublime Text Editor projects.

Note: It can be a good idea to check .sublime-project files into version control so everyone has the same settings, and ignore other Sublime config files.

#### Step 7: (Debian LXDE) Set up a keyboard shortcut for starting Sublime Text Editor.

This is strictly optional, but in Linux I like to have keybindings for starting terminals and development environments.

Using Debian LXDE, I added the following keybinding to ~/.config/openbox/lxde-rc.xml.  Keybindings can be added within the \<keyboard\>...\</keyboard\> object.

{% highlight xml %}
  <!-- Launch Sublime Text Editor when Ctrl+Alt+S is pressed -->
  <keybind key="C-A-s">
    <action name="Execute">
      <command>/opt/sublime_text/sublime_text</command>
    </action>
  </keybind>
{% endhighlight %}

This keybinding starts Sublime Text Editor whenever the user types "Ctrl+Alt+s".  You can use any other key combination you like.

Helpful resources:

* Sublime Text Editor 3 documentation: [https://www.sublimetext.com/docs/3/](https://www.sublimetext.com/docs/3/)
* OpenBox key bindings documentation for Linux: [http://openbox.org/wiki/Help:Actions](http://openbox.org/wiki/Help:Actions)
