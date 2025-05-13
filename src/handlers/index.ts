import type { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import User from "../models/User"
import { hashPassword, checkPassword } from '../utils/auth'
import slug from 'slug'
import { generateJWT } from '../utils/jwt'

export const createAccount = async (req: Request, res: Response) => {
  
  const { email, password } = req.body 
  const userExists = await User.findOne({email})
  if(userExists) {
    const error = new Error('Un usuario con ese email ya está registrado')
    res.status(409).json({
      error: error.message
    })
    return
  }
  
  const handle = slug(req.body.handle, '')
  const handleExists = await User.findOne({handle})
  if(handleExists) {
    const error = new Error('nombre de usuario no disponible')
    res.status(409).json({
      error: error.message
    })
    return
  }
  const user = new User(req.body)
  user.password = await hashPassword(password)
  user.handle = handle
  await user.save()
  res.status(201).send("registro guardado")
}

export const login = async (req: Request, res: Response) => {

  const { email, password } = req.body 

  const user = await User.findOne({email})
  if(!user) {
    const error = new Error('El usuario no existe')
    res.status(404).json({
      error: error.message
    })
    return
  }
  
  const isPasswordCorrect = await checkPassword(password, user.password)
  if(!isPasswordCorrect) {
    const error = new Error('Password incorrecto')
    res.status(401).json({
      error: error.message
    })
    return
  }
  const token = generateJWT({id: user._id})
  res.send(token)
}