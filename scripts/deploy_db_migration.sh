#!/bin/sh

project_id=${1}
repository_name=${2}
tag=${3:-latest}

image_id=$project_id/$repository_name:$tag

docker build --tag $image_id --file ../docker/db-migration/Dockerfile ..
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin $project_id
docker push $image_id
