FROM node:18-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT
ARG NEXT_PUBLIC_FIREBASE_FIRESTORE_DB

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT=$NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT
ENV NEXT_PUBLIC_FIREBASE_FIRESTORE_DB=$NEXT_PUBLIC_FIREBASE_FIRESTORE_DB

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./


EXPOSE 3000

CMD ["npm", "start"]