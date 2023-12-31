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

## Configurating Database

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

## Creating an instance for the app tier

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
sudo systemctl status Orders_API
```

Execute the following code to test the connection to the database: 

```
curl http://localhost:8000/list_orders
```

You should get a response like the one below, which indicates that the configuration of your app, networking, and database configuration is working successfully.

```
[{"id":1,"orderDate":"2023-09-01","productDescription":"Notebook","quantity":"5","totalPrice":"50.00"}]
```

## Internal Load Balancing and Auto Scaling

### Creating an Image

Now we will create an AMI from our AppTier instance. This will help us parameterize an auto-scaling group and the internal load balancer of the architecture to create a highly scalable system.

- We return to the list of instances, select the checkbox for the AppTier instance, open the actions menu, choose "Image and Templates," and then select "Create Image."

![37](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/a30f364a-d055-4328-aa85-fbc88930d74c)

Add a name and click and click on the Create Image button.

![38](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/e0c8a184-c706-44fc-b8a9-028514e9b4f5)

### Creating a Target Group

Go to the left menu, select "Target Groups," and then click on the "Create Target Group" button.

In the "Target Type" option, choose "Instances," give the target group a name, select "HTTP" protocol, set the port to 8000 (since this is the port our app is listening on), and select the VPC created for this practice

![39](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/e9248250-e386-4fba-8861-a83e91764260)

 - In the "Health Checks" option, choose the HTTP protocol and type '/health' in the health check path. This is the health check endpoint of the app. Click "Next."
 - Skip registering targets and click on "Create Target Group".

### Creating the Internal Load Balancer

 - Click on the "Load Balancers" menu, and then select "Create Load Balancer"
 - Select the application load balancer

![41](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/aa6e15cb-11ad-4a9c-a758-2f1597890248)

 Add a name to the load balancer and select the internal scheme.

![42](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/d8a9b782-9549-4f9c-a1ff-e74e8f7f634f)

![43](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/b1faea9a-1c0c-475f-96c7-64c1b5964c26)

Configure the security group created for the internal load balancer. Allow traffic on the HTTP protocol and port 80, and select the target group created above. Click on the button Create load balancer.

![44](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/b682826f-d482-41e6-91ed-98d7d245343c)

### Creating Launch template

In the left menu select Launch templates and then click on Create launch template
Add a name for the template. In the "Application and OS images" section, go to the "My AMIs" tab, and click on "Owned by me." Then, select the image created earlier.

![45](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/a57911ab-8677-4b4f-b2f6-7b4ce0da97cf)

In the "Instance Type" section, select t2.micro. We will not include a key pair, and no subnet is selected since the network configuration will be set in the auto-scaling group. 

![46](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/70601931-4a6f-4e91-bff8-4980c3bbc8b5)

In the advanced details section, select the role created at the beginning of this hands-on. Click Create launch template.

![51](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/0d0729b8-6633-42ab-b350-019f283e1c74)

### Creating Auto Scaling Group

Go to the left menu, select "Auto Scaling Groups," and click on "Create Auto Scaling Group"
Add a name for the auto scaling group and select the previously created template. Click next.

![47](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/f0f2b662-69b5-4d24-968e-5ddc58984b1d)

Select the aws3tier VPC we have created, and choose the private subnets for the application layer.

![48](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/41a4de20-242d-419e-96c2-6964ba61ebc0)

In the advanced configuration options step, select the "Attach to an existing load balancer" option. Click on "Choose from your load balancer target groups" and select the target group we created for the application layer.

![49](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/72b79186-dbea-44cc-a645-18755db8fbac)

Set the group size as follows:

![50](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/c02d3b09-53e3-4558-8eed-aa25fcedf63c)

Leave the "Add notifications" and "Add tags" steps with the default configuration, and then click on "Create Auto Scaling group".

After following all these steps, the load balancer and autoscaling group are configured correctly. Two new instances should be reflected in the instances menu of the console.

## Creating an instance for the web tier

- Modify the nginx.conf file located in the root of the folder that was cloned at the start of this project. Replace [AWS-INTERNAL-LB-DNS] with the DNS of your internal load balancer.
- Upload the 'myapp' folder that was cloned from the repository and the modified nginx.conf file to our S3 bucket.
- Now you must perform the same steps that we followed to create an instance for the web tier. When selecting the subnet, you must choose one of the public subnets, select the VPC we have been working with, activate auto-assign public IP, and choose the role we created at the beginning.

![52](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/fd22e504-4603-409d-a91d-94ac648afeff)

![53](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/a4193c42-cf70-4f75-8e40-289d0ce762a5)

Connect to the AppTier EC2 instance through Session Manager. We will install all the necessary components to run our web application created in Node.js.

Install node version manager (nvm) by typing the following at the command line.

```
sudo -su ec2-user 
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

Activate nvm by typing the following at the command line.

```
. ~/.nvm/nvm.sh
```

Use nvm to install the latest version of Node.js by typing the following at the command line.

```
nvm install --lts
```

Install Node.js 

```
nvm install 16
```

We will download the code of our backend application to the instance. Please replace "bucket-name" with your actual bucket name.

```
cd ~/
aws s3 cp s3://aws3tier-bucket/myapp/ myapp --recursive
```

Go to the 'myapp' folder and execute the command to to Build the App and Publish It.

```
cd myapp/
npm install 
npm run build
```

