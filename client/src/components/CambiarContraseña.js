import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function CambiarContraseña () {
  const navigate = useNavigate()
  const location = useLocation()
  const token = location.search.split('=').slice(1).join('')
  const [password, setPassword] = useState('')
  const [checkPassword, setCheckPassword] = useState('')
  const passwordValue = e => {
    setPassword(e.target.value)
  }
  const checkPasswordValue = e => {
    setCheckPassword(e.target.value)
  }
  function changePassword (e) {
    if (token && password === checkPassword) {
      fetch('http://localhost:5000/password/change', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'

        },
        body: JSON.stringify({ password, token })
      })
        .then(response => response.json())
        .then(data => {
          if (data.respuesta) {
            navigate('/')
          }
        })
    }
  }
  return (
    <div className='background'>
      <div className='login-form'>
        <h1>Cambia tu contraseña</h1>
        <input required type='password' className='input-email-login' placeholder='Nueva contraseña' value={password} onChange={passwordValue} />
        <input required type='password' className='input-email-login' placeholder='Confirmar contraseña' value={checkPassword} onChange={checkPasswordValue} />
        <button className='btn-login' onClick={changePassword}>Cambiar contraseña</button>
      </div>
    </div>
  )
}

export default CambiarContraseña
