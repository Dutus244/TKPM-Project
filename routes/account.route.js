import express from "express";
import bcrypt from "bcryptjs";
import accountService from "../services/account.service.js";
import { v4 } from "uuid";

const router = express.Router();
const SALT_LENGTH = 10;

router.get("/login", function (req, res) {
  req.session.retUrl = req.headers.referer
  res.render("vwAccount/login", {});
});

router.post("/login", async function (req, res) {
  const user = await accountService.login(req.body.username);
  if (!user) {
    return res.render("vwAccount/login", {
      err_msg: "Invalid username or password.",
    });
  }
  if (user.lockaccount === 1) {
    return res.render("vwAccount/login", {
      err_msg: "Your account has been banned",
    });
  }

  const ret = bcrypt.compareSync(req.body.password, user.pass.toString());
  if (!ret) {
    return res.render("vwAccount/login", {
      err_msg: "Invalid username or password",
    });
  }

  delete user.pass;

  req.session.auth = true;
  req.session.authUser = user;

  const url = req.session.retUrl || "/";
  delete req.session.retUrl;
  if (user.permission === 1) {
    // Redirect to Admin here
  }
  res.redirect(url);
});

router.post("/logout", function (req, res) {
  req.session.auth = false;
  req.session.authUser = null;

  const url = req.headers.referer || "/";
  res.redirect(url);
});

router.get("/register", function (req, res) {
  res.render("vwAccount/register", {});
});

router.post("/register", async function (req, res) {
  const salt = bcrypt.genSaltSync(SALT_LENGTH);
  const hash = bcrypt.hashSync(req.body.password, salt);
  const id = v4();
  const timestamp = new Date();

  const user = {
    userid: id,
    username: req.body.username,
    pass: hash,
    typeaccount: 0,
    createtime: timestamp,
    updatetime: timestamp,
    lockaccount: false,
    isdelete: false,
  };

  await accountService.addUser(user);
  res.render("vwAccount/register", {
    success: true,
  });
});

router.get("/account/is-available", async function (req, res) {
  const username = req.query.username;
  const user = await accountService.findByUsername(username);
  if (!user) {
    return res.json(true);
  }
  return res.json(false);
});

export default router;
