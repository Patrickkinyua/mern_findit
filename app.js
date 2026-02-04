import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDb from "./config/db.config.js"
import userRouter from "./routers/user.router.js"
import authRouter from "./routers/auth.router.js"
import itemRouter from "./routers/item.router.js"

dotenv.config()

const app = express()

// Middleware
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server is running" })
})

// Routes (MUST come BEFORE 404 handler)
app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/items", itemRouter)

// Global error handler (BEFORE 404 handler)
app.use((err, req, res, next) => {
    console.error("Global Error:", err)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? err : undefined,
    })
})

// 404 handler (LAST - catches everything else)
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" })
})

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    await connectDb();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();
