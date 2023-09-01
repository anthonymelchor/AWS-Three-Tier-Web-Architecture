# AWS Three Tier Web Architecture

### Overview
This architecture is composed of three layers: the web layer, the application layer, and the data layer. A user-facing application load balancer will be exposed, which will send the traffic to the EC2 instances of the web layer. The web layer contains a React application running on an Nginx web server. Traffic from the web layer is sent to the backend application layer through an internal load balancer. The backend application is a microservice developed in Python, running on a WSGI Gunicorn application server. The application layer interacts with the database layer, which contains an instance of Aurora MySQL. This architecture is executed in a VPC that has 2 public subnet. Its access to the internet will be through an internet gateway, and there are also 4 private subnets. All of the above exists in two availability zones.

## Setting up some details

- First, clone the project code from the repository
```
git clone https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture.git
```
Create an S3 bucket that will be used later in this hands-on.
- Go to the S3 service in the console and create a new bucket and add a name for the bucket

![27](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/e86c9536-02c4-4e22-bb20-59277d20a71e)

Now, we will create a role that includes policies allowing EC2 instances to download the source code of the applications and use Systems Manager Session Manager for a secure connection.

- Select "EC2" as the use case

![28](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/3dbbed2d-3873-43e0-b20f-375c27616b03)

In the "Add permissions" option, type 'AmazonSSMManagedInstanceCore' and 'AmazonS3ReadOnlyAccess' in the search box, and select both policies.

![29](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/68099f77-2577-4e82-a859-9ccb41bda4f1)

- Add a name to the role and click on create role

![30](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/c372bb99-4665-4969-b5b6-87ae86f15292)

## VPC and Subnets

### Creating VPC

- Go to the VPC service in the Amazon console. In the left menu, select "Your VPCs", and then create a new VPC

![1](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/30ea8d87-6e3c-4612-8b5c-4d8c1c204686)

- Select the "VPC only" option, assign a new name, configure a CIDR range and click on the create button.

![2](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/2dd595cf-9971-44a7-a492-60586d1a3979)

### Creating Subnets

- Go to the left menu, select "Subnets," and create a new subnet.
- We're going to set up six subnets across two availability zones. Here's the breakdown: two public subnets for the web layer instances, each in a different availability zone. Then, we'll have two private subnets for the application layer instances and another two private subnets for the data layer. These last two will also be spread across different availability zones

![image](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/a89e1ebd-2ff0-442d-a70d-e0aab46dced0)

- Select the VPC you created earlier, and add the subnet name and CIDR range as indicated in the table above.

![3](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/aae5be42-1c25-44ed-8c87-9eaaf26eef1f)

Follow the steps mentioned above to create all the subnets. At the end, you will see something similar to the image in your AWS console.

![4](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/682cbd83-cb06-4cbb-a0a0-e3496720cd82)

### Creating Internet Gateway

- Now we will create an internet gateway to provide internet access to our instances in the public subnet. To do this, click on the "Internet Gateways" option in the left menu of the VPC service, and then click on the "Create Internet Gateway" button.
- Assign a name and click on the "Create Internet Gateway" button.

![5](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/b0395e6d-32db-4e69-9d51-a7c07c2a1c6b)

Once the internet gateway has been created, proceed to attach it to the VPC you created in the previous steps.

![6](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/6f112d59-c720-4b49-b6ee-43d508c569ee)

![7](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/5a8a0006-0624-4b08-99c7-9c686500a96e)

### Creating Nat Gateway

We will create a Nat Gateway. A NAT Gateway is used to allow multiple devices on a private network to access the internet
We create a NAT Gateway in each of the public subnets for high availability.
- In the VPC service, go to the left menu, click on the "Nat Gateway" option, and then click on "Create NAT Gateway".
- Add a name for the NAT Gateway. In the "Subnet" option, select one of the two public subnets created earlier, add an elastic IP, and click on the "Create Nat Gateway" button

![8](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/8b7fea1d-41fa-4585-bc08-7f1a5ea0552b)

Repeat the above steps to create the second NAT Gateway. This time, select the other public subnet.

### Creating Route tables

