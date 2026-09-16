// import { convexAuth } from "@convex-dev/auth/server";

// export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
//   providers: [],
// });

// import { convexAuth } from "@convex-dev/auth/server";
// import Password from "@auth/core/providers/password";

// export const {
//   auth,
//   signIn,
//   signOut,
//   store,
//   isAuthenticated,
// } = convexAuth({
//   providers: [
//     Password({
//       profile(params) {
//         return {
//           email: params.email as string,
//           name: params.name as string,
//         };
//       },
//     }),
//   ],
// });


import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const {
  auth,
  signIn,
  signOut,
  store,
  isAuthenticated,
} = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: (params.name as string) ?? undefined,
        };
      },
    }),
  ],
});
