FROM node:10

ENV PORT 80
ENV BUILD_PATH /tmp/cloudone/build
ENV ROOT_PATH /var/www
ENV LOG_PATH /var/log/cloudone
ENV NGINX_CONF_PATH /etc/nginx/conf.d

RUN mkdir -p ${BUILD_PATH}
WORKDIR ${BUILD_PATH}

RUN apt-get update && apt-get install -y nginx \
    && rm -f /etc/nginx/sites-enabled/default \
    && mkdir -p ${BUILD_PATH} && mkdir -p ${LOG_PATH}/nginx
COPY pkg/nginx.conf ${NGINX_CONF_PATH}/cloudone-wconsole-client.conf

COPY package.json package-lock.json .npmrc *.js ${BUILD_PATH}/
RUN npm install
#RUN npm install es6-object-assign

COPY public ${BUILD_PATH}/public
COPY src ${BUILD_PATH}/src

RUN npm run build && cp -ar ${BUILD_PATH}/dist/* ${ROOT_PATH}/ && rm -rf ${BUILD_PATH}
WORKDIR ${ROOT_PATH}

EXPOSE ${PORT}

ENTRYPOINT ["nginx", "-g", "daemon off;"]
