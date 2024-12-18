FROM node:20 as build

WORKDIR /app

# Disable Globalization Invariant Mode
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/timeentryui/browser /usr/share/nginx/html

# Expose the default nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]