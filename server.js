const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userDetails = require("./models/userDetails");
var app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtAuth = require("./middleware/jwtAuth");

const port = process.env.PORT || 4000;

app.use(express.json());

app.use(cors());

mongoose
  .connect(
    `mongodb+srv://skjainoddin39854:hngmFxWB8ZLTHpwW@cluster0.lbfgvl4.mongodb.net/synergy-projecct-figma?retryWrites=true&w=majority
 JWT_SECRET=tUao3/fmx20gO0uLwpnlJ6t2qzMeOEWAxsIz/OG+3y4=`
  )
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error(err);
  });

app.post("/signup", async (req, res) => {
  try {
    const emailUse = await userDetails.findOne({ email: req.body.email });
    if (emailUse) {
      return res.status(400).send("already email is used");
    }
   
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedpassword;
    
    const userData = new userDetails(req.body);
    const saveDate = await userData.save();
    res.status(201).send(saveDate);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
    try {
      const user = await userDetails.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).send("Invalid User");
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(400).send("invalid Password");
      }
      const token = jwt.sign({ email: user.email }, "secretToken", {
        expiresIn: "1m",
      });
  
      res.status(200).json({ token, message: "Login successfully" });
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/userfind", async (req, res) => {
    try {
      const user = await userDetails.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).send("Invalid User");
      } 
      res.status(200).json({ message: "user find" });
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/updatepassword", async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: "All fields are required" });
      }
  
      const user = await userDetails.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });




  app.post("/emailcheck", async (req, res) => {
    try {
      const user = await userDetails.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).send("Email not found");
      }
      
  
      const token = jwt.sign({ email: user.email }, "secretToken", {
        expiresIn: "1m",
      });
  
      res.status(200).json({ token, message: "Email verified successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  });
  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })