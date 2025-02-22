import { Link, useLocation } from 'react-router-dom'

function Validacion () {
  const location = useLocation()
  const token = location.search.split('=').slice(1).join('')
  console.log(token)

  fetch('https://api-galeria-wbq3.onrender.com/validacion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  })
    .catch(error => console.error(error))

  return (
    <div className='background'>
      <form className='login-form'>
        <h1>Tu usuario a sido validado</h1>
        <p>Puedes<Link to='/'> Iniciar sesión</Link></p>
      </form>
    </div>
  )
}

export default Validacion
