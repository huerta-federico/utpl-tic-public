FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/bin

RUN curl -L --fail --show-error --silent -o notify_push https://github.com/nextcloud/notify_push/releases/download/v1.0.0/notify_push-x86_64-unknown-linux-musl && \
    chmod +x notify_push

USER www-data

EXPOSE 7867

CMD ["/usr/local/bin/notify_push", "--port", "7867", "/var/www/html/config/config.php"]
