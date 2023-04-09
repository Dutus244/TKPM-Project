import express from 'express'
import bcrypt from 'bcryptjs';
import accountService from "../services/account.service.js";
import { v4 } from 'uuid'

const router = express.Router()

router.get('/login', async function(req, res) {
  res.render('vwAccount/login', {

  })
})

router.post('/login', async function(req, res) {
  
})

router.get('/register', async function(req, res) {
  res.render('vwAccount/register', {
    
  })
})

router.post('/register', async function(req, res) {
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(req.body.password, salt)
  const id = v4()
  const timestamp = new Date()

  const user = {
    userid: id,
    username: req.body.username,
    pass: hash,
    typeaccount: 0,
    createtime: timestamp,
    updatetime: timestamp,
    lockaccount: false,
    isdelete: false,
  }

  await accountService.addUser(user)
  res.render('vwAccount/register', {
    success: true,
  })
})

router.get('/account/is-available', async function(req, res) {
  const username = req.query.username
  const user = await accountService.findByUsername(username)
  if (user === null)
    return res.json(true)
  return res.json(false)
})

export default router