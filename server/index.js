import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from './databaseConfig.js'
import transporter from './nodemailerConfig.js' 
import upload from './multerConfig.js'
import dotenv from 'dotenv'
import axios from 'axios'
import fs from 'fs'
const PORT = process.env.PORT ?? 8080
const app = express()
dotenv.config()
app.use(express.json())
app.use(cors())
app.disable('x-powered-by')


app.get('/', (req, res) => {
  res.send('API para crear y autenticar usuarios')
})


// Ruta para crear un nuevo usuario
app.post('/usuarios', async (req, res) => {
  const { username, email, password } = req.body 
  const token = jwt.sign({ email }, process.env.TOKEN)

  transporter.sendMail({
    from: '"Joakito" <joacodv2003@gmail.com>', // sender address
    to: email, // list of receivers
    subject: 'Verifique su usuario', // Subject line
    text: 'Buenas verifique su usuario', // plain text body
    html: `<a href="http://localhost:3000/validacion?token=${token}">Verificar</a>` // html body
  })

  try {
    const hashedPassword = await bcrypt.hash(password, 10) // Encriptar la contraseña
    const result = await pool.query('INSERT INTO usuarios (username, email, password) VALUES ($1, $2, $3) RETURNING id', [username, email, hashedPassword])
    res.status(201).json({ id: result.rows[0].id })
  } catch (error) {
    console.error('Error al crear el usuario:', error)
    res.status(500).json({ error: 'Error al crear el usuario' })
  }
})

app.post('/validacion', (req, res) => {
  const { token } = req.body
  const { email } = jwt.verify(token, process.env.TOKEN)

  try {
    pool.query('UPDATE usuarios SET validacion = true WHERE email = $1', [email])
    console.log('El usuario a sido validado')
    res.status(200).json({ validado: 'Usuario validado' })
  } catch (error) {
    console.error('error al validar el usuario', error)
    res.status(500)
  }
})

app.put('/password/change', async (req, res) => {
  const { password, token } = req.body
  const { email } = jwt.verify(token, process.env.TOKEN)
  const cryptPassword = await bcrypt.hash(password, 10)

  try {
    pool.query('UPDATE usuarios SET password = $1 WHERE email = $2', [cryptPassword, email])
    res.status(200).json({ respuesta: 'contraseña modificada' })
  } catch (error) {
    console.error('error al cambiar la contraseña', error)
    res.status(500)
  }
})

app.post('/password', (req, res) => {
  const { email } = req.body
  const token = jwt.sign({ email }, process.env.TOKEN)
  try {
    transporter.sendMail({
      from: '"Joaco" <joacodv2003@gmail.com>', // sender address
      to: email, // list of receivers
      subject: 'Reacupere su contraseña', // Subject line
      text: 'Dirigase al link para recuperar su contraseña', // plain text body
      html: `<a href="http://localhost:3000/contraseña/modificar?token=${token}">Recuperar mi contraseña</a>` // html body
    })
    res.status(200).json({ respuesta: 'contraseña enviada' })
  } catch (error) {
    console.error('error al enviar mail', error)
    res.status(500).json({ error: 'error' })
  }
})

// Ruta para validar un usuario
app.post('/usuarios/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])
    const user = result.rows[0]
    console.log(await bcrypt.compare(password, user.password))

    if (user && (await bcrypt.compare(password, user.password)) && user.validacion) {
      // Generar un token si la validación es exitosa
      const token = jwt.sign({ id: user.id }, process.env.TOKEN, { expiresIn: '1h' })
      res.json({ token })
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' })
    }
  } catch (error) {
    console.error('Error al validar el usuario:', error)
    res.status(500).json({ error: 'Error al validar el usuario' })
  }
})


// Ruta para manejar la subida del archivo
app.post("/uploadfile", upload.single("file"), async (req, res) => {
  if(!req.headers.authorization){
    res.status(401).json({error: "unauthorize"})
  }
  const base64 = req.file.buffer.toString("base64")
  const tipo = req.file.mimetype
  const nombre = req.file.originalname
  //TODO: usar authorizationMethod para checkear que verifico un token
  const [_authorizationMethod, token] = req.headers.authorization.split(" ")
  const {id} = jwt.verify(token, process.env.TOKEN)
  try {
    pool.query('INSERT INTO archivos (id, archivo, tipo, nombre) VALUES ($1, $2, $3, $4)', [id, base64, tipo, nombre])
    res.status(200).json({respuesta: 'se pudo guardar'})
  } catch (error) {
    console.error('no se a podido guardar el archivo', error)
    res.status(500).json({ error: "fallo al cargar el archivo"})
  }
});

app.get("/showfiles", async (req, res) => {
  const [ _authorizationMethod, token] = req.headers.authorization.split(" ")
  const {id} = jwt.verify(token, process.env.TOKEN)
 try {
    const response = await pool.query('SELECT * FROM archivos WHERE id = $1', [id])
    res.status(200).json({archivos: response.rows})
  } catch (error) {
    console.error("no se han podido obtener los archivos", error)
    res.status(500).json({error: 'fallo al cargar'})
  }
})




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
