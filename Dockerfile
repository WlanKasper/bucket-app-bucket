# pull official base image
FROM node:20.11.1-alpine AS build-stage

# set working directory
WORKDIR /usr/src

# add `/node_modules/.bin` to $PATH
ENV PATH /node_modules/.bin:$PATH

# install app dependencies on ci
COPY .npmrc ./
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

# copy source files
COPY .env ./
COPY index.html ./
COPY tsconfig.json ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:mainline-alpine
COPY --from=build-stage /usr/src/dist/ /usr/share/nginx/html
COPY container-conf/nginx-default.conf /etc/nginx/templates/default.conf.template

# nginx web server port
EXPOSE 80
