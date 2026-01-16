ARG MY_NODE_REPO
FROM ${MY_NODE_REPO}:16.9.0
WORKDIR /
COPY package*.json server.js player.js npc.js itemObjective.js ./
RUN npm install
RUN echo ${MY_NODE_REPO}
EXPOSE 5000
CMD ["node", "server.js"]