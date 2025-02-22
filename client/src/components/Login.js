import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login () {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  function emailValue (e) {
    setEmail(e.target.value)
  }
  function passwordValue (e) {
    setPassword(e.target.value)
  }
  function log (e) {
    fetch('https://api-galeria-wbq3.onrender.com/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'

      },
      body: JSON.stringify({ email, password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          navigate(`/home?token=${data.token}`)
        }
      })

    e.preventDefault()
  }
  return (
    <>
      <div className='background'>
        <form className='login-form'>
          <h1>Inicia Sesión</h1>
          <input type='email' className='input-email-login' placeholder='Email' value={email} onChange={emailValue} />
          <input type='password' className='input-password-login' placeholder='Contraseña' value={password} onChange={passwordValue} />
          <button className='btn-login' onClick={log}>Inicia sesión</button>
          <Link to='/contraseña'>¿Olvidaste la contraseña?</Link>
          <p>¿Todavia no te has registrado? <Link to='/registro'>Registrate ahora</Link></p>
        </form>
      </div>
    </>
  )
}

export default Login
