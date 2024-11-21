import { User } from "../../../models/Users/User.model.js";
import { verifyPassword } from "../../../processor/User/hashingPassword.processor.js";

export const auth = async (username, password) => {
  const user = await User.findOne({
    where: {
      username
    }
  });

  if (!user) {
    return {
      error: "User not found. Please register first."
    };
  }

  const isMatch = await verifyPassword(password, user.password);

  if (!isMatch) {
    return {
      error: "Incorrect password"
    };
  }

  // Remove sensitive data before sending
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};