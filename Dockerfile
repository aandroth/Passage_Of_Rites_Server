FROM node:16.9.0
WORKDIR /
COPY package*.json server.js player.js ./
RUN npm install
EXPOSE 5000
CMD ["node", "server.js"]