We will use Nginx as the web server for our application.

```
sudo amazon-linux-extras install nginx1 -y
```

We go to the location of the nginx folder and replace the configuration file created by default, by ours

```
cd /etc/nginx
sudo rm nginx.conf
sudo aws s3 cp s3://aws3tier-bucket/nginx.conf .
```

restart the nginx service

```
sudo service nginx restart
```

we assign permissions to nginx so that it can access the files

```
chmod -R 755 /home/ec2-user
```

We ensure that the service runs at instance startup.

```
sudo chkconfig nginx on
```

Go to the details tab of the previously created instance, copy the public ip, go to your browser of choice, paste the IP and if you have followed all the steps correctly you should see the successful execution of our application, consult the order created as an example and add orders.

![54](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/88a708c2-fe66-44c2-8f80-b99f6cd2d26e)

_______________________________________________________________________________________________________________________________

![55](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/8f1af05c-785b-495a-9f28-6a55f262c744)

## External Load Balancing and Auto Scaling

### Creating an Image

Now we will create an AMI from our WebTier instance.
Go to the list of instances, select the checkbox for the WebTier instance, open the actions menu, choose "Image and Templates," and then select "Create Image."

![56](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/5ed6d813-ab63-4484-90da-347427600e4e)

Add a name and click and click on the Create Image button.

![57](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/00b15663-237e-49b0-bd28-b6d1dba03692)

### Creating a Target Group
Go to the left menu, select "Target Groups," and then click on the "Create Target Group" button.

In the "Target Type" option, choose "Instances," give the target group a name, select "HTTP" protocol, set the port to 80 (since this is the port Nginx is listening on), and select the VPC created for this practice

![58](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/5d0ddc15-0bbb-40eb-94a4-6a5e0f3bfd5f)

In the "Health Checks" option, choose the HTTP protocol and type '/health' in the health check path. Click "Next".
Skip registering targets and click on "Create Target Group".

### Creating the Internal Load Balancer

Click on the "Load Balancers" menu, and then select "Create Load Balancer"
Select the application load balancer

![59](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/774838a3-413e-4ba9-802d-260b6b513f31)

Add a name to the load balancer and select the internet-facing scheme.

![60](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/41fc236d-7cf0-46af-933b-b0f3aa028786)

![61](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/a063aab6-257c-4f7d-94f3-1c9acdcbb976)

Configure the security group created for the external load balancer. Allow traffic on the HTTP protocol and port 80, and select the target group created above. Click on the button Create load balancer.

![62](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/f1c00b2f-1666-4a06-b100-7b67897772a5)

### Creating Launch template
In the left menu select Launch templates and then click on Create launch template Add a name for the template. In the "Application and OS images" section, go to the "My AMIs" tab, and click on "Owned by me." Then, select the image created earlier.

![63](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/4b206ec7-4b25-4d5b-b65e-d202f5fb2722)

In the "Instance Type" section, select t2.micro. We will not include a key pair, and no subnet is selected since the network configuration will be set in the auto-scaling group.

![64](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/feca1940-d750-43bc-b3ed-ff1b4667e22f)

In the advanced details section, select the role created at the beginning of this hands-on. Click Create launch template.

![65](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/855985da-b5bb-48db-ab16-5c6d93145d84)

### Creating Auto Scaling Group

Go to the left menu, select "Auto Scaling Groups," and click on "Create Auto Scaling Group" Add a name for the auto scaling group and select the previously created template. Click next.

![66](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/10231a14-5069-4258-b985-1286283fc56c)

Select the aws3tier VPC we have created, and choose the public subnets for the web layer.

![67](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/afe124e9-e921-418e-ae0e-f61497d27687)

In the advanced configuration options step, select the "Attach to an existing load balancer" option. Click on "Choose from your load balancer target groups" and select the target group we created for the web layer.

![68](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/072a5472-f482-412e-a842-f96c94aa9031)

Set the group size as follows:

![69](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/1f65d3aa-b995-4141-aaea-8ed1982d035e)

Leave the "Add notifications" and "Add tags" steps with the default configuration, and then click on "Create Auto Scaling group".

After following all these steps, the load balancer and autoscaling group are configured correctly. Two new instances should be reflected in the instances menu of the console.

Finally, our architecture has been completely configured. To test its correct operation, go to the "Load Balancer" menu, select the "webtier-internet-facing-lb" load balancer, and obtain the DNS name. Paste the DNS name into your browser.

![70](https://github.com/anthonymelchor/AWS-Three-Tier-Web-Architecture/assets/48603061/f25db5e9-de9a-403f-8601-c1886fecb0c0)

## Conclusion

And there you have it! You're now well-equipped to embark on your journey into the world of AWS Three-Tier Web Architecture. 🚀

A quick recap of your accomplishments:

- You've built a robust architecture with web, application, and data layers.
- Your VPC, subnets, and routing tables are all set up for efficient networking.
- Security groups are in place to keep your resources safe.
- The database is configured and ready to store your data.
- Your application tier instance is up and running, serving your web content.

Now, it's time to put your skills to the test. Head over to your application instance, deploy your code, and let the world see what you've created. 

So go ahead, make your web application shine, ensure your data flows seamlessly, and manage your resources like a pro. Your adventure in the world of AWS Three-Tier Web Architecture begins right here. 🎉

Catch you on the flip side!
