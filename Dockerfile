ADD package.json /app
ADD index.js /app

RUN cd /app; npm install

ENV NODE_ENV production
ENV PORT 8081
EXPOSE 8081

WORKDIR "/app"
CMD [ "npm", "start" ]
