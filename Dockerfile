FROM amd64/alpine:3.19

RUN apk add nodejs npm

RUN mkdir /frontend
WORKDIR /frontend

COPY package.json /frontend/package.json
RUN npm install

ADD jsconfig.json jsconfig.json
ADD middleware.ts middleware.ts
ADD next.config.js next.config.js
ADD postcss.config.js postcss.config.js
ADD queryClient.js queryClient.js
ADD styles styles
ADD tailwind.config.js tailwind.config.js
ADD pages pages
ADD app app
ADD public public
ADD components components
ADD hooks hooks
ADD utils utils

ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}

RUN npm run build

EXPOSE 3000

ENTRYPOINT npm start

