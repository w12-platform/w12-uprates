#!/usr/bin/env bash

set -e

echo "$CRON_SHEDULE /usr/local/bin/node /app/bin/uprates.js >> /var/log/cron.log 2>&1" | crontab
crontab -l
touch /var/log/cron.log && cron && tail -f /var/log/cron.log
