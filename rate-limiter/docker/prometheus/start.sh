#!/bin/sh

envsubst < /etc/prometheus/prometheus.yml > /etc/prometheus/prometheus.generated.yml

exec /bin/prometheus \
  --config.file=/etc/prometheus/prometheus.generated.yml \
  --storage.tsdb.path=/prometheus