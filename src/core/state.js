import { auth } from "../auth/authStore.js";

export const state = {
  session: auth.load(),
  products: [],
  cart: []
};
