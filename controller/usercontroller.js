import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

export const register = catchAsyncErrors(async (req, res, next) => {


    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Avatar Required!", 400));
    }
    const { avatar, resume } = req.files;

    //POSTING AVATAR
    const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        { folder: "PORTFOLIO AVATAR" }
    );
    if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponseForAvatar.error || "Unknown Cloudinary error"
        );
        return next(new ErrorHandler("Failed to upload avatar to Cloudinary", 500));
    }

    //POSTING RESUME
    const cloudinaryResponseForResume = await cloudinary.uploader.upload(
        resume.tempFilePath,
        { folder: "PORTFOLIO RESUME" }
    );
    if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponseForResume.error || "Unknown Cloudinary error"
        );
        return next(new ErrorHandler("Failed to upload resume to Cloudinary", 500));
    }







    const {
        fullName,
        email,
        phone,
        aboutMe,
        password,
        portfolioURL,
        githubURL,
        instagramURL,
        facebookURL,
        twitterURL,
        linkedInURL,
    } = req.body;



    const user = await User.create({
        fullName,
        email,
        phone,
        aboutMe,
        password,
        portfolioURL,
        githubURL,
        instagramURL,
        facebookURL,
        twitterURL,
        linkedInURL,
        avatar: {
            public_id: cloudinaryResponseForAvatar.public_id, // Set your cloudinary public_id here
            url: cloudinaryResponseForAvatar.secure_url, // Set your cloudinary secure_url here
        },
        resume: {
            public_id: cloudinaryResponseForResume.public_id, // Set your cloudinary public_id here
            url: cloudinaryResponseForResume.secure_url, // Set your cloudinary secure_url here
        },
    });

    generateToken(user, "Registered!", 201, res);

})




export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Provide Email And Password!", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid Email Or Password!", 404));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email Or Password", 401));
    }
    generateToken(user, "Login Successfully!", 200, res);
});



export const logout = catchAsyncErrors(async (req, res, next) => {
    res
        .status(200)
        .cookie("token", "", {
            expires: new Date(Date.now()),
            httpOnly: true,
        })
        .json({
            success: true,
            message: "Logout Successfully!",
        });
});



export const getUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user,
    });
})


export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserdata = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        aboutMe: req.body.aboutMe,
        portfolioURL: req.body.portfolioURL,
        githubURL: req.body.githubURL,
        instagramURL: req.body.instagramURL,
        facebookURL: req.body.facebookURL,
        twitterURL: req.body.twitterURL,
        linkedInURL: req.body.linkedInURL,
    }
    if (req.files && req.files.avatar) {
        const avatar = req.files.avatar;
        const user = await User.findById(req.user.id);
        const publicImageId = user.avatar.public_id;
        await cloudinary.uploader.destroy(publicImageId);
        const cloudinaryResponse = await cloudinary.uploader.upload(
            avatar.tempFilePath,
            { folder: "PORTFOLIO AVATAR" }
        );
        newUserdata.avatar = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url
        }
    }

    if (req.files && req.files.resume) {
        const resume = req.files.resume;
        const user = await User.findById(req.user.id);
        const resumeId = user.resume.public_id;
        await cloudinary.uploader.destroy(resumeId);
        const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            { folder: "PORTFOLIO RESUME" }
        );
        newUserdata.resume = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserdata, {
        new: true,
        runValidators: true,
        userFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully!",
        user
    })
})


export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return next(new ErrorHandler("All fields are required", 400));
    }
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(currentPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Current Password is incorrect", 400));
    }
    if (newPassword !== confirmNewPassword) {
        return next(new ErrorHandler("New Password and Confirm New Password does not match", 400));
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password Updated Successfully!"
    })
})


export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
    const id = "67558d52ff5a444d77be5fdb";
    const user = await User.findById(id);
    res.status(200).json({
        success: true,
        user,
    });
})


export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if(!user){
        return next(new ErrorHandler("User Not Found", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave: false});
    const resetPasswordUrl = `${process.env.DASHBOARD_URI}/password/reset/${resetToken}`;
    const message = `Your Password Reset Token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this  please ignore it.`;
    try {
        await sendEmail({
            email:user.email,
            subject: "Personal portfolio dasboard recovery",
            message,
        })
        res.status(200).json({
            success: true,
            message: `Email Sent to ${user.email} Successfully!`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return next(new ErrorHandler(error.message, 500));
    }
    
})



export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if(!user){
        return next(new ErrorHandler("Invalid Token", 400))
    }
    if(req.body.password !== req.body.confirmPassword){
        return next (new ErrorHandler("Password & confirm password do not match", 400))
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    generateToken(user, "Reset Password Successfully!", 200, res);
})