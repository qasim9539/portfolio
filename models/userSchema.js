import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone is required"]
    },
    aboutMe: {
        type: String,
        required: [true, "About me field is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    resume: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    portfolioURL: {
        type: String,
        required: [true, "Portfolio url is required"]
    },
    githubURL: String,
    instagramURL: String,
    facebookURL: String,
    twitterURL: String,
    linkedInURL: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date
})


//FOR HASHING PASSWORD
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

//FOR COMPARE PASSWORD WITH HASHED PASSWORD

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

//GENERATE JWT TOKEN

userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
}


userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

export const User = mongoose.model("User", userSchema)