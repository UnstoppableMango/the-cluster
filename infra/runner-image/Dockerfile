#syntax=docker/dockerfile:1

FROM pulumi/pulumi-nodejs:3.99.0-debian

RUN DEBIAN_FRONTEND=noninteractive \
	apt-get update && \
	apt-get install -y unzip && \
	rm -rf /var/lib/apt/lists/*
