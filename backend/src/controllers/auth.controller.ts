import { cookieOptions } from "../config/constants";
import type { Request, Response } from "express";
import AuthService from "../services/auth.service";
import ApiError from "../utils/ApiError";
import { generateSixDigitsOTP } from "../config/OTPGenerator";
import sendMail from "../config/mailer";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";

const generateAccessAndRefereshTokens = async(userId:string) =>{
    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req:Request, res:Response) => {
    const user = await AuthService.register(req.body)
    return res.status(201).json(new ApiResponse(200, "User registered successfully", user));
})

const loginUser = asyncHandler(async (req:Request, res:Response) => {
    const user = await AuthService.login(req.body)
    res.cookie("accessToken", user.accessToken, cookieOptions)
    res.cookie("refreshToken", user.refreshToken, cookieOptions)
    return res
        .status(200)
        .json(new ApiResponse(200, "User logged in successfully", user));
})

const logoutUser = asyncHandler(async (req:Request, res:Response) => {
    const user = req.user;

    await AuthService.logout(user._id);

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, "User logged out successfully", {}))
})

const getCurrentUser = asyncHandler(async (req:Request, res:Response) =>{
    return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", req.user))
    
})

const forgotPassword = asyncHandler(async (req:Request, res:Response) => {
    const { email } = req.body;

    await AuthService.forgotPassword(email);
   return res.status(200).json(new ApiResponse(200, "Reset password email sent successfully"));
});

const resetPassword = asyncHandler(async (req:Request, res:Response) => {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token || !password) {
        throw new ApiError(400, "Token and password are required");
    }

    await AuthService.resetPassword(token, password);

    return res.status(200).json(new ApiResponse(200, "Password reset successfully."));
});

const generateEmailVerificationToken = asyncHandler(async (req:Request, res:Response) => {
    const userId = req.user._id

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified){
        throw new ApiError(400, "User already verified")
    }
    
    const otp = generateSixDigitsOTP();
    console.log(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    user.emailVerificationToken = otp;
    user.emailVerificationTokenExpiry = expiresAt
    await user.save({ validateBeforeSave: false})
    try {
        sendMail(
            req.user.email,
            'Verification Token',
            "verify-email-code",
            { name: req.user.fullName, otpDigits: otp.split("") }
        );
        return res.status(200).json(new ApiResponse(200, "Verification token sent to email"));
    } catch (error) {
        user.emailVerificationToken = "";
        user.emailVerificationTokenExpiry = new Date();
        await user.save({ validateBeforeSave: false });
    
        throw new ApiError(500, 'Email could not be sent')
    }
})

const verifyEmail = asyncHandler(async (req:Request, res:Response) => {
    const { token } = req.body;
    const userId = req.user._id;

    if (!token){
        throw new ApiError(404, "Invalid Token.")
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified){
        throw new ApiError(400, "Email already verified")
    }
    
    const verifiedUser = await User.findOneAndUpdate({_id: userId, emailVerificationToken: token}, {
        $set: {
            isEmailVerified: true,
            emailVerificationToken: 0,
            emailVerificationTokenExpiry: new Date()
        }
    },
    {
        new: true
    })
    
    if (!verifiedUser){
        throw new ApiError(400, "Failed to verify user email.")
    }

    // send mail
    sendMail(verifiedUser.email, "Email verified successfully", "email-verified-successfully", { name: verifiedUser.name })
    return res
        .status(200)
        .json(new ApiResponse(200, "User verified successfully"))


})

const refreshAccessToken = asyncHandler(async (req:Request, res:Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken:any = jwt.verify(
            (incomingRefreshToken).toString(),
            process.env.REFRESH_TOKEN_SECRET!
        )
        const user:any = await User.findById(decodedToken?._id)
        
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
        
        const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                "Access token refreshed" ,
                {accessToken, refreshToken: refreshToken}
            )
        )
    } catch (error:any) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

export {registerUser, loginUser, logoutUser, getCurrentUser, forgotPassword, resetPassword, verifyEmail,generateEmailVerificationToken,refreshAccessToken}