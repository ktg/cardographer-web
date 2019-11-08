# create a file named Dockerfile
FROM node:8-slim
RUN mkdir /app
RUN mkdir /app/src
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
RUN npm install
COPY src/* /app/src
CMD ["npm", "start"]