FROM node:16-alpine

WORKDIR /vc_client
COPY package*.json .
RUN npm ci
COPY . .


CMD [ "npm", "start" ]