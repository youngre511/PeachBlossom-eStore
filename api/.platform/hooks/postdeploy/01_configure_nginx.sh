#!/bin/bash

# Log the start of the script
exec > >(tee /var/log/eb-hooks.log | logger -t user-data -s 2>/dev/console) 2>&1
echo "Starting Nginx configuration"

# Clean up old Nginx configurations
echo "Cleaning up old Nginx configurations"
sudo rm -f /etc/nginx/conf.d/*.conf
sudo rm -f /etc/nginx/sites-enabled/default
echo "Cleaned up old Nginx configurations"

# Create https.conf
echo "Creating https.conf"
cat << 'EOF' > /etc/nginx/conf.d/https.conf
server {
    listen 443 ssl;
    server_name api.pb.ryanyoung.codes;

    ssl_certificate      /etc/pki/tls/certs/server.crt;
    ssl_certificate_key  /etc/pki/tls/certs/server.key;

    ssl_session_timeout  5m;
    ssl_protocols  TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers   on;

    access_log /var/log/nginx/healthd/application.log healthd;
    access_log /var/log/nginx/access.log main;

    client_max_body_size 20M;

    location / {
        proxy_pass  http://nodejs;
        proxy_set_header   Connection "";
        proxy_http_version 1.1;
        proxy_set_header        Host            $host;
        proxy_set_header        X-Real-IP       $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto https;
    }
}
EOF
echo "Created https.conf"

# Retrieve SSL Certificate from SSM Parameter Store
echo "Retrieving SSL certificate from SSM Parameter Store"
aws ssm get-parameter --name "/PeachBlossom/ssl/certificate" --with-decryption --output text --query Parameter.Value > /etc/pki/tls/certs/server.crt
if [ $? -ne 0 ]; then
    echo "Failed to retrieve SSL certificate."
    exit 1
fi
echo "Retrieved SSL certificate"

# Retrieve Private Key from SSM Parameter Store
echo "Retrieving private key from SSM Parameter Store"
aws ssm get-parameter --name "/PeachBlossom/ssl/privatekey" --with-decryption --output text --query Parameter.Value > /etc/pki/tls/certs/server.key
if [ $? -ne 0 ]; then
    echo "Failed to retrieve private key."
    exit 1
fi
echo "Retrieved private key"

# Set permissions on the certificate and key
chmod 600 /etc/pki/tls/certs/server.crt
chmod 600 /etc/pki/tls/certs/server.key


# Create nginx.conf
echo "Creating nginx.conf"
cat << 'EOF' > /etc/nginx/nginx.conf
user                    nginx;
worker_processes        auto;
error_log               /var/log/nginx/error.log;
pid                     /var/run/nginx.pid;

events {
    worker_connections  2048;
}

http {
    types_hash_max_size 4096;
    types_hash_bucket_size 128;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;
    log_format  main    '$remote_addr - $remote_user [$time_local] "$request" '
                        '$status $body_bytes_sent "$http_referer" '
                        '"$http_user_agent" "$http_x_forwarded_for"';
    log_format healthd  '$msec"$uri"$status"$request_time"$upstream_response_time"'
                        '"$http_ssl_protocol""$http_ssl_cipher""$body_bytes_sent""$http_x_forwarded_for"';
    access_log          /var/log/nginx/access.log  main;
    sendfile            on;
    keepalive_timeout   65;

    client_max_body_size 20M; 

    include             /etc/nginx/conf.d/*.conf;
}
EOF
echo "Created nginx.conf"


# Create upstream.conf
echo "Creating upstream.conf"
cat << 'EOF' > /etc/nginx/conf.d/upstream.conf
upstream nodejs {
    server 127.0.0.1:8080;  # Adjust the IP address and port as needed
}
EOF
echo "Created upstream.conf"

# Create logrotate configuration for Nginx
echo "Creating logrotate configuration"
cat << 'EOF' > /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nginx adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
EOF
echo "Created logrotate configuration"

# Restart nginx and log the status
echo "Restarting nginx..." >> /var/log/eb-hooks.log
if service nginx restart >> /var/log/eb-hooks.log 2>&1; then
    echo "Nginx restarted successfully." >> /var/log/eb-hooks.log
else
    echo "Failed to restart Nginx." >> /var/log/eb-hooks.log
    exit 1
fi

# Log the end of the script
echo "Nginx configuration script completed" >> /var/log/eb-hooks.log