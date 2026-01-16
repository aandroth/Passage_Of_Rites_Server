FROM node:16.9.0
WORKDIR /
COPY package*.json server.js player.js npc.js ./
RUN npm install
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "server.js"]