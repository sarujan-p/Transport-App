const db = require("../models/users");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret_key = "my secret keys";

const createUser = async (req, res, next) => {
    let existingUser;
    try{
        existingUser = await db.findOne({email: req.body.email});
    }catch (err) {
        console.log({message: err.message});
    }

    if(existingUser){
        res.send({message: "user allready exist!"});
        console.log("user allready exist!");
    }else{
        try{
            const {email, phone, password} = req.body;
            const hashedPassword = bcrypt.hashSync(password);
            const newUser = new db({
                email,
                phone,
                password: hashedPassword
            });

            await newUser.save();
            res.status(201).json({message: "successfully register!", newUser});
            console.log("successfully register!");
        }catch (error) {
            res.status(409).json({message: err.message});
            console.log(err.message);
        }
    }
}

const loginUser = async (req, res, next) => {
    let existingUser;
    const {email, password} = req.body;

    try{
        existingUser = await db.findOne({email: email});
    }catch(err) {
        res.send({message: err.message});
    }

    try {
        if(existingUser){
            let isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
            if(isPasswordCorrect){
                const token = jwt.sign({id: existingUser._id}, secret_key, {expiresIn: "35s"});
                console.log("Generated token\n", token);
                if(req.cookies[`${existingUser._id}`]){
                    req.cookies[`${existingUser._id}`] = "";
                }
                res.cookie(String(existingUser._id), token, {
                    path: '/',
                    expires: new Date(Date.now() + 1000 * 30),
                    httpOnly: true,
                    sameSite: 'lax'
                });
                res.send({message: "user sccessfully login!", user: existingUser, token});
                console.log("user sccessfully login!");
            }else{
                res.send({message: "incorrect password"});
                console.log("incorrect password!");
            }
        }else{
            res.send({message: "user doesn't exist!"});
            console.log("user doesn't exist!");
        }
    } catch (err) {
        res.send({message: err.message});
        console.log(err.message);
    }
}

const verifyToken = (req, res, next) => {
    const cookies = req.headers.cookie;
    const token = cookies.split("=")[1];
    if(!token){
        res.send({message: "Token not found!"});
    }else{
        jwt.verify(String(token), secret_key, (err, user) => {
            if(err){
                res.send({message: "Invalid token!"})
            }else{
                req.id = user.id;
            }
            next();
        });
    }
}

const getUser = async (req, res, next) => {
    const userId = req.id;
    let user;

    try{
        user = await db.findById(userId, "-password");
    }catch (err){
        res.send({message: err.message});
    }

    if(!user){
        res.send({message: "User not exist!"});
    }else{
        res.send(user);
    }
}

const refreshToken = (req, res, next) => {
    const cookies = req.headers.cookie;
    const prevToken = cookies.split("=")[1];
    if(!prevToken){
        res.send({message: "Couldn't find token"});
    }else{
        jwt.verify(String(prevToken), secret_key, (err, user) => {
            if(err){
                res.send({message: err.message});
            }else{
                res.clearCookie(`${user.id}`);
                req.cookies[`${user.id}`] = "";
                const token = jwt.sign({id: user.id}, secret_key, {expiresIn: "35s"});
                console.log("Regenerated token\n", token);
                res.cookie(String(user.id), token, {
                    path: '/',
                    expires: new Date(Date.now() + 1000 * 30),
                    httpOnly: true,
                    sameSite: 'lax'
                });
                req.id = user.id;
                next();
            }
        });
    }
}

module.exports = { createUser, loginUser, verifyToken, getUser, refreshToken };