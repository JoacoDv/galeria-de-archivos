import multer from "multer"

// Configurar Multer para guardar el archivo en una carpeta 'uploads'
const st = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads') // Directorio donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname) // Renombrar el archivo para evitar duplicados
    }
  })
  
  const upload = multer({ st })

  export default upload