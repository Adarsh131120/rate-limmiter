FROM prom/prometheus:v2.53.0

COPY docker/prometheus/prometheus.yml /etc/prometheus/prometheus.yml
COPY docker/prometheus/token /etc/prometheus/token

CMD ["--config.file=/etc/prometheus/prometheus.yml"]