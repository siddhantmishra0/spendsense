import UserModel from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ExpenseModel from "../models/expense.model.js";
import BudgetModel from "../models/budget.model.js";
import mongoose from "mongoose";

// const register = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     if ([username, email, password].some((field) => field?.trim() === "")) {
//       // throw new ApiError(400, "All fields are required");
//       res
//       .status(400)
//       throw new Error("All fields are required")
//     }
//     const existedUser = await UserModel.findOne({
//       $or: [{ username }, { email }],
//     });
//     if (existedUser) {
//       // throw new ApiError(400, "Username or Email already exists");
//       res
//       .status(400)
//       throw new Error("Username or Email already exists")
//     }

//     const user = UserModel.create({
//       username,
//       email,
//       password,
//     });
//     const createdUser = await UserModel.findById(user._id).select(
//       "-password -refreshToken"
//     );
//     if (!createdUser) {
//       // throw new ApiError(500, "Something went wrong while registering user.");
//       res
//       .status(500)
//       throw new Error("Something went wrong while registering user")
//     }
//     return res
//       .status(201)
//       .json(createdUser, "User registered successfully");
//   } catch (error) {
//     console.log("Register error ",error)
//   }
// };

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

const postBudget = async (req, res) => {
  try {
    const { userId, budgetAmount, budgetType } = req.body;
    if (!userId || !budgetAmount || !budgetType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const existingBudget = await BudgetModel.findOne({ userId,category:budgetType });
    let updatedBudget;
    let newBudgetAmount = parseFloat(budgetAmount);
    let budgetDifference = newBudgetAmount;
    if (existingBudget) {
      budgetDifference = newBudgetAmount - existingBudget.amount;
      updatedBudget = await BudgetModel.findByIdAndUpdate(
        existingBudget._id,
        { amount: newBudgetAmount },
        { new: true }
      );
    } else {
      updatedBudget = new BudgetModel({
        userId,
        amount: newBudgetAmount,
        category: budgetType,
      });
      await updatedBudget.save();
    }
    const overallCategory = await BudgetModel.findOne({ userId,category: "Overall" });
    let overallBudget;
    if(overallCategory){
      const overallAmount = overallCategory.amount + budgetDifference;
      overallBudget = await BudgetModel.findByIdAndUpdate(
        overallCategory._id,
        {amount: parseFloat(overallAmount)},
        {new: true}
      )
    } else{
      overallBudget = new BudgetModel({
        userId,
        amount: newBudgetAmount,
        category: "Overall"
      })
      await overallBudget.save()
    }
    console.log(existingBudget);
    console.log(overallBudget);
    console.log(updatedBudget);
    return res.status(200).json({ newBudget: updatedBudget });
  } catch (error) {
    return res.status(500).json("Budget fail");
  }
};




// const postBudget = async (req, res) => {
//   try {
//     const { userId, budgetAmount, budgetType } = req.body;
    
//     // Input validation
//     if (!userId || !budgetAmount || !budgetType) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Validate budgetAmount is a valid number
//     const newBudgetAmount = parseFloat(budgetAmount);
//     if (isNaN(newBudgetAmount) || newBudgetAmount < 0) {
//       return res.status(400).json({ error: "Invalid budget amount" });
//     }

//     // Check if user exists
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Find existing budget for this category
//     const existingBudget = await BudgetModel.findOne({ 
//       userId, 
//       category: budgetType 
//     });

//     let updatedBudget;
//     let budgetDifference = newBudgetAmount;

//     if (existingBudget) {
//       // Calculate the difference from existing budget
//       budgetDifference = newBudgetAmount - (existingBudget.amount || 0);
      
//       updatedBudget = await BudgetModel.findByIdAndUpdate(
//         existingBudget._id,
//         { amount: newBudgetAmount },
//         { new: true }
//       );
//     } else {
//       // Create new budget
//       updatedBudget = new BudgetModel({
//         userId,
//         amount: newBudgetAmount,
//         category: budgetType,
//       });
//       await updatedBudget.save();
//     }

//     // Handle overall budget update
//     const overallCategory = await BudgetModel.findOne({ 
//       userId, 
//       category: "Overall" 
//     });

//     let overallBudget;
    
//     if (overallCategory) {
//       // Safely calculate new overall amount
//       const currentOverallAmount = overallCategory.amount || 0;
//       const newOverallAmount = currentOverallAmount + budgetDifference;
      
//       overallBudget = await BudgetModel.findByIdAndUpdate(
//         overallCategory._id,
//         { amount: parseFloat(newOverallAmount) },
//         { new: true }
//       );
//     } else {
//       // Create new overall budget
//       overallBudget = new BudgetModel({
//         userId,
//         amount: newBudgetAmount,
//         category: "Overall"
//       });
//       await overallBudget.save();
//     }

//     console.log("Existing Budget:", existingBudget);
//     console.log("Overall Budget:", overallBudget);
//     console.log("Updated Budget:", updatedBudget);

//     return res.status(200).json({ 
//       success: true,
//       newBudget: updatedBudget,
//       overallBudget: overallBudget
//     });

//   } catch (error) {
//     console.error("Budget creation error:", error);
//     return res.status(500).json({ 
//       error: "Budget creation failed", 
//       details: error.message 
//     });
//   }
// };


// const postBudget = async (req, res) => {
//   try {
//     const { userId, budgetAmount, budgetType } = req.body;

//     // Input validation
//     if (!userId || !budgetAmount || !budgetType) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Validate budgetAmount is a valid number
//     const newBudgetAmount = parseFloat(budgetAmount);
//     if (isNaN(newBudgetAmount) || newBudgetAmount < 0) {
//       return res.status(400).json({ error: "Invalid budget amount" });
//     }

//     // Validate category
//     const validCategories = [
//       "Food",
//       "Transport",
//       "Bills",
//       "Shopping",
//       "Entertainment",
//       "Health",
//       "Education",
//       "Other",
//     ];
//     if (!validCategories.includes(budgetType)) {
//       return res.status(400).json({ error: "Invalid budget category" });
//     }

//     // Validate userId format
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: "Invalid user ID format" });
//     }

