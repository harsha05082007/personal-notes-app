FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
