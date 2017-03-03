---
layout: post
title:  "Functional programming ideas in object-oriented languages"
date:   2016-09-02 20:30:00 -0800
categories: programming-languages
redirect_from: "/programming-languages/2016/09/03/functional-programming-ideas-in-object-oriented-languages"
---

Over the last several years, many ideas from functional programming languages have been welcomed into the object-oriented world, and are no longer only found in languages like Ruby and Scala, but also in Java 8, C# 3.0, and other languages traditionally thought of as primarily object-oriented.

Functional programming provides alternative and sometimes more natural ways to think about algorithms and how to approach problems.

For example, functional programming languages introduce the idea of handling functions as first-class citizens.  This means that functions can be passed as parameters, often generalized to accept a wide range of input types, and algorithms can be even more closely tied to behaviours rather than classes.

Pure functional languages like Haskell take this to an extreme, where everything is a function and no state is allowed.  There are some interesting benefits to this approach, including easier reasoning about concurrency since all values are immutable.

For now we'll focus on object-oriented languages as a group, using Ruby and Java as examples.

Ruby has courted functional programming ideas for longer than many other object-oriented languages, and it shows in how naturally it comes out in the language.

```ruby
def parse_artifacts(artifact_entities)
   artifact_entities.select { |entity| is_enabled?(entity) }
                    .map { |entity| to_artifact(entity) }
end

def is_enabled?(artifact_entity)
   # return true if the entity is enabled, else return false
end

def to_artifact(artifact_entity)
   # convert artifact_entity to an artifact
end
```

Even without knowing any Ruby or implementing the helper functions, you can get the gist of what's going on.

We're selecting the entities that match a given boolean condition, in this case, that the entity is enabled, and mapping the entities to artifacts through another function.

If you hadn't started from procedural or object-oriented programming languages, you might not even notice that we're using functions as parameters for the select and map functions.

Java 8 also introduces some support for functions as parameters in the form of what it calls lambda expressions.

```java
public List<Artifact> parseArtifacts(List<ArtifactEntity> entities) {
   return entities.stream()
                  .filter(entity -> isEnabled(entity))
                  .map(entity -> toArtifact(entity))
                  .collect(Collectors.toList());
}

private boolean isEnabled(ArtifactEntity entity) {
   // return true if the entity is enabled, else return false
}

private Artifact toArtifact(ArtifactEntity entity) {
   // convert artifact_entity to an artifact
}
```

There are a couple extra steps involved with Java, but compare it with another implementation we might have used a few years ago.

```java
public List<Artifact> parseArtifacts(List<ArtifactEntity> entities) {
   List<Artifact> artifacts = new ArrayList<Artifact>();
   for (ArtifactEntity entity : entities) {
      if (isEnabled(entity)) {
         artifacts.add(toArtifact(entity));
      }
   }
   return artifacts;
}

// helper functions defined as before
```

Even earlier we might have implemented something like the following:

```java
public List<Artifact> parseArtifacts(List<ArtifactEntity> entities) {
   List<Artifact> artifacts = new ArrayList<Artifact>();
   for (int i = 0; i < entities.size(); i++) {
      ArtifactEntity entity = entities.get(i);
      if (isEnabled(entity)) {
         artifacts.add(toArtifact(entity));
      }
   }
   return artifacts;
}

// helper functions defined as before
```

We don't actually care about the index of the array we're iterating over; we're not using that for anything interesting.  Conceptually, we just want to select the elements of our collection that match a given property, and convert them to another type.

Given how much closer functional ideas bring us to how we think about what we want to do when we're not thinking in terms of a particular programming language, it's refreshing to see approaches being introduced from languages with different paradigms.

After all, at a functional level, it doesn't really matter which programming language we use.  What matters is how well we translate our intentions into systems that solve problems our users care about.
