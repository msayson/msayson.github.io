---
layout: post
title:  "Golang Channels"
date:   2016-12-17 18:00:00 -0800
categories: programming-languages
---

The Go Programming Language has built-in communication channels, which provide type-safe one-way or two-way communication between processes.  This can be very useful for concurrent programming, such as in master-slave and map-reduce programs.

Channels can be buffered or unbuffered, where buffered channels can store multiple messages up to a declared capacity.  Once a channel is full, it blocks further writes until a process initiates a read operation.

```go
// An unbuffered integer channel, which blocks writes
// until another process is waiting to receive messages
unbufferedIntChannel := make(chan int)

// A buffered string channel, which can carry up to 4
// messages before blocking writes
bufferedStrChannel := make(chan string, 4)

// Write to a channel
bufferedStrChannel <- "Hello world!"
bufferedStrChannel <- "Your move."

// Read from a channel
message1 := <-bufferedStrChannel // "Hello world!"
message2 := <-bufferedStrChannel // "Your move."

// Clean up channels when no longer needed
close(unbufferedIntChannel)
close(bufferedStrChannel)
```

Note that ```make(chan int)``` is equivalent to ```make(chan int, 0)```.

Below is an example program that collects results from concurrent workers using a shared channel.

Each worker writes at most one result to a buffered channel that has enough capacity to hold all results at once, and only the main process reads messages from the channel.

If you need to distinguish between messages from different routines, consider creating separate channels for the separate roles.

shared_channel.go:

```go
// Example of shared channels in Golang
// Usage: go run shared_channel.go
package main

import (
  "fmt"
)

var NO_SOLUTION_FOUND string = "-1"

// Returns the first solution found by a worker,
// or NO_SOLUTION_FOUND if no solutions are found
func SolveProblem() string {
  nRoutines := 32
  solutionChannel := make(chan string, nRoutines)
  // Start up each worker in a new routine
  for routineCount := 0; routineCount < nRoutines; routineCount++ {
    go runWorker(solutionChannel)
  }
  // Retrieve solutions from the shared channel
  solution := retrieveSolution(solutionChannel, nRoutines)
  close(solutionChannel)
  return solution
}

// Searches for a solution, and writes local result to the shared channel
func runWorker(ch chan string) {
  // Do some work...
  solution := NO_SOLUTION_FOUND
  ch <- solution
}

// Returns the first solution found that is not NO_SOLUTION_FOUND,
// or NO_SOLUTION_FOUND if all routines report NO_SOLUTION_FOUND
func retrieveSolution(sharedChannel chan string, nRoutines int) string {
  var solution string
  nAliveRoutines := nRoutines
  for nAliveRoutines > 0 {
    solution = <-sharedChannel
    if solution != NO_SOLUTION_FOUND {
      return solution // Found a solution!
    } else {
      nAliveRoutines-- // No solution found by this worker
    }
  }
  return NO_SOLUTION_FOUND // All results read, no solutions found
}

func main() {
  solution := SolveProblem()
  if solution == NO_SOLUTION_FOUND {
    fmt.Println("No solution found")
  } else {
    fmt.Println("Solution:", solution)
  }
}
```

Helpful resources:

* Effective Go: [https://golang.org/doc/effective_go.html](https://golang.org/doc/effective_go.html)
