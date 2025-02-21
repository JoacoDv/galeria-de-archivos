import { createTransport } from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()

const transporter = createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: 'joacodv2003@gmail.com',
      pass: process.env.NMPASSWORD
    }
  })
  

  export default transporter