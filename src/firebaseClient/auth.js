import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./config";

const ALLOWED_DOMAIN = "mirante.com.br";

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);

  if (!result.user.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
    await signOut(auth);
    const err = new Error(`Acesso restrito a contas @${ALLOWED_DOMAIN}.`);
    err.code = "auth/unauthorized-domain";
    throw err;
  }

  return result;
}

export async function logout() {
  await signOut(auth);
}
