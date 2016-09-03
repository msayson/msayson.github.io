---
layout: post
title:  "Concurrency is beautiful with the Go programming language"
date:   2016-05-02 20:30:00 -0800
categories: programming-languages
---
Golang is a general programming language designed specifically for scalable and distributed systems.  One of its largest advantages is that concurrent programming is constructed as a natural part of the language, so it is able to present a far simpler approach than many other languages.

It's been picked up by many companies that have to deal with large numbers of requests or transactions at a time (Google, Docker, Heroku, Uber, Canonical), but is also entering other markets as it becomes more popular for general applications.

### General features:

Golang is a compiled and statically typed language that supports type inference and garbage collection.

An idea it borrows from many dynamically typed languages is that a type doesn't have to specify the interfaces it implements.  Instead, the compiler validates that the type implements the required methods with correct type declarations.  This is sometimes called duck typing.  "If it walks like a duck and quacks like a duck, then it's probably a duck."

Inheritance and generics are not supported, which is a bit disconcerting when you want to write generic algorithms and data structures for heterogenous systems.  The Golang developers haven't ruled out implementing generics in the future.  However, function overloading and exceptions are intentionally not part of the language design.

### Goroutines as lightweight, concurrent processes:

I really like how Golang implements concurrent processes.  Instead of the larger, more cumbersome threads in C and Java, Golang has its own "goroutines" which are small enough to be executed in much higher quantities with little downtime.  Iron.io reported that moving from Ruby to Golang [reduced their average CPU load from 50% to 5%](https://www.iron.io/how-we-went-from-30-servers-to-2-go/), in part because of how it became much easier to handle concurrency in a scalable way.

So, how do you run a goroutine? Simple, you just say "go" before calling the function!

```go
func alpha() {
	//...
	go beta()	//Start running beta in parallel
	//...		//Continue while beta is running
}

func beta() {
	//...
}
```

Below is an example of a small program that has to handle an arbitrary number of concurrent clients.

```go
import (
	"log"
	"net"
)
func main() {
	listener, err := net.Listen("tcp", "localhost:12345")
	if err != nil {
		log.Fatal(err)
	}
	for {
		conn, err := listener.Accept() // Wait for next connection
		if err != nil {
			log.Print(err) // Connection failed
		} else {
			go handleConn(conn)
		}
	}
}
func handleConn(conn net.Conn) {
	defer conn.Close() //Close connection when no further references
	//...
}
```

### Conclusion:

I find that I enjoy working in Golang quite a bit, and while I wouldn't use it for all projects, it looks like a natural fit for many systems where concurrency support is a top priority.

If you're interested in looking into it further, I've provided some links to Golang resources below:

* Interactive tour: [https://tour.golang.org/](https://tour.golang.org/)
* How to Write Go Code: [https://golang.org/doc/code.html](https://golang.org/doc/code.html)
* Effective Go: [https://golang.org/doc/effective_go.html](https://golang.org/doc/effective_go.html)
* Additional Resources: [https://github.com/golang/go/wiki/Learn](https://github.com/golang/go/wiki/Learn)
