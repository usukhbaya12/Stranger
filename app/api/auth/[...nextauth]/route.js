import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongo from "@/server/mongodb";
import bcrypt from "bcryptjs";
import Users from "@/model/user";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { username, password } = credentials;

        try {
          await connectMongo();
          const user = await Users.findOne({ username });

          if (!user) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.password);

          if (!passwordMatch) {
            return null;
          }

          return user;
        } catch (error) {
          console.log(error);
        }
      },
    }),
  ],
  callbacks: {},
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
