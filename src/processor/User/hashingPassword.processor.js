import bcrypt from 'bcrypt';

const saltRounds = 10;

export const hashingPassword = async(userPassword) =>{
    try {
        const hp = await bcrypt.hash(userPassword, saltRounds);
        return hp;
      } catch (error) {
        console.error('Error hashing password:', error);
      }
}

export const verifyPassword = async (plainPassword, hashedPassword) => {
    try {
      // Compare the plain password with the hashed password
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;  // Returns true if passwords match, false otherwise
    } catch (error) {
      console.error('Error comparing password:', error);
      throw new Error('Failed to compare passwords');
    }
  };