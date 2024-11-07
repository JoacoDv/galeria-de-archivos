import { useState } from 'react'

function Files () {
  const [file, setFile] = useState()
  const fileValue = e => {
    setFile(e.target.files[0])
  }
  function loadFile (e) {
    const data = new FormData()
    data.append('file', file)
    fetch('http://localhost:5000/uploadfile', {
      method: 'POST',
      body: data
    })
      .then(response => response.json)
      .then(data => {
        console.log(data)
      })

    e.preventDefault()
  }

  return (
    <>
      <section className='load-file'>
        <form className='subir-archivos'>
          <h1>Subi una foto</h1>
          <input type='file' accept='image/*, audio/*, video/*, .pdf, .zip, .rar, .doc, .docx, .xls, xlsx' multiple onChange={fileValue} />
          <button onClick={loadFile}>Subir</button>
        </form>
      </section>
    </>
  )
}

export default Files
