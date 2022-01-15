FROM node:14.17.0-alpine
WORKDIR /app
COPY package.json package.json
RUN npm install --production
COPY dist dist
COPY .env-example .env
#CMD [ "ls" ]
CMD [ "npm", "start"]