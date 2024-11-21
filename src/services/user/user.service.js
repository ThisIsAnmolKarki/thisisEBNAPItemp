import { User } from "../../models/Users/User.model.js";
import { hashingPassword } from "../../processor/User/hashingPassword.processor.js";
export const createUserService = async (userdata) => {

    const password = await hashingPassword(userdata.password);

    try {
      const newUser = await User.create({
        username: userdata.username,
        email: userdata.email,
        password: password,
        firstName: userdata.firstName,
        lastName: userdata.lastName,
        dateOfBirth: userdata.dateOfBirth,
        isActive: true,
        role: userdata.role || 'user',
        lastLoginAt: new Date(),
        profilePicture: userdata.profilePicture,
        Phone: userdata.Phone
      });
    
        console.log('User created successfully:', newUser.toJSON());
      } catch (error) {
        console.error('Error creating user:', error);
        throw new Error("failed creating user");
      }

};


