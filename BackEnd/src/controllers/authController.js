import UserModel from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if ([username, password, email].some((field) => field.trim() === "")) {
      throw new Error("All fields are required.");
    }
    const existedUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existedUser) {
      throw new Error("User already exists.");
    }
    const user = await UserModel.create(req.body);
    const createdUser = await UserModel.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new Error("Something went wrong while registering the user.");
    }
    return res
      .status(200)
      .json(createdUser)
      .json("User registered successfully.");
  } catch (error) {
    console.log("Register error ", error);
  }
};

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Token generation error: ", error);
    throw new ApiError(
      500,
      `Something went wrong while generating access and refresh token: ${error.message}`
    );
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid Username" });
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid Password" });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    const loggedUser = await UserModel.findById(user._id).select(
      "-refreshToken -password"
    );
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        status: "success",
        user: loggedUser,
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.log("Login error ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1, // this removes the field from document
        },
      },
      {
        new: true,
      }
    );
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json("Logged out successfully");
  } catch (error) {
    console.log("logout backend error ", error);
    return res.status(500).json("Some error during logout");
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await UserModel.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getLogin = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select(
      "-password -refreshToken"
    );
    if (!user) return res.status(400).json({ error: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    console.log("Internal server error ", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export {
  register,
  login,
  logout,
  generateAccessAndRefreshToken,
  refreshAccessToken,
  getLogin
};
