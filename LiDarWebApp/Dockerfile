# Nodejs Base image
FROM node
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Install and app dependencies
RUN npm update
COPY package.json /app/package.json
RUN npm install -g @angular/cli
RUN npm install

# Add app into the app folder
COPY . /app

# Run app command
CMD ng serve --host 0.0.0.0