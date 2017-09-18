---
layout: post
title:  "Enabling regular expressions in SQLite with Rails"
date:   2017-08-05 12:00:00 -0800
categories: programming-languages
---

Recently I was looking into writing custom functions for SQLite in a Rails application, specifically to support regular expressions.  It took a few attempts to find a good solution, so I thought it might be worth posting the end result.

### REGEXP and SQLite

The REGEXP operator is defined in SQLite, but using it results in an error because [the corresponding database function isn't implemented](https://sqlite.org/lang_expr.html#regexp).

Instead, developers have to provide their own implementation of `regexp(pattern, expression)`, and then SQLite will map `column_name REGEXP pattern` to `regexp(pattern, column_name)` to provide the same developer-facing syntax as other database systems like MySQL.

For example,

```sql
SELECT * FROM products WHERE name REGEXP '^Chipotle.*Burrito';
```

will return all products with names that begin with "Chipotle" and contain the word "Burrito".

### Creating custom functions in SQLite

User-defined functions aren't restricted to regexp, and SQLite provides a `create_function` utility that can be used to set up any function you wish.

The Ruby gem [sqlite3](http://www.rubydoc.info/gems/sqlite3/1.3.13/SQLite3/Database:create_function) provides the following `create_function` API:

```ruby
create_function(
  function_name,
  number_of_arguments,
  text_representation = Constants::TextRep::ANY # This parameter is optional
)
```

### Creating custom SQLite functions in Rails

I had to try a few alternatives before I hit on a solution that worked consistently, because SQLite doesn't store user-defined functions in the database like other systems.  It only stores them in local memory.  This means that you have to load any user-defined functions into SQLite every time you start up the database.

Fortunately, Rails provides an elegant way to run code on application start-up through [initializer files](http://guides.rubyonrails.org/configuring.html#using-initializer-files), which are loaded after frameworks and gems.

Initializer files are saved in the /config/initializers directory, and in this case we can add our own Ruby script to extend the SQLite connector's initialization code.

Below is the solution I ended up using, which implements a case-insensitive REGEXP pattern matcher.  You can configure this code to implement any function you like.

```ruby
# /config/initializers/database_functions.rb
ActiveRecord::ConnectionAdapters::AbstractAdapter.class_eval do
  alias_method :orig_initialize, :initialize

  # Extend database initialization to add our own functions
  def initialize(connection, logger = nil, pool = nil)
    orig_initialize(connection, logger, pool)

    # Initializer for SQLite3 databases
    if connection.is_a? SQLite3::Database
      # Set up function to provide SQLite REGEXP support
      connection.create_function('regexp', 2) do |fn, pattern, expr|
        # Ignore case in our regex expressions
        matcher = Regexp.new(pattern.to_s, Regexp::IGNORECASE)
        # Return 1 if expression matches our regex, 0 otherwise
        fn.result = expr.to_s.match(matcher) ? 1 : 0
      end
    end
  end
end
```

### Calling user-defined SQLite functions

SQLite maps `expression REGEXP pattern` to `regexp(pattern, expression)` for compatibility with other database management systems, so you can use either format in your SQL expressions.

For new functions that you create, you can call them just as you defined them.  If you called `create_function('my_function', 1)`, you would use `my_function(arg)` directly in your SQL expressions.  For example, `SELECT my_function(name) FROM products;`.

### An aside on SQLite

SQLite is an open source database engine intended to provide lightweight and efficient databases for small-scale applications.  It only supports one write operation at a time and stores all data on a single file, so it's a better choice for single-user devices and small-scale test scenarios than for systems that need to support many concurrent writers or contain large amounts of data.

For applications that need to work at a larger scale, other database management systems such as PostgreSQL, MariaDB, or MySQL are more suitable.

### Helpful resources

* RailsGuides post on [configuring applications using initializers](http://guides.rubyonrails.org/configuring.html#using-initializer-files)
* SQLite documentation on [REGEXP](https://sqlite.org/lang_expr.html#regexp)
* SQLite API for creating user-defined functions in [Ruby](http://www.rubydoc.info/gems/sqlite3/1.3.13/SQLite3/Database:create_function), [Python 3](https://docs.python.org/3.4/library/sqlite3.html#sqlite3.Connection.create_function), [PHP](http://php.net/manual/en/function.sqlite-create-function.php), and [C](https://sqlite.org/c3ref/create_function.html)
* StackOverflow post on [using Rails initializers to add custom functions to SQLite](https://stackoverflow.com/questions/18318873/can-i-hook-into-activerecord-connection-establishment) - Thanks Jim!