//     // Check if user exists
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Find existing budget for this user and category (compound key)
//     const existingBudget = await BudgetModel.findOne({
//       userId: userId
//     });

//     let updatedBudget;
//     let budgetDifference = newBudgetAmount;

//     if (existingBudget) {
//       // Calculate the difference from existing budget
//       budgetDifference = newBudgetAmount - (existingBudget.amount || 0);

//       // Update existing budget
//       updatedBudget = await BudgetModel.findByIdAndUpdate(
//         existingBudget._id,
//         { amount: newBudgetAmount },
//         { new: true, runValidators: true }
//       );
//     } else {
//       // Create new budget for this user and category
//       updatedBudget = new BudgetModel({
//         userId: userId,
//         amount: newBudgetAmount,
//         category: budgetType,
//       });
//       await updatedBudget.save();
//     }

//     // Handle overall budget update for this specific user
//     const overallCategory = await BudgetModel.findOne({
//       userId: userId,
//       category: "Overall",
//     });

//     let overallBudget;

//     if (overallCategory) {
//       // Safely calculate new overall amount
//       const currentOverallAmount = overallCategory.amount || 0;
//       const newOverallAmount = currentOverallAmount + budgetDifference;

//       // Ensure overall amount doesn't go negative
//       const finalOverallAmount = Math.max(newOverallAmount, 0);

//       overallBudget = await BudgetModel.findByIdAndUpdate(
//         overallCategory._id,
//         { amount: finalOverallAmount },
//         { new: true, runValidators: true }
//       );
//     } else {
//       // Create new overall budget for this user
//       overallBudget = new BudgetModel({
//         userId: userId,
//         amount: newBudgetAmount,
//         category: "Overall",
//       });
//       await overallBudget.save();
//     }

//     console.log(`Budget operation for user ${userId}:`);
//     console.log("Existing Budget:", existingBudget);
//     console.log("Updated Budget:", updatedBudget);
//     console.log("Overall Budget:", overallBudget);

//     return res.status(200).json({
//       success: true,
//       message: existingBudget
//         ? "Budget updated successfully"
//         : "Budget created successfully",
//       budget: updatedBudget,
//       overallBudget: overallBudget,
//       budgetDifference: budgetDifference,
//     });
//   } catch (error) {
//     console.error("Budget operation error:", error);

//     // Handle specific MongoDB errors
//     if (error.code === 11000) {
//       // Duplicate key error - this shouldn't happen with proper compound index
//       // but handling it just in case
//       return res.status(409).json({
//         error: "Budget for this category already exists for this user",
//         details: "Each user can have only one budget per category",
//       });
//     }

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         error: "Validation failed",
//         details: error.message,
//       });
//     }

//     if (error.name === "CastError") {
//       return res.status(400).json({
//         error: "Invalid data format",
//         details: error.message,
//       });
//     }

//     return res.status(500).json({
//       error: "Budget operation failed",
//       details: error.message,
//     });
//   }
// };
// const getBudget = async (req,res) => {
//   try {
//     const {userId} = req.query;
//     if(!userId) {
//       return res.status(400).json({error: "Missing userId in query"});
//     }
//     const budgets = await BudgetModel.find({userId});
//     res.status(200).json(budgets)
//   } catch (error) {
//     console.log("Error fetching budgets: ",error)
//     res.status(500).json({error: "Server error fetching budgets"})
//   }
// }
const getBudget = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const budgets = await BudgetModel.find({ userId: userId }).sort({
      category: 1,
    });

    return res.status(200).json(budgets);
  } catch (error) {
    console.error("Error fetching user budgets:", error);
    return res.status(500).json({
      error: "Failed to fetch budgets",
      details: error.message,
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId in query" });
    }

    const expenses = await ExpenseModel.find({ userId });
    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Server error fetching expenses" });
  }
};

