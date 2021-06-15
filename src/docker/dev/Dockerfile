FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY *.json /app/
RUN npm install
COPY *.config.js *.config.cjs /app/

ENV NODE_ENV=development
CMD npm run dev