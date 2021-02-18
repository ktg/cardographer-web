FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY *.json /app/
ENV NODE_ENV=development
RUN npm install
COPY *.config.js /app/
# Line to poll and generate inotify events for mounts shared between windows + linux
#RUN curl -s https://javanile.github.io/inotifywait-polling/setup.sh | bin=inotifywait bash -
CMD ["npm", "run", "dev"]