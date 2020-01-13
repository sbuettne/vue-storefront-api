FROM node:10-alpine

ENV VS_ENV prod

WORKDIR /var/www

RUN apk add --no-cache curl git

COPY package.json ./
COPY yarn.lock ./

RUN apk add --no-cache --virtual .build-deps ca-certificates wget && \
    yarn install --no-cache && \
    apk del .build-deps

COPY docker/vue-storefront-api/vue-storefront-api.sh /usr/local/bin/

RUN chmod 777 /usr/local/bin/vue-storefront-api.sh
CMD ["vue-storefront-api.sh"]
