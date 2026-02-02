import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // 2️⃣ Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 3️⃣ Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // 4️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5️⃣ Create & save user
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // 6️⃣ Create JWT AFTER saving user
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 7️⃣ Send secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // 8️⃣ Send response (no password)
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while registering user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


export const loginUse = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required",
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format",
        });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while logging in",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}


export const logoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset token (expires in 1 hour)
        const resetToken = jwt.sign(
            { userId: user._id, type: "reset" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // In production, send this via email
        // For now, return it (in real app, use nodemailer)
        return res.status(200).json({
            success: true,
            message: "Password reset token generated",
            resetToken: resetToken, // Remove in production - send via email instead
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({
            message: "Server error while processing forgot password",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: "Reset token and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        if (decoded.type !== "reset") {
            return res.status(400).json({ message: "Invalid token type" });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. Please login with your new password.",
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            message: "Server error while resetting password",
        });
    }
};   
