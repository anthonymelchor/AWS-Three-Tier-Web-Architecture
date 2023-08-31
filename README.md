# AWS-Three-Tier-Web-Architecture

### Overview
This architecture is composed of three layers: the web layer, the application layer, and the data layer. A user-facing application load balancer will be exposed, which will send the traffic to the EC2 instances of the web layer. The web layer contains a React application running on an Nginx web server. Traffic from the web layer is sent to the backend application layer through an internal load balancer. The backend application is a microservice developed in Python, running on a WSGI Gunicorn application server. The application layer interacts with the database layer, which contains an instance of Aurora MySQL. This architecture is executed in a VPC that has a public subnet. Its access to the internet will be through an internet gateway, and there are also two private subnets. All of the above exists in two availability zones.
