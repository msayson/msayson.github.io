---
layout: post
title:  "Improving authentication usability"
date:   2017-05-18 19:00:00 -0800
categories: security
---

In this decade, usability is king, and for good reason.  If a user can't figure out how to install a product or accomplish their primary task within a few minutes, then you've lost a potential customer.

We implicitly understand this as software users, and are starting to get it as developers.  Complex designs, unnecessary customizations, and long sequences of user actions are now being trimmed in favour of cleaner, more streamlined interfaces.  Usability testing is coming into its own as a part of the iterative development process.

Usable security has become a more explicit goal, now that we've recognized that tools that are too challenging to use [will not be widely accepted](https://medium.com/local-voices-global-change/what-good-are-secure-communications-tools-if-no-one-uses-them-690ce2bdf9ec), no matter their utility.  Usability and security in practise have become a mainstay at security conferences, and we can see some of the results in industry.

For instance, we're seeing more experimentation with authentication methods that make passwords easier to use, or that do away with them entirely.

* Password managers such as KeePassX and LastPass make it easier to securely store passwords for any number of services.  This encourages unique, stronger passwords to be used.

* OAuth providers such as Google, GitHub, and Facebook encourage third parties to leverage their services.  This removes the need for companies like Quora and Meetup to reinvent the wheel, and for users to manage additional passwords.

  * [Authentiq](https://www.authentiq.com/) takes OAuth further by allowing the user to use a phone app to authenticate online log-ins, without ever needing a password.  This is a promising but young product currently on iPhones and under development for Android.

* Pattern locks are sometimes used in cell phones in place of character passwords.  Many patterns are fairly [simple or commonly used](http://www.popularmechanics.com/technology/security/a17015/common-android-pattern-password/), so these may be much less secure than passwords in practise.

* Biometric authentication is making its way to desktops and mobile devices.  Current methods are often biased towards false positives to avoid locking out legitimate users, but are improving.

  * Fingerprint recognition is becoming more common, with Apple Touch ID leading the way.  There have been [successful attacks on fingerprint scanners](https://arstechnica.com/security/2013/09/defeating-apples-touch-id-its-easier-than-you-may-think/) that use a photocopy of fingerprints from a smooth surface, one of the earliest of which used [gummy bears](https://www.theregister.co.uk/2002/05/16/gummi_bears_defeat_fingerprint_sensors/).

  * Facial recognition has been tried by Google, Samsung, and others, but current versions can be easily fooled by [one or more photos](https://arstechnica.com/gadgets/2017/03/video-shows-galaxy-s8-face-recognition-can-be-defeated-with-a-picture/) of the person.  State-of-the-art systems are getting very good at recognizing individuals and are [already used in stores](http://fortune.com/2015/11/09/wal-mart-facial-recognition/), but it's trickier to tell the difference between an image or video of a person and the actual person.

  * Voice recognition is becoming available, but currently has to have a very high margin of error to accept people at all times, in all conditions, and in all environments.  Filtering may improve, but you may get the flu, and someone can likely get a recording of a voice similar to your own.

  * Additional biometrics being researched include [electrocardiogram-based authentication](http://www.mdpi.com/1424-8220/16/4/570) that measures signals from the heart, and [gait-based authentication](https://www.researchgate.net/publication/42803321_Biometric_Gait_Authentication_Using_Accelerometer_Sensor) that uses accelerometers to measure the distinctive way a person walks.

Biometrics such as fingerprint, face, and voice recognition can all be fooled with various levels of effort.  However, fingerprint recognition is currently more robust than either facial or voice recognition, and may offer a reasonable alternative to email or text messages for two-factor authentication.

Two-factor authentication is the practise of authenticating a user through two independent media, such as a password and a fingerprint.  It's generally a crutch for when the primary factor isn't strong enough, but we're starting to develop more painless methods of authentication to make up for this.  Eventually, the goal should be for users to barely have to think about authentication, while minimizing the probability of accepting unauthorized individuals.

Passwordless authentication is an endeavor that promises to eventually overtake the old-fashioned password, not only in usability but also in robustness.

In the meantime, there are excellent tools that make it easier to manage the passwords we still need, and reasonable passwordless methods that strike a compromise between security and ease of use.
