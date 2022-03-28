FROM node:14.17.0-alpine
WORKDIR /app
COPY package.json package.json
RUN npm install --production
COPY dist dist
# TODO: remove below
#COPY cache cache
#COPY .env-example .env
COPY .env .
#CMD [ "ls" ]
CMD [ "npm", "start"]