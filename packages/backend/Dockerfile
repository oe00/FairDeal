FROM node:alpine

WORKDIR /app/fairdeal

# Not to build an intermediate container for yarn install
# if there's no changes to package.json
COPY ./package.json .

RUN yarn install

COPY . .

CMD ["node", "app.local.js"]
