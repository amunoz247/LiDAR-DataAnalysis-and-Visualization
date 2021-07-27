# LiDAR-DataAnalysis-and-Visualization

### Application Description

 This is a web application that conducts data analysis and data visualization of LiDAR point cloud data. The data is pulled into the Flask-Python backend through the use of an MQTT Broker and SocketIO Websockets. The data is parsed, cleaned, and stored in a pandas dataframe before being compressed and sent up to the Angular frontend for visualization and analysis.

 The frontend is built using the Angular framework and the data is brought into the frontend through the websockets. Once the data has been received it is decompressed and stored in a singleton service which makes the data accessible within any part of the application. In order to obtain visualizations, the application utilizes both ngx-charts and three.js libraries. This work was completed as part of Thesis research conducted at the University of Nevada, Reno.

### Software Tools

* Program developed using Angular 11.2.13 and Flask.
* Node 14.17.1 was used as it was the LTS version at the time of development.
* npm version: 6.14.13
* Docker used to store both the Angular and Flask applications in independent containers.
  
### Run the Program Using Docker Compose

Follow the steps to build and run the application from the Linux terminal.

1. Inside the LiDAR-DataAnalysis-and-Visualization folder run the following commands.
2. Build the containers using Docker Compose.
    ```
    docker-compose build
    ```
3. Run the Docker containers. The -d flag means the containers will run in a detached state.
    ```
    docker-compose up -d