const postExpenses = async (req, res) => {
  try {
    const { description, amount, date, category, tags, userId } = req.body;
    if (!description || !amount || !date || !category || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // console.log(req.body);
    // budget.forEach((item)=> {
    //   if()
    // })
    const newExpense = new ExpenseModel({
      description,
      amount: parseFloat(amount),
      date: new Date(date),
      category,
      tags: tags || [],
      userId,
    });
    await newExpense.save();
    // const savedExpense = await ExpenseModel.findById(req.body)
    // const newExpense = new ExpenseModel({
    //   id,
    //   description,
    //   amount: parseFloat(amount), // Make sure it's number
    //   date,
    //   category,
    //   tags: tags || []
    // });

    // const savedExpense = await newExpense.save();
    return res.status(201).json({ expense: newExpense });
    // return res.status(201).json({ message: "Expense saved " });
  } catch (error) {
    console.error("Error saving expense:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteExpenses = async (req, res) => {
  try {
    const result = await ExpenseModel.findOneAndDelete({
      userId: req.user._id,
      _id: req.params.id,
    });
    if (!result) return res.status(404).json({ error: "Expense not found" });
    console.log(
      "Deleting Expense with ID:",
      req.params.id,
      "for User:",
      req.user._id
    );
    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting expense" });
  }
};

const deleteExpensesByCategory = async (req, res) => {
  try {
    const { userId, category } = req.body;

    // Validation
    if (!userId || !category) {
      return res.status(400).json({
        error: "Missing required fields: userId and category",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Delete ALL expenses matching userId AND category
    const result = await ExpenseModel.deleteMany({
      userId: userId,
      category: category,
    });

    console.log(
      `Deleted ${result.deletedCount} expense(s) with category: ${category} for User: ${userId}`
    );

    return res.status(200).json({
      message: "Expenses deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting expenses:", error);
    return res.status(500).json({
      error: "Error deleting expenses",
      details: error.message,
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { amount, category } = req.body;
    const budgetId = req.params.id;
    const userId = req.user._id; // From verifyJWT middleware

    // DEBUG: Log what you received
    console.log("Received update request:", {
      budgetId,
      userId,
      category,
      amount,
      amountType: typeof amount,
    });

    // --- Validation ---
    if (!budgetId || !mongoose.Types.ObjectId.isValid(budgetId)) {
      console.log("Validation failed: invalid budget ID");
      return res.status(400).json({ error: "Invalid budget ID format" });
    }

    if (amount === undefined || amount === null) {
      console.log("Validation failed: missing amount");
      return res.status(400).json({
        error: "Missing required field: amount",
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      console.log("Validation failed: invalid amount", {
        amount,
        numericAmount,
      });
      return res.status(400).json({
        error: "Amount must be a non-negative number",
      });
    }

    console.log("Validation passed, updating budget...");

    // Update by ID and userId to ensure user owns this budget
    const updatedBudget = await BudgetModel.findOneAndUpdate(
      { _id: budgetId, userId: userId },
      { $set: { amount: numericAmount } },
      { new: true, runValidators: true }
    );

    if (!updatedBudget) {
      console.log("Budget not found");
      return res.status(404).json({
        error: "Budget not found or you don't have permission to update it",
      });
    }

    console.log("Budget updated successfully:", updatedBudget);
    return res.status(200).json({
      message: "Budget updated successfully",
      data: updatedBudget,
    });
  } catch (error) {
    console.error("Error updating budget:", error);
    return res.status(500).json({
      error: "Failed to update budget",
      details: error.message,
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const result = await BudgetModel.findOneAndDelete({
      // ✅ Use BudgetModel
      userId: req.user._id,
      _id: req.params.id,
    });

    if (!result) {
      return res.status(404).json({ error: "Budget not found" });
    }

    console.log(
      "Deleted Budget with ID:",
      req.params.id,
      "for User:",
      req.user._id
    );

    res.status(200).json({
      message: "Budget deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ error: "Error deleting budget" });
  }
};
// const deleteBudget = async (req, res) => {
//   try {
//     const { userId, category } = req.body; // ← Changed from budgetType

//     if (!userId || !category) {
//       return res
//         .status(400)
//         .json({ error: "Missing required fields: userId and category" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: "Invalid user ID format" });
//     }

//     const deletedBudget = await BudgetModel.findOneAndDelete({
//       userId: userId,
//       category: category,
//     });

//     if (!deletedBudget) {
//       return res
//         .status(404)
//         .json({ error: "Budget not found for this user and category" });
//     }

//     return res.status(200).json({ message: "Budget deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting budget:", error);
//     return res.status(500).json({
//       error: "Failed to delete budget",
//       details: error.message,
//     });
//   }
// };
//   // const postExpenses = async(req,res) => {
//   // try {
//   // const { newExpense } = req.body;
//   //   const newExpense = new ExpenseModel({
//   //     id,
//   //     description,
//   //     amount,
//   //     date,
//   //     category,
//   //     tags,
//   //     userId: req.user.id
//   //   });
//   //   if (!newExpense) {
//   //     res.status(500).json({error: "No expense"})
//   //   } else {
//   //     await newExpense.save();
//   //   }
//     // res.status(201).json({ message: "Expense saved", expense: newExpense });
//   // } catch (err) {
//   //   res.status(500).json({ error: "Error saving expense" });
//   // }
//   try {
//     const {id,description,amount,date,category,tags} = req.body;
//     const expenses = await ExpenseModel.create(req.body)
//     return res.status(200)
//       .json({expense: expenses})
//   } catch (error) {
//     res.status(500)
//       .json({error: error})
//   }
// }


export {
  register,
  login,
  logout,
  generateAccessAndRefreshToken,
  refreshAccessToken,
  getLogin,
  postBudget,
  getBudget,
  getExpenses,
  postExpenses,
  deleteExpenses,
  updateBudget,
  deleteBudget,
  deleteExpensesByCategory
};

// const login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await UserModel.findOne({ email });
//     if (!user) return res.status(400).json({ error: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
//     if (isMatch) return res.json("success");

//     const token = jsonwebtoken.sign(
//       { id: user._id },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: "5m" }
//     );
//     res.json({ token, user: { id: user._id, username: user.username } });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }

// async function login(req,res) {
//     const {email,password} = req.body
//     try{
//         const user = await UserModel.findOne({email})
//         if(!user) return res.status(400).json({error: "User not found"})

//         const isMatch = await bcrypt.compare(password,user.password)
//         if(!isMatch) return res.status(400).json({error: "Invalid credentials"})

//         const token = jsonwebtoken.sign({id: user._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn: "5m"})
//         res.json({token,user: {id: user._id, username: user.username}})
//     }
//     catch(err){
//         res.status(500).json({error: err.message})
//     }
// }

// async function register(req,res) {
//     const {username,email,password} = req.body;
//     try{
//         const hashpassword = await bcrypt.hash(password,10)
//         const newUser = await UserModel.create({username,email,password: hashpassword})
//         res.status(201).json({message: "User registered successfully"})
//     }
//     catch(err){
//         res.status(501).json({error: err.message})
//     }
// }

// const {username,email,password} = req.body;
// try{
//     const hashpassword = await bcrypt.hash(password,10)
//     const newUser = await UserModel.create({username,email,password: hashpassword})
//     res.status(201).json({message: "User registered successfully"})
// }
// catch(err){
//     res.status(501).json({error: err.message})
// }

//     const { username, email, password } = req.body;
//   // console.log("email: ",email)
//   if (
//     [email, username, password].some((filed) => filed?.trim() === "")
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }
//   const existedUser = await User.findOne({
//     $or: [{ username }, { email }],
//   });
//   if (existedUser) {
//     throw new ApiError(400, "Username or Email already exists");
//   }
//   // console.log("req.body: ",req.body)
//   // console.log("req.files: ",req.files)
//   const avatarLocalPath = req.files?.avatar[0]?.path;
//   // const coverImageLocalPath = req.files?.coverImage[0]?.path
//   let coverImageLocalPath;
//   if (
//     req.files &&
//     Array.isArray(req.files.coverImage) &&
//     req.files.coverImage.length > 0
//   ) {
//     coverImageLocalPath = req.files.coverImage[0].path;
//   }

//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required");
//   }
//   const avatar = await uploadOnCloudinary(avatarLocalPath);
//   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//   if (!avatar) {
//     throw new ApiError(400, "Avatar upload failed");
//   }
//   const user = await User.create({
//     fullName,
//     avatar: avatar.url,
//     coverImage: coverImage?.url || "",
//     email,
//     password,
//     username: username.toLowerCase(),
//   });
//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//   );
//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }
//   return res
//     .status(201)
//     .json(new ApiResponse(200, createdUser, "User created successfully"));
// }

//   const {email,password} = req.body;
//   UserModel.findOne({email:email})
//   .then(user=>{
//     if(user){
//       if(user.password === password){
//         res.json("success")
//       }
//       else{
//         res.json("the password is incorrect")
//       }
//     }
//     else{
//       res.json("Incorrect Email")
//     }
//   })
// };

// export { register, login };
