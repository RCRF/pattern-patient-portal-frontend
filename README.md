# Patient Portal Project - Frontend

## Overview

This project is a prototype of a Patient Portal. The README is provisional and should be updated as the project evolves and its scope becomes more defined.

### Important Note

- **Project Status**: Prototype
- **Endpoint/Requests Status**: All requests are currently being made out of the api file. This can be consolidated and moved to separate files.
- **Environment Setup**: Utilizes both `.env` and `.env.local` files for environment variables.
- **Authentication**: This application uses Clerk for auth. You will need to grab the secret key from clerk for your clerk account for .env
- **Duplicated Code**: There is duplicated code in a couple of places that could use some refactoring. Espeically in timeline/index.js, this code is functional how it is but needs a major refactor to abstract out the duplication.

## Local Setup Instructions

To run the Patient Portal locally, follow these steps:

1. Install packages with `npm install`

2.  **Set your env variables** in your .env.local
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
PATIENT_ID=
NEXT_PUBLIC_ADMIN_EMAIL=
PATIENT_PORTAL_SECRET=
NEXT_PUBLIC_API_URL=
`
  
3. **Running the Application**
 In your terminal, run the following command: `npm run dev`

4. **Contributing**
   As this is a prototype, contributions towards migrations, database seeding, and overall project development are highly encouraged. Please ensure you update this README accordingly with any significant changes or additions.

