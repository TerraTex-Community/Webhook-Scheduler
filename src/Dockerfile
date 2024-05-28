FROM node:20.9-alpine

WORKDIR /app

COPY package.json yarn.lock ./
COPY .yarn ./.yarn

RUN yarn install

COPY . .

CMD ["yarn", "start"]
