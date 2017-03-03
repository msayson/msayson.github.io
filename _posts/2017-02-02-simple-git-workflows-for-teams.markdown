---
layout: post
title:  "Simple Git workflows for teams"
date:   2017-02-02 20:00:00 -0800
categories: git
redirect_from: "/git/2017/02/03/simple-git-workflows-for-teams"
---

There are several common workflows for managing projects using Git, and which one works best will depend on your team's structure and the complexity of your project.

If you deploy frequently, you may benefit from a structure that maintains an always-stable branch to release from, while allowing developers to work on unstable features.  If you don't host your products on your own servers, but instead have customers download software to install themselves, you may have to maintain multiple release branches that you can apply hot-fixes to.

I'll go over the pros and cons of a few simple Git workflows, hopefully providing a few ideas for developing a version control strategy.

### Introduction

One element is common to all the workflows I'll discuss: a "master" branch.  This branch is always functionally verified, with all tests passing.

Developers shouldn't push changes directly to master, but instead push to other development branches that can be merged into master after being verified.  There are several advantages to having a clean master branch:

- You're always ready for deployment.  You could release _now_ and not be worried.
- Developers always have a stable code base to start from.
- Experimental or unstable features are kept separate from the branch you deploy from until you're ready to ship them.
- If enforced by an automated policy, you avoid unintentional and intentional ad-hoc pushes that could break functionality for users.

Being able to deploy anytime, anywhere in your cycle, is probably the most transformative property of having a master branch that is always stable and fully-functional.

### Workflow 1: One master branch, one development branch

The master branch is always production-ready, and all developers push changes to a development branch.  When the development branch is reasonably stable, you announce a temporary code freeze and merge all changes to the master branch.

Pros:

- This approach is easy to use and understand.
- Every developer has the very latest features and code to work from.

Cons:

- You may have work in your development branch that is incubating but isn't necessarily ready for customers, making it difficult to deploy.
- Unless only one feature is worked on at a time, it may be challenging to review merges to master with due diligence.
- Developers have to be very, very careful about pushing changes close to release time.

This workflow is very simple, very limited, and not recommended for complex projects.  If you're the only developer working on the project, it may be sufficient, but there are still advantages to using feature branches as described below.

### Workflow 2: One master branch, multiple feature branches

The master branch is always production-ready, and all developers push changes to relevant feature branches.  When a feature is ready to be deployed, the feature branch can be merged into master.

For example, if I want to implement a new user profile page, I could create a new "profile" branch to which other developers can contribute:

- ```git checkout master```
- ```git pull``` to start from the latest source code.
- ```git checkout -b profile``` to create and check out new local branch called "profile".
- Implement features and tests, committing changes as we see fit.
- ```git push --set-upstream origin profile``` to push our changes to a new remote branch called "profile" so that other developers can contribute.  Now, everytime we push from our local "profile" branch, the changes are pushed to the remote "profile" branch.
- Once the feature is verified and ready to ship, we merge our feature branch into master.

Pros:

- This workflow is easy to use and understand.
- Developers can collaborate on multiple new features without impacting continuous deployment.
- Merge requests are focused on specific features, making code reviews easier.

Cons:

- Developers may be tempted to continue developing features for longer before merging.  This can be mitigated by encouraging feature branches to be small and focused, which in turn encourages short iterations and faster feedback.

This workflow is very flexible, and amenable to teams with many features on the go.  Variations on this model work well for teams who want to be able to deploy often while maintaining the ability to work on experimental or unstable features.

### Workflow 3: GitHub Flow

In a [2011 blog post](http://scottchacon.com/2011/08/31/github-flow.html), Scott Chacon discussed how GitHub developed their now widely-used workflow in order to deploy frequently while constantly developing new features.

The structure is very similar to Workflow 2, only customized towards GitHub and encouraging deployment of master after every successful merge of a feature branch.

- The master branch is always deployable.
- For all new development, create a descriptively named branch off of master.
- Commit to that branch locally and regularly push to a remove branch with the same name.
- When you need feedback, help, or permission to merge your changes into master, create a GitHub pull request.  This opens up an ongoing code review where other people can view the collective code changes and make comments, or accept the request to automatically merge the changes into the master branch.
- Once the feature branch is merged into master, deploy immediately.

Pros:

- Same as for Workflow 2, with the added advantage that customers receive updates as soon as they are integrated into the master branch.

Cons:

- Same as for Workflow 2, with the added risk that customers receive any issues that make it into the master branch.

Even if you don't use GitHub, the general idea behind their workflow makes sense for many teams who plan to deploy frequently, and GitHub has been influential for encouraging simple yet robust approaches to version control.

### Workflow 4: One master branch, multiple feature branches, multiple release branches

The previous workflows implicitly assume that only one software version will be in production at a given time.  This works if you provide software-as-a-service on servers that you control.  However, if you have multiple versions of your code base in production and don't control the update process, you may be forced to support multiple releases.

In this case, tagging specific commits on your master branch as release versions may not be enough.  You may have to provide patches and bug fixes to old versions of your product on an as-needed basis, in which case dedicated release branches may be more suitable than tags.

If you choose to use release branches, then once a release branch has been publicly distributed it's typically a good idea to set a code freeze for that branch and tag the last commit on the branch (eg. v1.0.1).  Then if users of an old release are unwilling to upgrade but need a patch, it's possible to apply bug fixes or cherry-pick specific changes onto the release branch, set a tag (eg. v1.0.2), and publish the updated version.

Once one release has been published, a new release branch can be created off of master, acting as the "in-development release" until the next official release date.

Pros:

- Multiple releases can be tracked and patched independently of the current master branch.
- Projects with long release cycles can more easily support patches for old releases, especially if they are out of sync with development and master branches.

Cons:

- Version control management is more complicated and cumbersome than in GitHub Flow.

Vincent Driessen introduced an expanded branching model to handle these types of scenarios, which is now often referred to as [Git-Flow](http://nvie.com/posts/a-successful-git-branching-model/).

### Conclusion

There are many Git workflows that have been successfully adopted and modified for use in teams and projects of all sizes.  In terms of general good practises, maintaining a stable and deployable master branch is always a good idea, and feature branches are useful for focusing development work and keeping code reviews manageable.

If you host your own software and deploy frequently, a lightweight workflow such as GitHub Flow or the tool-agnostic process in Workflow 2 may work well for your team.

If you have to manage multiple deployed versions of your software, or your team has longer release schedules, then release branches may be in order, and workflows such as Git-Flow formalize this.

Helpful resources:

- Scott Chacon's blog post on [GitHub Flow](http://scottchacon.com/2011/08/31/github-flow.html)
- Juan Delgado's blog post on [branching strategies](http://ustwo.com/blog/branching-strategies-with-git/)
- Vincent Driessen's blog post on [Git-Flow](http://nvie.com/posts/a-successful-git-branching-model/)
