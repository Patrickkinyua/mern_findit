import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rating: { type: Number, default: 0 },
    profileimg:{type: String, default: ""},
    coverimg:{type: String, default: ""},
    bio:{type: String, default: ""},
    link:{type: String, default: ""},



}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema);

export default User;
