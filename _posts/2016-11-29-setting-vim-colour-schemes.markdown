---
layout: post
title:  "Setting Vim colour schemes"
date:   2016-11-29 18:00:00 -0800
categories: ides-and-editors
---

The default syntax highlighting scheme is so-so, especially when it comes to the dark blue comments against a black background.

![alt text](/images/20161129_vimDefaultColourScheme.png "Vim's default colour scheme - Can you read the comments?")

Fortunately, we can easily install our own.  I prefer a colour scheme called Monokai to the pre-installed set, and the steps to install it are the same as for any other schemes.

To set up a colour scheme that will cross over sessions for the current user, add a .vim/colors directory to your home directory if it doesn't already exist.

```bash
mkdir -p ~/.vim/colors
```

Any colour schemes placed in ~/.vim/colors will be available from new Vim sessions.

As an example, I'll install the Monokai colour scheme from [https://github.com/sickill/vim-monokai](https://github.com/sickill/vim-monokai).

You can download monokai.vim from [https://github.com/sickill/vim-monokai/blob/master/colors/monokai.vim](https://github.com/sickill/vim-monokai/blob/master/colors/monokai.vim) and place it in the directory ~/.vim/colors/.

```bash
vim ~/.vimrc
```

The .vimrc configuration file below enables syntax highlighting and sets the Monokai colour scheme as our default.

```txt
" Configuration settings for Vim
" Executed on Vim start for the current user

:syntax on
:colorscheme monokai
```

You might notice that Vim uses its own scripting language (Vimscript), because, why not?  Variables, if-else loops, functions and other constructs are supported, double quotes are comments, and scripts are stored in text files with extension .vim.

Tip:
To test different colour schemes, open a file in vim and set your colour scheme using the following command.

```bash
:color monokai
```

![alt text](/images/20161129_vimSelectingNewColourScheme.png "Vim command to select from installed colour schemes.")

You can similarly just type :color followed by a space, and press tab to browse through all currently installed colour schemes.  ```:color m``` followed by a tab will autocomplete to allow you to browse all colour schemes starting with an "m".

![alt text](/images/20161129_vimMonokaiColourScheme.png "Vim with the Monokai colour scheme - Ah, much better.")

If you want to be able to use custom colour schemes in sudo mode, you can add the colour scheme files to ```/etc/vim/colors/```.  Default Vim settings are stored in ```/etc/vim/vimrc```.

```bash
sudo cp -r ~/.vim/colors/ /etc/vim/colors/
sudo vim /etc/vim/vimrc
```

Lines changed in vimrc (optional):

```bash
" Vim5 and later versions support syntax highlighting. Uncommenting the next
" line enables syntax highlighting by default.
:syntax on
:colorscheme monokai
```

Helpful resources:

* Arch Linux article for Vim: [https://wiki.archlinux.org/index.php/Vim](https://wiki.archlinux.org/index.php/Vim)
* Monokai colour scheme for Vim: [https://github.com/sickill/vim-monokai](https://github.com/sickill/vim-monokai)
