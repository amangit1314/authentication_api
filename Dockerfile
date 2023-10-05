FROM node:lts
WORKDIR /app/src
COPY . .
RUN npm install
CMD [ "nodemon", "src/index.js" ]
EXPOSE 3000