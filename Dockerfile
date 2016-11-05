FROM node:6.2.2

RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY . /usr/app

CMD [ "npm", "start" ]
