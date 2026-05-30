import Signin from "@/components/Auth/SignIn";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Travixa",
};

const SigninPage = () => {
  return <Signin />;
};

export default SigninPage;
