FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/
ENV NODE_ENV=development
RUN npm install
COPY *.config.js /app/
CMD ["npm", "run", "dev" ]