import { Router } from "express";
import { createUser } from "../controllers/user/user.controller.js";
import { updateUserProfile } from "../controllers/user/updateProfile.controller.js";
import { userLogin } from "../controllers/user/userLogin.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { profile } from "../controllers/user/profile.controller.js";

const router = Router();
router.post("/register", createUser);

router.post("/login", userLogin );

router.get("/profile", auth, profile);

router.put('/update-profile', auth, updateUserProfile);

export default router;