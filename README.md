# Readme

This project contains the source code for Mark Sayson's personal blog:
[https://www.marksayson.com/](https://www.marksayson.com/)

Jekyll is used to generate the blog's layout and pages from Markdown.  See [https://jekyllrb.com](https://jekyllrb.com) for information on how to use Jekyll to build static web sites.

### Developer notes
#### Setting up a developer workspace
* Clone this repository to your preferred directory.
* Install [Ruby](https://www.ruby-lang.org/en/) and [Bundler](https://bundler.io/).
* Run `bundle install` to install dependencies required by the project.

#### Running the website locally
`jekyll serve` will run the website on a local server, accessible in a browser via localhost:4000.

Code changes will be reflected on the website after refreshing the page.

#### Upgrading dependencies
The `bundle update` command can be used to upgrade any of the dependencies specified in Gemfile and Gemfile.lock.

_Note: Developers can specify which versions or version ranges of first-level dependencies they want to use in Gemfile, and Bundler generates the full dependency chain with exact versions in Gemfile.lock to ensure that all servers hosting the application are using the same dependency stack._

_This repository intentionally does not specify dependency versions in the main Gemfile, with the understanding that updates to dependency versions will be tested before pushing Gemfile.lock changes to the repository._

For example, to update the `github-pages` gem and its dependency tree, run `bundle update github-pages`, which will retrieve the latest dependency tree for `github-pages` that is consistent with the Gemfile (here we do not specify the version, so we grab the latest release) and update our local dependency tree.

Test the changes by running `jekyll serve` and verifying website functionality before committing and pushing the changes.

### License
The following directories and their content are Copyright Mark Sayson.  You may not reuse their content without my permission:

* _posts
* images

All other files are open source under the MIT license, so feel free to reuse and modify the code as you like.

Best wishes!
