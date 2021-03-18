FROM node:alpine
RUN mkdir /app
RUN mkdir /app/src
WORKDIR /app
COPY *.json /app/
RUN npm install
COPY *.config.js /app/
COPY ./static /app/static
COPY ./src /app/src
ENV NODE_ENV=production
RUN npm run build
RUN npm prune --production

CMD npm start