---
layout: post
title:  "Hash functions for cryptography versus look-up"
date:   2017-03-07 20:00:00 -0800
categories: security
excerpt: "<p>A hash function accepts an arbitrary sequence of bits, such as a string or file, and outputs a corresponding sequence of bits of fixed size.  This output is known as the \"hash\" of the input.</p>"
---

## Hash functions and why we use them

A hash function accepts an arbitrary sequence of bits, such as a string or file, and outputs a corresponding sequence of bits of fixed size.  This output is known as the "hash" of the input.

Why is this helpful?  If you can work on fixed-length strings instead of files, you can compare files extremely quickly without having to read the whole file each time.  Hashes are typically small compared to their input counterparts, and therefore less expensive to store or keep in memory.

Because many hash functions are very fast at computing hashes, they are used in a large number of algorithms and data structures.  In hash tables and caches, the hash function maps inputs to table indices to yield constant-time look-up and equality comparison of entries.

## Hash function collisions

When different inputs to a hash function produce the same hash, this is called a collision.

As a trivial example, consider the following hash function:

```
// Return true if input has an odd number of characters, else false
boolean hash(string input) {
  return length(input) % 2 == 1;
}
```

This hash has the set of all strings as its input set, and the set of boolean values as its output set.  Clearly, we will have collisions, even if we only receive three inputs.  In general, *any* hash function that has fewer possible outputs than inputs will have collisions.

## Approaches for handling collisions

### Approach 1: Map hashes to linked lists of values

If our algorithm doesn't need to assume that hashes correspond to single values, we can map each hash to a linked list of values instead.  This is a fairly common approach and is easy to implement, but doesn't work when we need a one-to-one mapping between data and hashes.

### Approach 2: Check for collisions and manage them

If we require values to have unique hashes, we'll have to check additional properties of our input.  For example, we might check a file's name and size as well as its hash.  This doesn't guarantee equality, but makes us less likely to accidentally overwrite or access the wrong file.

We can then check for collisions before adding files, and either prevent a collision from entering the system or update our hash function to use a larger hash space and update all of our hashes (a fairly expensive operation which may not always help).

### Approach 3: Don't handle collisions

If we don't do anything to handle collisions, then we'll simply end up mapping multiple data entries to the same hash value, which can have the following side effects:

