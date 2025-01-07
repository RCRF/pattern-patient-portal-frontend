import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import {
  fetchAllOrganizations,
  useFetchToken,
} from "@/hooks/api";

const secret = process.env.JWT_SECRET;

function generateToken(email) {
  const payload = {
    email: email,
    timestamp: new Date().toISOString(),
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: "openid profile email",
    }),
  ],
  secret: process.env.JWT_SECRET,
  session: {
    jwt: true,
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        const userLoggedIn = account;
        token.loggedUser = userLoggedIn;
        token.acccount = account;
        const customToken = generateToken(user.email);

        const response = await useFetchToken(user, customToken);

        if (!response.data) {
          throw new Error("User is not authorized");
        } else {
          const systemToken = response.data;
          token.accessToken = systemToken;
        }

        return (token.accessToken = response.data);
      } else if (token && token.accessToken) {
        const decodedToken = jwt.decode(token.accessToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          return token;
        } else {
          throw new Error("Token is expired");
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.loggedUser = token.loggedUser;
      try {
        session.token = token;
        const tokenDecoded = jwt.decode(token.systemToken);
        session.user = tokenDecoded;
        session.isAdmin = tokenDecoded.isAdmin;
        return session;
      } catch (error) {
        session.error = error;
        return session;
      }
    },
  },
  jwt: {
    secret: process.env.PATIENT_PORTAL_SECRET
  },
});
