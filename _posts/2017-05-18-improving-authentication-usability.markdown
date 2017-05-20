---
layout: post
title:  "Improving authentication usability"
date:   2017-05-18 19:00:00 -0800
categories: security
excerpt: "<p>Usable security has become a more explicit goal, now that we've recognized that tools that are too challenging to use will not be widely accepted, no matter their utility.  Usability and security in practise have become a mainstay at security conferences, and we can see some of the results in industry.</p>
<p>For instance, we're seeing more experimentation with authentication methods that make passwords easier to use, or that do away with them entirely.</p>"
---

### Why usability?

In this decade, usability is king, and for good reason.  If a user can't figure out how to install a product or accomplish their primary task within a few minutes, then you've lost a potential customer.

We implicitly understand this as software users, and are starting to get it as developers.  Complex designs, unnecessary customizations, and long sequences of user actions are now being trimmed in favour of cleaner, more streamlined interfaces.  Usability testing is coming into its own as a part of the iterative development process.

Usability is just as important in the security sector, as we know that tools that are too challenging to use [will not be widely accepted](https://medium.com/local-voices-global-change/what-good-are-secure-communications-tools-if-no-one-uses-them-690ce2bdf9ec), no matter their utility.  Likewise, users who are annoyed by onerous processes will look for ways to bypass them, rendering them moot.

### How has the security field evolved with respect to usability?

Usable security has become a more explicit goal in the industry, and has become a mainstay at security conferences as more companies have taken an interest.  We can see many of the results already.

Full-disk encryption can now be easily enabled on many desktops and mobile devices, many cloud storage services offer automatic backups, mobile apps such as Signal promote secure communication, and we're seeing more experimentation with authentication methods that make passwords easier to use, or that do away with them entirely.

### What's wrong with traditional authentication?

The traditional approach to authentication is to have a user choose their own user ID and password for every new service.  We already know that this is a bad idea.  It's difficult to remember a large number of unique passwords, so people end up using simple passwords and sharing them across accounts.

Worse, these accounts often share identifying information about the person such as their name and email address, so if one website's passwords are leaked, the security of other services are affected.

Fortunately, there are ways to improve both the usability and the security of user authentication.

### Improvements and alternatives to passwords

* Password managers such as KeePass and LastPass make it easier to securely store passwords for any number of services.  This encourages unique, stronger passwords to be used.

* OAuth providers such as Google, GitHub, and Facebook encourage third parties to leverage their services.  This removes the need for companies like Quora and Meetup to reinvent the wheel, and for users to manage additional passwords.

  * [Authentiq](https://www.authentiq.com/) takes OAuth further by allowing the user to use a phone app to authenticate log-ins, without ever needing a password.  This is a promising idea if it can be done correctly.
<br><br>
* Pattern locks are sometimes used in cell phones in place of character passwords.  Many patterns are fairly [simple or commonly used](http://www.popularmechanics.com/technology/security/a17015/common-android-pattern-password/), so these may be much less secure than passwords in practise.

* Physical tokens are used by some companies in combination with another form of authentication.
  * [RSA SecurID](https://en.wikipedia.org/wiki/RSA_SecurID) is a one-time passcode generator that is still used by some financial institutions.
  * USB keys are another option, however, [not everyone thinks that they're a good idea](https://www.secsign.com/usb-authentication-keys-tokens-bad-idea/) given the vulnerabilities inherent to USB devices.
<br><br>
* Biometric authentication is making its way to desktops and mobile devices.  Current methods are often biased towards false positives to avoid locking out legitimate users, but are improving.

  * Fingerprint recognition is becoming more common, with Apple Touch ID leading the way.  There have been [successful attacks on fingerprint scanners](https://arstechnica.com/security/2013/09/defeating-apples-touch-id-its-easier-than-you-may-think/) that use a photocopy of fingerprints from a smooth surface, one of the earliest of which used [gummy bears](https://www.theregister.co.uk/2002/05/16/gummi_bears_defeat_fingerprint_sensors/).

  * Facial recognition has been tried by Google, Samsung, and others, but current versions can be easily fooled by [one or more photos](https://arstechnica.com/gadgets/2017/03/video-shows-galaxy-s8-face-recognition-can-be-defeated-with-a-picture/) of the person.  State-of-the-art systems are getting very good at recognizing individuals and are [already used in stores](http://fortune.com/2015/11/09/wal-mart-facial-recognition/), but it's trickier to tell the difference between an image or video of a person and the actual person.

  * Voice recognition is becoming available, but currently has to have a very high margin of error to accept people at all times, in all conditions, and in all environments.  Filtering may improve, but you may get the flu, and someone can likely get a recording of a voice similar to your own.

  * Additional biometrics being researched include [electrocardiogram-based authentication](http://www.mdpi.com/1424-8220/16/4/570) that measures signals from the heart, and [gait-based authentication](https://www.researchgate.net/publication/42803321_Biometric_Gait_Authentication_Using_Accelerometer_Sensor) that uses accelerometers to measure the distinctive way a person walks.

Biometrics such as fingerprint, face, and voice recognition can all be fooled with various levels of effort.  However, fingerprints are more robust than face and voice, and may offer a reasonable alternative to email or text messages for two-factor authentication, especially as the technology improves.

### Two-factor authentication

Two-factor authentication is the practise of authenticating a user through two independent media, such as a password and a random passcode sent in a text message.

It's generally a crutch for when the primary factor isn't strong enough, and can be an annoyance to users, but we're starting to develop more painless methods of authentication to make up for this.  Eventually, the goal should be for users to barely have to think about authentication, while minimizing the probability of accepting unauthorized individuals.

### Conclusion

Usability is an important aspect of any system, and helps to determines how likely a product or feature is to succeed.  We're starting to see improvements in authentication, but it's up to us to use and improve the solutions available.

Passwordless authentication is an endeavor that promises to eventually overtake the old-fashioned password, not only in usability but also in robustness.

In the meantime, there are excellent tools that make it easier to manage the passwords we still need, and reasonable passwordless methods that strike a compromise between security and ease of use.
