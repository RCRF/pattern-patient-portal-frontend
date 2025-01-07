#!/usr/bin/env bash

docker run -p 3000:3000 \
       --platform linux/amd64 \
       -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
       -e CLERK_SECRET_KEY \
       -e PATIENT_ID \
       -e NEXT_PUBLIC_ADMIN_EMAIL \
       -e PATIENT_PORTAL_SECRET \
       $@
