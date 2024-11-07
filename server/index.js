import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from './databaseConfig.js'
import transporter from './nodemailerConfig.js' 
import upload from './multerConfig.js'
import dotenv from 'dotenv'
import axios from 'axios'
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

/* app.post('/uploadfile', upload.single('file'), async (req, res) => {
  const data = req.file
  console.log(data)
  try {
    res.status(200)
  } catch (error) {
    console.error('no se pudo subir el archivo', error)
    res.status(500)
  }
})
 */



// Función para obtener el authorizationToken
async function getAuthToken(applicationKeyId, applicationKey) {
    const credentials = Buffer.from(`${applicationKeyId}:${applicationKey}`).toString("base64");
    const authResponse = await axios.get("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
        headers: {
            Authorization: `Basic ${credentials}`,
        },
    });
    return authResponse.data;
}

async function getDownloadAuthToken(applicationToken, bucketId, fileName) {
  try {
    const downloadAuthResponse = await axios.post(
      "https://api.backblazeb2.com/b2api/v2/b2_get_download_authorization",
      {
        bucketId: bucketId,  // ID del bucket donde está el archivo
        fileNamePrefix: fileName, // Nombre exacto del archivo
        validDurationInSeconds: 3600, // Duración del token (1 hora)
      },
      {
        headers: {
          Authorization: `Bearer ${applicationToken}`,  // Asegúrate de que el token sea correcto
        },
      }
    );
    return downloadAuthResponse.data;
  } catch (error) {
    console.error('Error obteniendo el token de descarga:', error.response ? error.response.data : error.message);
    throw error;
  }
}


// Función para obtener la URL de subida
async function getUploadUrl(bucketId, apiUrl, authorizationToken) {
    const uploadUrlResponse = await axios.post(
        `${apiUrl}/b2api/v2/b2_get_upload_url`,
        { bucketId },
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    );
    return uploadUrlResponse.data;
}



async function getDownloadUrl(bucketId, fileId, authToken) {
  const response = await axios.post(
      "https://api.backblazeb2.com/b2api/v2/b2_get_download_authorization",
      {
          bucketId: bucketId,
          fileNamePrefix: fileId,  // Usas el fileId aquí
          validDurationInSeconds: 3600,  // Duración del token en segundos (1 hora)
      },
      {
          headers: {
              Authorization: authToken,
          },
      }
  );
  return response.data.downloadUrl;
}



// Ruta para manejar la subida del archivo
app.post("/uploadfile", upload.single("file"), async (req, res) => {
    try {
        const applicationKeyId = "005095c306a5f8b0000000001";
        const applicationKey = "K0056p2RuHJxhKiXntjt4qQE6zdNFSg";
        const bucketId = "20a9a54ca3b0064a953f081b";
        const fileName = req.file.originalname;

        // Paso 1: Obtener el authorizationToken
        const authData = await getAuthToken(applicationKeyId, applicationKey);

        // Paso 2: Obtener la URL de subida
        const uploadData = await getUploadUrl(bucketId, authData.apiUrl, authData.authorizationToken);

        // Paso 3: Sube el archivo a Backblaze B2 usando el buffer
        const response = await axios.post(uploadData.uploadUrl, req.file.buffer, {
            headers: {
                Authorization: uploadData.authorizationToken,
                "X-Bz-File-Name": fileName,
                "Content-Type": req.file.mimetype,
                "X-Bz-Content-Sha1": "do_not_verify", // Usa `do_not_verify` para simplificar la prueba; en producción es mejor calcular el SHA1
            },
        });

        const fileId = response.data.fileName;
        const downloadToken = await getDownloadAuthToken(authData.authorizationToken, bucketId, fileId)
        /* console.log(fileId) */
        /* console.log(uploadData) */
        /* console.log(authData.authorizationToken) */

        /* const downloadUrl = await getDownloadUrl(bucketId, fileId, downloadToken);        
        console.log("URL de descarga: ", downloadUrl); */
        console.log(downloadToken)
        
        
        /* console.log(response) */
        /* console.log(response, authData, uploadData) */

        res.json({ message: "Subida exitosa", data: response.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en la subida", error: error.message });
    }
});




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
