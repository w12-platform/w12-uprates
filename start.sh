#!/usr/bin/env bash

set -e

printenv | grep -v "no_proxy" >> /etc/environment

touch /var/log/cron.log && cron && tail -f /var/log/cron.log
