FROM node:alpine
RUN mkdir /app
RUN mkdir /app/src
WORKDIR /app
COPY *.json /app/
RUN npm install
COPY *.config.js *.config.cjs /app/
COPY ./static /app/static
COPY ./src /app/src
ENV NODE_ENV=production
RUN npm run build

CMD npm start