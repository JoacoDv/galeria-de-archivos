import { Link } from 'react-router-dom'
import { useState } from 'react'

function Registro () {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [checkPassword, setCheckPassword] = useState('')

  const usernameValue = e => {
    setUsername(e.target.value)
  }
  const emailValue = e => {
    setEmail(e.target.value)
  }
  const passwordValue = e => {
    setPassword(e.target.value)
  }
  const checkPaswordValue = e => {
    setCheckPassword(e.target.value)
  }

  function registrar (e) {
    e.preventDefault()

    if (password === checkPassword) {
      fetch('http://localhost:5000/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Usuario creado', data)
        })
        /* .catch((error) => console.error('error al registrar el usuario')) */
    } else { alert('Las contraseñas tienen que coincidir') }
  }

  return (
    <>
      <div className='background'>
        <form className='login-form'>
          <h1>Registrarte</h1>
          <input type='text' placeholder='Usuario' value={username} onChange={usernameValue} />
          <input type='email' className='input-email-login' placeholder='Email' value={email} onChange={emailValue} />
          <input type='password' className='input-password-login' placeholder='Contraseña' value={password} onChange={passwordValue} />
          <input type='password' className='input-password-login' placeholder='Verifique su contraseña' value={checkPassword} onChange={checkPaswordValue} />
          <button className='btn-login' onClick={registrar}>Registrarte</button>
          <p>¿Ya tenes tu cuenta? <Link to='/'>Inicia sesión</Link></p>
        </form>
      </div>
    </>
  )
}

export default Registro
