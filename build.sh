docker build -f Dockerfile-node -t mhhub.mhsolution.vn/adtech_frontend:v2.0.20 .
docker push mhhub.mhsolution.vn/adtech_frontend:v2.0.20
#docker save vda/adtech_frontend:latest > adtech_frontend.tar
#scp adtech_frontend.tar centos@master:/home/centos/uploads
