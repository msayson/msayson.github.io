---
layout: post
title:  "Using JQuery to show or hide related elements"
date:   2016-07-16 20:30:00 -0800
categories: programming-languages
redirect_from: "/programming-languages/2016/07/17/using-jquery-to-show-or-hide-related-elements"
---
Sometimes a web page needs to display a very condensed view of information, but also allow users to easily drill down for details.  Summary tables often fit into this category when there are multiple layers of information to display.

Ideally the user shouldn't have to follow a chain of links to get to the information they care about, and if we can allow users to expand or hide detailed information without reloading the page, all the better.

Javascript is perfect for this, as we can assign listeners to toggle the visibility of elements based on user interactions.

I'll show a simple example of how to do this using JQuery, a popular Javascript library.

<!--more-->

We'll have a table with aggregate information about categories and subcategories, and write a script that toggles the visibility of Category X's subcategories when the user clicks on the Category X row.

**Specification 1: All subcategory rows should be hidden by default.**

**Specification 2: If the user clicks on Category X's row, the visibility of its child rows should be toggled.  Unrelated rows should not be affected.**

#### HTML

Assigning subcategory rows an HTML class that corresponds to their parent category will allow us to identify which HTML elements to toggle when a user selects a parent row.

We'll assign each category row a unique HTML id (eg. "category-a"), and assign each subcategory row an HTML class that can be derived from that id (eg. "category-a-subcategory").

Our specification states that subcategory rows should be hidden by default, so we'll also assign a shared CSS class of "subcategory-row".

{% highlight html %}
<table class="table table-bordered">
  <tbody>
    <tr>
      <th>Category</th>
      <th>Subcategory</th>
      <th>Total</th>
    </tr>
    <tr id="category-a" class="category-row">
      <td>A</td>
      <td></td>
      <td>5</td>
    </tr>
    <tr class="subcategory-row category-a-subcategory">
      <td></td>
      <td>A.1</td>
      <td>5</td>
    </tr>
    <tr id="category-b" class="category-row">
      <td>B</td>
      <td></td>
      <td>7</td>
    </tr>
    <tr class="subcategory-row category-b-subcategory">
      <td></td>
      <td>B.1</td>
      <td>6</td>
    </tr>
    <tr class="subcategory-row category-b-subcategory">
      <td></td>
      <td>B.2</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
{% endhighlight %}

#### Javascript

With ids and classes assigned, we can describe behaviour for those elements using Javascript.

We want to hide elements with class "subcategory-row" by default, so this will be our first line.

Next, we'll assign a click listener to elements with class "category-row".  When a user clicks on one of these elements, we'll extract the element's id in order to identify which subcategory rows to toggle.

Once we have that id (eg. "category-a"), we can construct the subcategory class (eg. "category-a-subcategory") and use JQuery to toggle the visibility of elements with that class.

{% highlight js %}
$('.subcategory-row').hide();
$('.category-row').click(function(event) {
  var subcategory_class, category_id;
  category_id = $(this).attr('id');
  subcategory_identifier = '.' + category_id + '-subcategory';
  $(subcategory_identifier).toggle();
});
{% endhighlight %}

You can check out the result at the following JSFiddle page, and test out your own changes by modifying the code and selecting "Run" on the top panel.

[https://jsfiddle.net/msayson/Lyyfgo5p/](https://jsfiddle.net/msayson/Lyyfgo5p/)

![alt-text](/images/20160716_jsfiddle_showhiderows.png "JSFiddle sandbox")
