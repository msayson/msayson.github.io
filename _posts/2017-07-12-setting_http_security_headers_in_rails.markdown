---
layout: post
title:  "Setting HTTP security headers in Rails"
date:   2017-07-12 12:00:00 -0800
categories: security
---
HTTP security headers are easy to configure, and provide a flexible way to mitigate several types of cross-site scripting and sniffing attacks.

They're worth adding to any dynamic website, since they only take a few minutes to set up and are supported by most modern browsers.

## Strict-Transport-Security

The Strict-Transport-Security header requires the browser to use HTTPS, and should be used by all sites that intend for their users to connect over SSL.

This can be easily enabled in Rails by setting <code>config.force_ssl = true</code> in configuration settings.

```ruby
# /config/environments/production.rb
Rails.application.configure do
  # Force all access to the app over SSL, use Strict-Transport-Security.
  config.force_ssl = true
  # (Other configuration settings...)
end
```

## Content-Security-Policy

The Content-Security-Policy header allows developers to whitelist sources of scripts, forms, and other media.  If only trusted sources are allowed, this wipes out a whole class of client-side injection attacks.

It supports multiple directives, allowing developers to set simple or granular permissions.  Below are a few such directives, with a more complete list available at [https://content-security-policy.com/](https://content-security-policy.com/).

<table class="table-small-bordered">
  <thead>
    <tr>
      <th>Directive</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <td><code>default-src</code></td>
    <td>
      The default policy for loading content.
    </td>
  </tr>
  <tr>
    <td><code>script-src</code></td>
    <td>
      Defines valid sources of JavaScript.
    </td>
  </tr>
  <tr>
    <td><code>style-src</code></td>
    <td>
      Defines valid sources of stylesheets.
    </td>
  </tr>
  <tr>
    <td><code>img-src</code></td>
    <td>
      Defines valid sources of images.
    </td>
  </tr>
  <tr>
    <td><code>connect-src</code></td>
    <td>
      Applies to <code>XMLHttpRequest</code> (AJAX), <code>WebSocket</code>, and <code>EventSource</code>.
    </td>
  </tr>
  <tr>
    <td><code>font-src</code></td>
    <td>
      Defines valid sources of fonts.
    </td>
  </tr>
  <tr>
    <td><code>object-src</code></td>
    <td>
      Defines valid sources of plugins, eg <code>&lt;object&gt;</code>, <code>&lt;embed&gt;</code> or <code>&lt;applet&gt;</code>.
    </td>
  </tr>
  <tr>
    <td><code>media-src</code></td>
    <td>
      Defines valid sources of audio and video.
    </td>
  </tr>
  <tr>
    <td><code>child-src</code></td>
    <td>
      Defines valid sources for web workers and nested browsing contexts loaded using elements such as <code>&lt;frame&gt;</code> and <code>&lt;iframe&gt;</code>.
    </td>
  </tr>
  <tr>
    <td><code>form-action</code></td>
    <td>
      Defines valid sources that can be used as a HTML <code>&lt;form&gt;</code> action.
    </td>
  </tr>
  <tr>
    <td><code>frame-ancestors</code></td>
    <td>
      Defines valid sources for embedding the resource using <code>&lt;frame&gt;</code>, <code>&lt;iframe&gt;</code>, <code>&lt;object&gt;</code>, <code>&lt;embed&gt;</code>, and <code>&lt;applet&gt;</code>.
    </td>
  </tr>
  </tbody>
</table>

Source whitelists use spaces to separate patterns, with supported values including <code>'none'</code>, <code>'self'</code> for local resources, and specific URLs of the form <code>https://www.google.com</code>.

<table class="table-small-bordered full-width">
  <thead>
    <tr>
      <th>Source Value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <td><code>*</code></td>
    <td>
      Allow any URLs except those using data:, blob:, or filesystem:.
    </td>
  </tr>
  <tr>
    <td><code>'none'</code></td>
    <td>
      Do not load this type of resource.
    </td>
  </tr>
  <tr>
    <td><code>'self'</code></td>
    <td>
      Allow resources from the same origin (scheme, host, and port).
    </td>
  </tr>
  <tr>
    <td><code>data:</code></td>
    <td>
      Allow resources via the data scheme.
    </td>
  </tr>
  <tr>
    <td><code>https:</code></td>
    <td>
      Allow any resources loaded over HTTPS.
    </td>
  </tr>
  <tr>
    <td><code>https://your-domain.com</code></td>
    <td>
      Allow resources over HTTPS from the given domain.
    </td>
  </tr>
  <tr>
    <td><code>your-domain.com</code></td>
    <td>
      Allow resources from the given domain.
    </td>
  </tr>
  <tr>
    <td><code>*.your-domain.com</code></td>
    <td>
      Allow resources from any subdomain of your-domain.com.
    </td>
  </tr>
  <tr>
    <td><code>'unsafe-inline'</code></td>
    <td>
      Allow inline source elements (not recommended).
    </td>
  </tr>
  <tr>
    <td><code>'unsafe-eval'</code></td>
    <td>
      Allow unsafe dynamic code evaluation of resources (not recommended).
    </td>
  </tr>
  <tr>
    <td><code>'nonce-123456789'</code></td>
    <td>
      Allow resources with matching nonce attribute values. Eg. <code>&lt;script nonce="123456789"&gt;alert("hello");&lt;/script&gt;</code>.
    </td>
  </tr>
  <tr>
    <td><code>'sha256-HASHVALUE'</code></td>
    <td>
      Allow resources with matching SHA-256 hashes. Doesn't restrict javascript: URLs.
    </td>
  </tr>
  </tbody>
</table>

Examples:

* <code>default-src 'self';</code> only allows local resources.

* <code>default-src 'self'; font-src 'self' fonts.gstatic.com;</code> allows any local resources, as well as fonts from fonts.gstatic.com.

* <code>default-src 'none'; img-src 'self'; script-src 'self'; connect-src 'self'; style-src 'self';</code> only allows local images, Javascript, and AJAX, and CSS.

It's preferable to structure your project to avoid allowing 'unsafe-inline' and 'unsafe-eval', as in-line scripts and executable dynamic code open up several types of script injection attacks.

If you want to test a new policy, the <code>Content-Security-Policy-Report-Only</code> header supports the same values but doesn't affect users; it only reports errors to the console. You can use your browser's developer tools to view which resources would be rejected by its policy.

## X-Content-Type-Options

The X-Content-Type-Options header only has one valid value, <code>nosniff</code>, and protects against MIME type attacks by rejecting requests with incorrect MIME types.

## X-Frame-Options

The X-Frame-Options header allows developers to restrict who can render their pages in <code>&lt;frame&gt;</code> and <code>&lt;iframe&gt;</code> elements, to prevent untrusted sites from setting up clickjacking attacks on your content.

<table class="table-small-bordered full-width">
  <thead>
    <tr>
      <th>Value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <td><code>DENY</code></td>
    <td>
      Prevent any site from framing this page's content.
    </td>
  </tr>
  <tr>
    <td><code>SAMEORIGIN</code></td>
    <td>
      Only allow the current site to frame this page's content.
    </td>
  </tr>
  <tr>
    <td><code>ALLOW-FROM http://example.com</code></td>
    <td>
      Allow the specified site to frame this page's content.<br>
      <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options">Only supported by a few browsers</a>.
    </td>
  </tr>
  </tbody>
</table>

<code>DENY</code> or <code>SAMEORIGIN</code> are recommended for most websites, as incomplete browser support will cause the ALLOW-FROM setting to be ignored for many users.

## X-Xss-Protection

The X-Xss-Protection header prevents pages from loading when the browser detects reflected cross-site scripting (XSS) attacks.

<table class="table-small-bordered full-width">
  <thead>
    <tr>
      <th>Value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <td><code>0</code></td>
    <td>
      Don't perform any XSS filtering.
    </td>
  </tr>
  <tr>
    <td><code>1</code></td>
    <td>
      If a cross-scripting attack is detected, sanitize the page to remove the unsafe elements.
    </td>
  </tr>
  <tr>
    <td><code>1; mode=block</code></td>
    <td>
      If a cross-scripting attack is detected, prevent rendering of the page.
    </td>
  </tr>
  </tbody>
</table>

<code>1; mode=block</code> is the strongest setting, and is recommended for most websites.

## Referrer-Policy

When a user navigates between web pages, the browser often sends the current URL to the destination website within the Referrer response header.

The Referrer-Policy header controls how much information about the current URL to include.

<table class="table-small-bordered full-width">
  <thead>
    <tr>
      <th>Value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <td><code>no-referrer</code></td>
    <td>
      Exclude the referrer header when navigating to other pages.
    </td>
  </tr>
  <tr>
    <td><code>no-referrer-when-downgrade</code></td>
    <td>
      When navigating to HTTPS to HTTP, exclude the referrer.<br>
      Otherwise, send the full URL in the referrer header.
    </td>
  </tr>
  <tr>
    <td><code>same-origin</code></td>
    <td>
      When navigating within the origin site, send the full URL.<br>
      When navigating to other sites, exclude the referrer.
    </td>
  </tr>
  <tr>
    <td><code>origin</code></td>
    <td>
      Send the URL without path information in the referrer header.
    </td>
  </tr>
  <tr>
    <td><code>strict-origin</code></td>
    <td>
      When navigating to HTTPS to HTTP, exclude the referrer.<br>
      Otherwise, send the URL without path information.
    </td>
  </tr>
  <tr>
    <td><code>origin-when-cross-origin</code></td>
    <td>
      When navigating within the origin site, send the full URL.<br>
      When navigating to other sites, send the URL without path information.
    </td>
  </tr>
  <tr>
    <td><code>strict-origin-when-cross-origin</code></td>
    <td>
      When navigating from HTTPS to HTTP, exclude the referrer. 
      Otherwise, when navigating within the origin site, send the full URL, and when navigating to other sites, send the URL without path information.
    </td>
  </tr>
  <tr>
    <td><code>unsafe-url</code></td>
    <td>
      Send the full URL when navigating to any site.
    </td>
  </tr>
  </tbody>
</table>

The "strict" values avoid sending path information when moving from secure to insecure connections, and are preferable over their non-strict variants.

The Referrer-Policy can be useful for restricting how much information about your URLs to pass on, especially when there may be confidential information in the URL paths.

## Setting security headers in Rails

In Rails applications, security headers can be set in either <code>config/application.rb</code> or in specific <code>/config/environments/</code> files.

For the example application, [Rails5_GoogleOAuth2](https://github.com/msayson/Rails5_GoogleOAuth2), I currently use the following settings:

```ruby
# /config/environments/production.rb
Rails.application.configure do
  # Force all access to the app over SSL, use Strict-Transport-Security.
  config.force_ssl = true

  # Set HTTP/S security headers
  config.action_dispatch.default_headers = {
    'Content-Security-Policy' =>
      "default-src 'self' https://accounts.google.com; " \
      "img-src 'self' https://accounts.google.com https://travis-ci.org https://api.travis-ci.org; " \
      "media-src 'none'; " \
      "object-src 'none'; " \
      "script-src 'self' https://accounts.google.com; " \
      "style-src 'self' https://accounts.google.com https://travis-ci.org; ",
    'Referrer-Policy' => 'strict-origin-when-cross-origin',
    'X-Content-Type-Options' => 'nosniff',
    'X-Frame-Options' => 'SAMEORIGIN',
    'X-XSS-Protection' => '1; mode=block'
  }
  # (Other configuration settings...)
end
```

## Testing your website

[SecurityHeaders.io](https://securityheaders.io/) is an online tool by Scott Helme that scans web pages and reports recommended changes to their HTTP security headers.

Below are the reports for the example Rails app before and after the changes.

Before applying the changes, the report indicates issues with Strict-Transport-Security, Content-Security-Policy, Public-Key-Pins, and Referrer-Policy headers, with links to information on how to resolve them.

Heroku defaults took care of the other headers, however, by setting them explicitly we can maintain values if we move the application.

![alt text](/images/20170712_security_headers_report_before_changes.png "SecurityHeaders.io report before updating HTTP security headers")

After the changes, there is one remaining warning for Public-Key-Pins, which we didn't set.  HTTP Public Key Pinning (HPKP) allows developers to define which cryptographic identifies browsers should accept from the website, and protects against a Certificate Authority being compromised.

There are a couple steps required to use this header, but it's supposed to be relatively straightforward, so I may look into this in the near future.

![alt text](/images/20170712_security_headers_report_after_changes.png "SecurityHeaders.io report after updating HTTP security headers")

There isn't an obvious way to configure HTTP security headers for GitHub Pages sites, so this blog currently fails the SecurityHeaders.io test.  Since the site's content is all static and in the public-domain, cross-site scripting attacks aren't a high risk, but I'll keep an eye out for solutions.

Helpful resources:

* [RailsGuides documentation](http://guides.rubyonrails.org/configuring.html) for configuring Rails applications
* [Content Security Policy Reference](https://content-security-policy.com/) by Foundeo
* [OWASP security tips](https://www.owasp.org/index.php/Ruby_on_Rails_Cheatsheet) for Rails applications
* [Mozilla documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) on HTTP headers
* [SecurityHeaders.io](https://securityheaders.io/): a website that analyzes a web page's HTTP response headers
* [Rails5_GoogleOAuth2](https://github.com/msayson/Rails5_GoogleOAuth2): an example Rails app that implements the changes in this post
