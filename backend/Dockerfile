FROM node:18-slim

# Install OpenJDK for Java compilation
RUN apt-get update && \
    apt-get install -y default-jdk && \
    apt-get clean;

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
