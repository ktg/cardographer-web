FROM node:alpine AS build
RUN mkdir /app
RUN mkdir /app/src
WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/
RUN npm install
COPY *.config.js /app/
COPY ./src/ /app/src
COPY ./static/ /app/static
ENV NODE_ENV=production
RUN npm run build

FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/
ENV NODE_ENV=production
RUN npm install
COPY ./static/ /app/static
COPY --from=build /app/__sapper__/build /app/__sapper__/build/
CMD ["npm", "start"]