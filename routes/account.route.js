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

})

export default router