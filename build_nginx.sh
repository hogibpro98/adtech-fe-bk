docker build -f Dockerfile -t mhhub.alert.vn/adtech_frontend:v2.1.21 .
docker push mhhub.alert.vn/adtech_frontend:v2.1.21
#docker save vda/adtech_frontend:latest > adtech_frontend.tar
#scp adtech_frontend.tar centos@master:/home/centos/uploads