- Overwriting data unintentionally
- Passing the wrong data to users
- Mistaken identity, which may result in unauthorized access to resources
- Unexpected logical errors in code
  -- Eg. [SVN repositories have been corrupted](http://www.csoonline.com/article/3174793/security/sha-1-collision-can-break-svn-code-repositories.html) by passing in two files with the same hash

Some applications don't need to worry about collisions because collisions don't exist for the range of inputs they handle.  Not all applications can take this for granted.

## Properties of good hash functions

- Deterministic: A given input should always produce the same output.  This is required by almost all algorithms that use hash functions.
- Uniform: Every possible hash should have a similar probability of being produced for a random input.  This isn't strictly necessary, but reduces clustering of collisions.
- Appropriate range: A hash function should have a large enough hash space to handle all the unique inputs the application will receive.

## Properties of good look-up hash functions

Hash functions that are used to search for data have a couple additional requirements.

- Efficient: Look-up hash functions must be consistently fast, and may be required to use minimal resources depending on the task.
- Translate well to data addresses: Some algorithms use hashes directly as table indices.

## Properties of good cryptographic hash functions

Hash functions used for cryptography have a few requirements that differentiate them from other functions, which is why different hash libraries are often recommended for authentication versus look-up.

- Irreversible: It should be impractical to reconstruct the original input from its hash.

Many strong cryptographic hash functions make it so computationally expensive to reverse hashes that it may take months or years to retrieve a random input from its hash.  Of course, many inputs aren't randomly distributed (like user-selected passwords), but decent algorithms still increase the effort required to reverse salted passwords.

- Collision-resistant: It should be impractical to find different inputs that share a hash value.

Cryptographic applications particularly benefit from hash functions that make collisions of inputs from the domain space extremely unlikely.

Some applications only require the weaker property that given a *particular* input and its hash, it should be impractical to find a second input that hashes to the same value.

Hashes are often used to verify files, authenticate individuals and services, and prove knowledge of information, so it's important that a hash be difficult to produce with "incorrect" data.

Collision resistance is often prioritized over speed and efficient resource management.

- (For password hash functions) As slow as acceptable: Unlike look-up functions, hash functions that are used to verify a person's identity often try to increase the time and memory required to compute a hash.

While it may seem surprising to intentionally slow down an algorithm, this discourages unauthorized individuals from trying to brute-force their way through authentication.  It also makes it more expensive for third parties to use their own resources to iterate through hash calculations to find matches to known hashes.  This property ties in with practical irreversibility.

If it's acceptable for a login attempt to take 3 seconds, then it should take 3 seconds.  This means that a million guesses will take 10^6 guesses * (3s/guess) * (1m/60s) * (1h/60m) * (1d/24h) = 34 days.  If a billion guesses are required on average, this attack will be impractical for the average person.

## Writing your own hash functions

In general, don't write your own hash functions, except for educational value.  There are excellent standard libraries for most algorithms that rely on hashes, such as collection and cryptographic libraries.

It's notoriously difficult to develop cryptographic algorithms without subtle design flaws or vulnerabilities, and it's a useful exercise to study the vulnerabilities of known algorithms and protocols to learn from them.

[https://motherboard.vice.com/en_us/article/why-you-dont-roll-your-own-crypto](https://motherboard.vice.com/en_us/article/why-you-dont-roll-your-own-crypto)
[https://security.stackexchange.com/questions/18197/why-shouldnt-we-roll-our-own](https://security.stackexchange.com/questions/18197/why-shouldnt-we-roll-our-own)

## General-purpose cryptographic hash functions

### SHA-2: The current standard
[SHA-2](https://en.wikipedia.org/wiki/SHA-2) is a general-purpose hashing algorithm that can be set to different hash space sizes.  It's currently irreversible in practice and collision-resistant, as well as very efficient.

SHA-256 and SHA-512 are the common names for SHA-2 when set to use 256- or 512-bit hashes.  They're much stronger than older hash functions such as SHA-1 and MD5, and are still fast.  Both are considered "unbreakable" until proven otherwise, and SHA-256 is likely enough for many applications.

### SHA-3: A back-up standard
[SHA-3](https://en.wikipedia.org/wiki/SHA-3) has its own SHA3-256, SHA3-512, etc, variants and was published as the next-generation standard in 2015 but isn't yet supported by all devices and services.

SHA-3 isn't necessarily stronger than SHA-2, but was developed as a back-up algorithm in case weaknesses to SHA-2 are discovered in the future.

## Cryptographic hash functions for passwords

### PBKDF2
For scenarios such as login authentication, [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) is preferrable over basic SHA-X algorithms and was endorsed by the [US National Institute of Standards and Technology (NIST) in 2010](http://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf).  It's been thoroughly vetted and still holds up as a solid choice.

PBKDF2 takes a hash function, password, salt, number of iterations, and desired key length as its parameters, allowing developers to configure it for their use case.  Higher iteration counts slow down hash calculations more.

Since PBKDF2 doesn't consume much memory, it's possible to use GPUs to speed up offline reversal attempts in the same way as SHA-X and other simple hash functions.  Other password hash functions now try to use more memory to mitigate such attacks.

### Other password hash functions
[BCrypt](https://en.wikipedia.org/wiki/Bcrypt) and [SCrypt](https://en.wikipedia.org/wiki/Scrypt) are alternatives that are specifically designed to make it more difficult to use GPUs to speed up offline attacks (when a third party has obtained your user database).  SCrypt also intentionally uses a large amount of memory to mitigate offline RAM attacks.

A [Password Hashing Competition](https://password-hashing.net/) which completed in 2015 recommended Argon2 as a future password hash function, and time will tell whether it will supercede earlier algorithms.

Whichever algorithms you end up using, use a standard library instead of implementing your own if possible.  Many security vulnerabilities have come out of developers [misusing cryptographic algorithms](http://www.infoworld.com/article/2940551/encryption/software-developers-are-failing-to-implement-crypto-correctly-data-reveals.html) or trying to make their own.

Helpful resources:

- Wikipedia article on cryptographic hash functions: [https://en.wikipedia.org/wiki/Cryptographic_hash_function](https://en.wikipedia.org/wiki/Cryptographic_hash_function)
- Crypto Wiki article on cryptographic hash functions: [http://cryptography.wikia.com/wiki/Cryptographic_hash_function](http://cryptography.wikia.com/wiki/Cryptographic_hash_function)
- StackExchange discussion on storing passwords: [https://security.stackexchange.com/questions/211/how-to-securely-hash-passwords](https://security.stackexchange.com/questions/211/how-to-securely-hash-passwords)
- CrackStation article on secure password storage: [https://crackstation.net/hashing-security.htm](https://crackstation.net/hashing-security.htm)
