---
layout: post
title:  "Waiting until Docker containers are initialized"
date:   2017-04-15 19:00:00 -0800
categories: docker
---

An issue that a lot of people run into when automating Docker builds is in figuring out how to wait for services to be set up before running subsequent commands.

For example, you might need your database container to finish initializing before you can run your database migrations and test scripts.

A common solution is to add wait times between steps, adjusting times as necessary.  Another solution is to continuously ping the containers to check for open ports or specific files that are created during set up.

Neither strategy is ideal.  Fixed wait times are at best unnecessarily long and at worst lead to fragile builds, and open ports and created files don't reliably indicate that a Docker container is fully initialized.

A third strategy that has been suggested for database containers is to query the database every few seconds until it has been set up with the required user credentials.

<!--more-->

Example:

```bash
#!/bin/bash
set -e

# Max query attempts before consider setup failed
MAX_TRIES=3

# Returns a true-like value if and only if a query
# with the expected db and user succeeds
function dbIsReady() {
  PGPASSWORD=account_password \
  psql -h db -U account_username \
       -d database_name -c "select 1" \
  > /dev/null 2>&1
}

echo "Wait for PostgreSQL to become available..."
sleep 5
until dbIsReady || [ $MAX_TRIES -eq 0 ]; do
  echo "Waiting for PostgreSQL server, $((MAX_TRIES--)) remaining attempts..."
  sleep 5
done

if [ $MAX_TRIES -eq 0 ]
then
  echo "Error: PostgreSQL not responding, cancelling server set up"
  exit 1
fi

echo "PostgreSQL ready, starting Rails application..."
bundle exec rails s -p 3000 -b '0.0.0.0'
```

This seemed reasonable, but I found that builds kept on running into tcp errors due to the application container accessing the database container at the same time as the script's queries.  I had to keep increasing the initial wait time, which brings us back to an arbitrary fixed wait time.

Instead, I looked at how we know when a Docker container is ready when we're running docker-compose locally.  What do we look for to indicate that containers are set up?

![alt text](/images/20170415_dockerComposeUpOutput.png "Console output from 'docker-compose up'")

This is what I look for before running additional commands.  "Listening on tcp://0.0.0.0:3000", and "PostgreSQL init process complete; ready for start up."  Even if we start Docker in the background, say with ```docker-compose up --build -d```, can't we look at the same logs?

```text
$ docker-compose --help | grep log
  logs               View output from containers

$ docker-compose logs --help
View output from containers.

Usage: logs [options] [SERVICE...]

Options:
    --no-color          Produce monochrome output.
    -f, --follow        Follow log output.
    -t, --timestamps    Show timestamps.
    --tail="all"        Number of lines to show from the end of the logs
                        for each container.

$ docker-compose logs db | grep "PostgreSQL init process complete"
db_1   | PostgreSQL init process complete; ready for start up.
```

Excellent, this will work.  We can now write up a bash script to wait until both our containers are set up, using key phrases we know will be printed to logs once the containers are fully initialized and ready to accept commands.

```bash
#!/bin/bash
# waitForContainerSetup.sh
set -e

# Max query attempts before consider setup failed
MAX_TRIES=5

# Return true-like values if and only if logs
# contain the expected "ready" line
function dbIsReady() {
  docker-compose logs db | grep "PostgreSQL init process complete"
}
function railsIsReady() {
  docker-compose logs web | grep "Listening on tcp:"
}

function waitUntilServiceIsReady() {
  attempt=1
  while [ $attempt -le $MAX_TRIES ]; do
    if "$@"; then
      echo "$2 container is up!"
      break
    fi
    echo "Waiting for $2 container... (attempt: $((attempt++)))"
    sleep 5
  done

  if [ $attempt -gt $MAX_TRIES ]; then
    echo "Error: $2 not responding, cancelling set up"
    exit 1
  fi
}

waitUntilServiceIsReady dbIsReady "PostgreSQL"
waitUntilServiceIsReady railsIsReady "Rails"
```

This is the approach I'm using in my Travis CI builds, and it's worked very well so far, with none of the false failures I was seeing before and a minimal amount of wait time before tests are run.

Example of a test script that uses waitForContainerSetup.sh:

```bash
#!/bin/bash
# runTestsInDockerContainers.sh
set -e

echo "Building Docker containers..."
docker-compose up --build -d
echo "Waiting for Docker containers to finish setting up..."
./waitForContainerSetup.sh
docker-compose ps
echo "Initialize database tables and run tests..."
docker-compose run -e "RAILS_ENV=test" web rake db:create db:migrate spec
echo "Tests complete, stop and remove Docker containers..."
docker-compose down
```

![alt text](/images/20170415_travisCIWaitForDocker.png "Travis CI waiting for containers to be set up before running database migration and tests")

This approach seems to be fairly robust.  It's mitigated my builds' intermittent database set up errors, allowing me to focus on development and tests.

Resources:

* Docker documentation: [https://docs.docker.com/](https://docs.docker.com/)
* "docker-compose up" documentation: [https://docs.docker.com/compose/reference/up/](https://docs.docker.com/compose/reference/up/)
* Travis CI documentation: [https://docs.travis-ci.com/](https://docs.travis-ci.com/)
