import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken'

export const signup = async(req,res,next)=>{
    const { username, email, password} = req.body;
    const hashedPassword = bcryptjs.hashSync(password,10)
    const newUser = new User({username,email,password: hashedPassword});

    try {
        await newUser.save();

        res.status(201).json({msg: "User created successfully"})
    
    } catch (error) {
        next(error);
    }
};


export const signin = async(req,res,next)=>{
        const {email,password} = req.body;

        try {
            const validUser = await User.findOne({ email: email});
            if(!validUser) return next(errorHandler(401, 'User not found'));
            const validPasswoed = bcryptjs.compareSync(password, validUser.password);
            if(!validPasswoed) return next(errorHandler(401,'wrong credentials'));
            const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET)
            const { password: hashedPassword,...rest} = validUser._doc;
            const expiryDate = new Date(Date.now()+ 360000000);
            res.cookie('access_token', token, {httpOnly: true,expires:expiryDate}).status(200).json({rest})
        } catch (error) {
            next(error);
        }
}