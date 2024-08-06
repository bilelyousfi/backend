import UserService from "../services/UserService.js";
import UserM from "../models/UserModel.js";
import sendEmail from "../services/email.js";



export async function signup(req, res, next) {
   
    try {
        const { userName, email, phoneNumber, password ,role} = req.body;
        var avatar =req.file?.filename
      const newUser = new UserM({
        userName,
        email,
        phoneNumber,
        password,
        avatar,
        role
        
      })
      newUser.save()
        .then(async (result) => {
          
          await sendEmail({
            email: newUser.email,
            subject: '	Welcome în home-service',
            text : 'Welcome to home-service Thank you for joining us Thank you again for choosing home-service.'
  
          });
          console.log(result);
          res.status(201).json({
            status: true,
            message: "user has been succefully created"
          })
  
        })
        .catch((err) => {
            if (err.keyPattern) {
                res.status(409).json({
                  status: false,
                  response: Object.keys(err.keyPattern)[0] + " already used",
                });
              } else {
                res.status(500).json({ status: false, response: "Internal Server Error" });
              }
        })
  
    } catch (error) {
      res.status(400).send("Bad request")
    }
  }

  async function login(req, res ) {
    try {
      const { email, password } = req.body;
      const user = await UserService.checkuser(email);
      if (!user) {
        res
          .status(404)
          .json({ status: false, token: "", error: "User does not exist" });
      }
      const isMatch = await UserService.comparePassword(password, user.password);
      if (isMatch === false) {
        res
          .status(401)
          .json({ status: false, token: "", error: "Invalid password" });
      }
  
      const tokenData = { _id: user._id, phoneNumber: user.phoneNumber };
      const token = await UserService.generateToken(tokenData, "secretKey", "90d");
      res.status(200).json({ status: true, token: token, error: "" });
    } catch (error) {
      res.status(500).json({ status: false, token: "", error: error });
    }
  }
  async function loginAdmin(req, res) {
    try {
      const { email, password } = req.body;
      const user = await UserService.checkuser(email);
      console.log(user);
      if (!user) {
        res
          .status(404)
          .json({ status: false, token: "", error: "User does not exist" });
      }
      if (user.role === "ADMIN") {
        const isMatch = await UserService.comparePassword(
          password,
          user.password
        );
        if (isMatch === false) {
          res
            .status(401)
            .json({ status: false, token: "", error: "Invalid password" });
        }
  
        const tokenData = { _id: user._id, phoneNumber: user.phoneNumber };
        const token = await UserService.generateToken(
          tokenData,
          "secretKey",
          "5h"
        );
        res.status(200).json({ status: true, token: token, error: "" });
      } else {
        res.status(403).json({ status: false, token: "", error:"You are not authorized to perform this action"});
      }
    } catch (error) {
      res.status(500).json({ status: false, token: "", error: error });
    }
  }

  async function forgetPwd(req, res) {
    try {
        const { email } = req.body;
        const user = await UserService.checkuser(email);
        if (!user) {
            return res.status(404).json({ status: false, token: "", error: "User not found" });
        }

        const random = await UserService.generateCode();
        const tokenData = {
            _id: user._id,
            email: user.email,
            code: random,
        };

        const token = await UserService.generateToken(tokenData, "secretKey", "1h");
        try {
            await sendEmail({
                email: user.email,
                subject: 'Reset your password',
                text: `Hi ${user.userName},\n\nWe have received a request to reset your password.\nYour verification code is: ${random}\n\nThank you,`
            });

            console.log(`Message sent: ${token}`);
            res.status(200).json({ status: true, token: token, error: "" });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ status: false, token: "", error: "Failed to send email" });
        }

    } catch (error) {
        console.error('Error handling password reset:', error);
        res.status(500).json({ status: false, token: "", error: "Internal server error" });
    }
}
async function otp(req, res) {
  try{
   
    const code = req.payload.code;
    const paramCode = req.body.data;
    console.log(paramCode);
    if (code.trim() === paramCode.trim()) {
      if (!req.user) {
        return res.status(500).json({ status: false, token: "", error: "User information is missing" });
      }
      const tokenData = {
        _id: req.user._id,
        email: req.user.email,
        code: code,
      };
      const token = await UserService.generateToken(tokenData, "secretKey", "5m");
      res.status(200).json({ status: true, token: token, error: "" });
    } else {
      res.status(403).json({ status: false, token: "", error: "Invalid code" });
    }
  } catch (error) {
    res.status(500).json({ status: false, token: "", error: error.message });
  }
}

async function newPwd(req, res) {
  try {
    const user = await UserM.findOneAndUpdate(
      { _id: req.payload._id },
      { password: req.body.password},
      { new: true }
    );
    if (!user) {
      res
        .status(404)
        .json({ status: false, token: "", error: "User not found" });
    } else {
      res
        .status(200)
        .json({ status: true, token: "", error: "" });
    }
  } catch (error) {
    res.status(500).json({ status: false, token: "", error: error });
  }
}
async function newAdmin(req, res, next) {
  try {
    const { userName, email, phoneNumber, password } = req.body;
    var avatar =req.file?.filename
    const createUser = new UserM({
      userName, email, phoneNumber, password,avatar,
      "role":"ADMIN"
    });
     await createUser.save();
    res.status(201).json({ status: true, response: "Admin Registered" });
  } catch (error) {
    if (error.keyPattern) {
      console.log("Error", error);
      res.status(403).json({
        status: false,
        response: Object.keys(error.keyPattern)[0] + " already used",
      });
    } else {
      console.log("err", error);
      res.status(500).json({ status: false, response: "Internal Server Error" });
    }
  }
}


  export default { signup,login,loginAdmin,forgetPwd,otp,newPwd,newAdmin};