Now we will create route tables to route our network traffic. Initially, we will create a route table to route the traffic from the VPC to the Internet Gateway created in the previous steps. To do so:
- In the VPC service, navigate to the "Route Tables" option in the left menu.
- Click on the "Create Route Table" button.
- Provide a name for the route table.
- Select the VPC you created for this hands-on activity ('aws3-tier').
- Finally, click on the "Create Route Table" button to complete the process.

![9](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/5acccb68-9088-43d6-9340-5cd685f7967c)

Once the route table is created, we add a route to our Internet Gateway as mentioned above. The purpose of this is to allow the VPC resources located in the public subnets to access the Internet.

![10](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/d6f89527-82bf-4d61-aa17-459da57793bd)

Then edit the subnet associations and select the previously created public subnets

![11](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/9d0cbd37-0d9c-4f21-9cc9-b19b8ac8ebcf)

Now we will create two more routing tables, one for each private subnet of our application layer in each availability zone. This will allow communication from resources in private subnets to external destinations, such as the internet.

![12](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/963a6c40-b2f8-479e-a70b-d3796d3755d3)

![13](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/0291475b-6a39-49a8-bf53-2fef19d90023)

![14](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/d2f514d3-5718-4e4a-9fb4-a43a6d30f41a)

Follow the steps above to create the second route table and assign the second NAT Gateway as the target route

### Creating Security Groups

With the security groups, the traffic rules for the ec2 instances and the load balancers will be established.

Initially, a security group will be created for the external load balancer, facing the internet. In the left menu, select "Security Groups," and then click on "Create Security Group.

Add a name for the security group, select the VPC created for this hands-on project, and add an HTTP inbound rule as shown in the image below

![15](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/9a4da700-f4a7-4c3d-97f6-41889a822233)

Now we will create a security group for the web layer of the architecture. We will add an HTTP inbound rule that allows traffic from the security group created earlier, and another HTTP inbound rule that allows traffic from our IP. This is in order to test later.

![16](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/7ed1982a-5a4d-4b4b-bd31-135e3eb1362f)

We created a new security group for the internal load balancer. Here we will add an HTTP inbound rule that will allow traffic from the web layer security group.

![17](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/de2a28fa-9277-49f4-a1b8-16984c85e39d)

We created another security group for our private instances. We will add a TCP inbound rule on port 8000 that allows traffic from the internal balancer security group. This is the port on which our backend is running. Add another TCP rule to allow traffic from our IP for testing purposes.

![18](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/8666ae88-375b-4d8b-aa94-181c513e5f35)

Finally, we will create the security group for our data layer. In this group, we will add an inbound rule to allow traffic from the application layer security group to the MySQL/Aurora port 3306

![19](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/bf423118-a381-445c-8032-559345e75731)

### Configurating Database

Go to the RDS service and select the "Subnet Groups" option from the left menu. Then, click on the "Create DB Subnet Group" button.
Add a name, select the VPC we have been working with, add the Availability Zones (AZs), and choose the subnets created for the data layer.

![20](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/80e3bb2a-9f73-482d-aee3-4c4f07fe9b0c)

Now we will go to the "Databases" option in the left menu and click on the "Create Database" button. Set up the database creation parameters as demonstrated in the images below.

![21](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/1ed894a6-a091-453a-9490-4ced2d826e47)

![22](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/fecbaf8d-5dc1-4b60-abbc-af01ddaea90d)

![23](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/4d5042da-fdd8-44dc-952e-305889f79172)

![24](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/d07daa37-00b3-4349-b440-91b0be080f42)

![25](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/4ac5f81a-b649-42a4-be50-b9ba2f140ea6)

 Once your database has been created, you should see something like the following: one instance to write data and one instance to read data, both in different availability zones. Please note the endpoint of the writer instance. It will be used later.

![26](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/d102a87d-36c6-49cd-8002-9b6170d37e16)

### Creating an instance for the app tier

Go to the EC2 service in the console, select "Instances," and then choose "Launch Instances"

Add an instance name and select the Amazon Linux 2 AMI image

![31](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/748bb358-0be8-4ffe-a1a7-3e6a469673aa)

