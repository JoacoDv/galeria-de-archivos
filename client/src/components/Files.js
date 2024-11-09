import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

function Files () {
  const location = useLocation()
  const token = location.search.split('=').slice(1).join('')
  const [render, setRender] = useState([])
  const [file, setFile] = useState()
  const fileValue = e => {
    setFile(e.target.files[0])
  }
  function loadFile (e) {
    const data = new FormData()
    data.append('file', file)
    console.log(data)
    fetch('http://localhost:5000/uploadfile', {
      method: 'POST',
      headers: new Headers({
        Authorization: 'Token ' + token
      }),
      body: data
    })
      .then(response => response.json)
      .then(data => {
        console.log(data)
      })

    e.preventDefault()
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/showfiles', {
          method: 'GET',
          headers: {
            Authorization: 'Token ' + token
          }
        })
        const result = await response.json()
        const array = Object.values(result)
        setRender(Array.isArray(array) ? array : []) // Asegurarse de que sea un array
      } catch (error) {
        console.error('error en el fetch', error)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <section className='load-file'>
        <form className='subir-archivos'>
          <h1>Subi una foto</h1>
          <input type='file' accept='image/*, audio/*, video/*, .pdf, .zip, .rar, .doc, .docx, .xls, xlsx' multiple onChange={fileValue} />
          <button onClick={loadFile}>Subir</button>
        </form>
      </section>
      <section className='grid-content'>
        {render.map(image => {
          return image.map((image, index) => {
            return (
              <div key={index} className='grid-item'>
                <img alt={`${image.name}`} className={`${image.nombre}`} src={`data:${image.tipo};base64,${image.archivo}`} />
              </div>
            )
          }
          )
        }
        )}
      </section>
    </>
  )
}

export default Files
