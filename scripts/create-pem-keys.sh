mkdir -p certs
openssl genrsa -out certs/private.pem 2048
openssl rsa -in certs/private.pem -outform PEM -pubout -out certs/public.pem
echo "✅ RSA keys (public and private) generated in ./certs/"