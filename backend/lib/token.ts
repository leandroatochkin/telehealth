import "dotenv/config";
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const signToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "90d",
  };

  return jwt.sign({ id: userId }, JWT_SECRET, options);
};

const createSendToken = (user: any, res: any) => {
  const token = signToken(user._id);

  //function to generate the cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN || "90") * 24 * 60 * 60 * 1000
    ),

    httponly: true,
    secure: process.env.NODE_ENV === "production", //only secure in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  };

  res.cookie("token", token, cookieOptions);

  user.password = undefined;
  user.passwordConfirm = undefined;
  user.otp = undefined;

}