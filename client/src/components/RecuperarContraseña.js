import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function RecuperarContraseña () {
  const [email, setMail] = useState()
  const navigate = useNavigate()
  function valueMail (e) {
    setMail(e.target.value)
  }
  function sendMail (e) {
    fetch('https://api-galeria-wbq3.onrender.com/password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ email })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        if (data.respuesta) {
          navigate('/contraseña/recuperacion')
        }
      })

    /* navigate('/contraseña/recuperacion') */
    e.preventDefault()
  }

  return (
    <div className='background'>
      <div className='login-form'>
        <h1>Recuperar contraseña</h1>
        <input required type='email' className='input-email-login' placeholder='Email' value={email} onChange={valueMail} />
        <button className='btn-login' onClick={sendMail}>Enviar email</button>
      </div>
    </div>
  )
}

export default RecuperarContraseña