For instance type, select t2.micro, proceed without a key pair, select the VPC created for this hands-on, choose one of the subnets created for the application layer, and select the security group also created for this layer.

![32](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/983aaf98-4941-477b-92a7-f3c416d99865)

In advanced details, select the initially created role and then click on launch instance.

![33](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/3babc74b-4866-4116-bb78-99e7554b9c13)

### Connect to the instance and configure the Database

Now, go to the list of instances in the console, click the checkbox of the instance you just created, and then click the "connect" button.

![34](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/0f16b163-755a-4063-ab9e-56aaacd551ad)

In the next screen, click on the Session Manager tab, and then click the "connect" button.

![35](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/3d7a7f3c-22c9-4dd6-ab1a-70acda83ebc1)

- download the MySQL CLI

```
sudo -su ec2-user
sudo yum install mysql -y
```

Connect to the Aurora RDS writer instance created earlier by typing the username and then the password through the command line. Remember that this username and password data are the ones configured at the moment of creating the RDS instance.

```
mysql -h YOUR-RDS-ENDPOINT -u YOUR-USER-NAME -p
```

Creating  the database.

```
CREATE DATABASE inventory;
```

Create the Ordes table

```

Now, connect to the AppTier EC2 instance again. We will install all the necessary components to run our backend application.
use inventory;

CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productDescription VARCHAR(255),
    quantity VARCHAR(20),
    totalPrice VARCHAR(20),
    orderDate VARCHAR(20)
);
```

Insert a record into the newly created table.

```
INSERT INTO Orders (productDescription, quantity, totalPrice, orderDate)
VALUES ('Notebook', '5', '50.00', '2023-09-01');
```

Verify that the data has been inserted successfully and then exit the MySQL client.

```
SELECT * FROM Orders;
```

### Configuring the APP instance

In the folder where you cloned the repository, navigate to the Orders_API/config.py file. In this file, you must provide the following information:

- Fill in the user and password fields with the credentials you configured for your RDS Aurora database.
- Set the host field to the endpoint of your RDS writer instance.
- Specify the database field with the name of your database.
- Once you've updated these values in the config.py file, save the changes.

NOTE: Please remember that what we're doing here, putting these credentials directly into the code, is not the best way to do it. We're doing it this way just to keep things simple for this exercise. In real projects, it's better to store these credentials in a more secure place like Secrets Manager.

Now, upload the 'Orders_API' folder to the S3 bucket created earlier

![36](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/fd7e7d66-4178-430f-925d-7e3ca296415c)

Connect to the AppTier EC2 instance again through Session Manager. We will install all the necessary components to run our backend application.

```
pip3 install gunicorn
pip3 install flask
pip3 install SQLAlchemy
sudo yum install python3-devel mysql-devel gcc python3-pip -y
pip3 install mysqlclient
```

We will download the code of our backend application to the instance. Please replace "bucket-name" with your actual bucket name.

```
cd ~/
aws s3 cp s3://aws3tier-bucket/Orders_API/ Orders_API --recursive
```

We will create a systemd service unit to start our app and ensure that the app starts automatically when the EC2 instance is restarted.

Create a .service file in the /etc/systemd/system/ directory. 

```
sudo nano /etc/systemd/system/Orders_API.service
```

In the file, define the service unit:

```
[Unit]
Description=Order_API
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/Orders_API
ExecStart=/home/ec2-user/.local/bin/gunicorn -w 4 -b 0.0.0.0:8000 main:app

[Install]
WantedBy=multi-user.target
```

Save and close the file.

Start the service and enable it to start on boot

```
sudo systemctl start Orders_API
sudo systemctl enable Orders_API
```

Verify that your service is running. You should see the status as "active."

```
sudo systemctl status your-app
```

Execute the following code to test the connection to the database: 

```
curl http://localhost:8000/list_orders
```

You should get a response like the one below, which indicates that the configuration of your app, networking, and database configuration is working successfully.

```
[{"id":1,"orderDate":"2023-09-01","productDescription":"Notebook","quantity":"5","totalPrice":"50.00"}]
```









