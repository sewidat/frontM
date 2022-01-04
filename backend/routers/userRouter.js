import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import data from "../data.js";
import User from "../models/userModel.js";
import { generateToken, isAdmin, isAuth } from "../utils.js";
import axios from "axios";
import { aws4Interceptor } from "aws4-axios";
import qs, { stringify } from "qs";
import aws from "aws-sdk";
const interceptor = aws4Interceptor({
  region: "us-east-1",
  service: "execute-api",
});
axios.interceptors.request.use(interceptor);
const userRouter = express.Router();
userRouter.get(
  "/top-sellers",
  expressAsyncHandler(async (req, res) => {
    console.log("top sellers");
    const topSellers = await User.find({ isSeller: true })
      .sort({ "seller.rating": -1 })
      .limit(3);
    res.send(topSellers);
  })
);
// nothing
userRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    console.log("seed");
    // await User.remove({});
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers });
  })
);
//signin => done
userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    console.log("signin");
    let user = await axios.get(
      "https://29y96ve9zl.execute-api.us-east-1.amazonaws.com/user",
      { params: { email: req.body.email } }
    );
    user = user.data[0];
    console.log(user);
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password.S)) {
        res.send({
          id: user.id.S,
          name: user.name.S,
          email: user.email.S,
          isAdmin: user.isAdmin.BOOL,
          isSeller: user.isSeller.BOOL,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "Invalid email or password" });
  })
);
//register => done
userRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    console.log("register");
    const params = new URLSearchParams();
    params.append("email", req.body.email);
    params.append("name", req.body.name);
    params.append("password", await bcrypt.hashSync(req.body.password, 8));
    console.log("samer");
    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    const url = `https://29y96ve9zl.execute-api.us-east-1.amazonaws.com/users`;
    let createdUser = await axios.post(url, params, config);

    createdUser = createdUser.data;

    res.send({
      id: createdUser.id.S,
      name: createdUser.name.S,
      email: createdUser.email.S,
      isAdmin: createdUser.isAdmin.BOOL,
      isSeller: createdUser.isSeller.BOOL,
      token: generateToken(createdUser),
    });
  })
);
//byId => done
userRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const url = `https://29y96ve9zl.execute-api.us-east-1.amazonaws.com/users`;
    const data = { id: req.params.id };
    const options = {
      method: "GET",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: qs.stringify(data),
      url,
    };
    let resData = await axios(options);
    let user = resData.data;
    // res.send(user);
    res.send({
      email: user.email.S,
      name: user.name.S,
      isSeller: user.isSeller.BOOL,
      isAdmin: user.isAdmin.BOOL,
      id: user.id.S,
    });
  })
);
//maybe this is the user update?!
userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // const user = await User.findById(req.user._id);
    const url = `https://29y96ve9zl.execute-api.us-east-1.amazonaws.com/users`;
    console.log("before");
    console.log(req.user);
    const data = { id: req.user.id };
    const options = {
      method: "GET",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: qs.stringify(data),
      url,
    };
    let user = await axios(options);
    user = user.data;
    console.log("user before updating");
    console.log(user);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (user.isSeller) {
        user.seller.name = req.body.sellerName || user.seller.name;
        user.seller.logo = req.body.sellerLogo || user.seller.logo;
        user.seller.description =
          req.body.sellerDescription || user.seller.description;
      }
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }
      // console.log("updated user");
      let updatedUser = aws.DynamoDB.Converter.marshall(user);
      console.log(updatedUser);
      const url = `https://29y96ve9zl.execute-api.us-east-1.amazonaws.com/userx`;
      console.log("before2");
      // console.log(JSON.stringify(updatedUser));
      const data2 = { data: updatedUser };
      const options = {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        data: JSON.stringify(data2),
        url,
      };
      let user2 = await axios(options);
      console.log(user2.data);
      // console.log(aws.DynamoDB.Converter.unmarshall(user2.data));
      // const updatedUser = await user.save();
      // res.send({
      //   id: updatedUser.id,
      //   name: updatedUser.name,
      //   email: updatedUser.email,
      //   isAdmin: updatedUser.isAdmin,
      //   isSeller: user.isSeller,
      //   token: generateToken(updatedUser),
      // });
    }
  })
);
userRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);
userRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === "admin@example.com") {
        res.status(400).send({ message: "Can Not Delete Admin User" });
        return;
      }
      const deleteUser = await user.remove();
      res.send({ message: "User Deleted", user: deleteUser });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);
userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isSeller = req.body.isSeller || user.isSeller;
      user.isAdmin = req.body.isAdmin || user.isAdmin;
      const updatedUser = await user.save();
      res.send({ message: "User Updated", user: updatedUser });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);
export default userRouter;
