import './App.css'
import Login from './components/Login'
import Registro from './components/Registro'
import Galeria from './components/Galeria'
import RecuperarContraseña from './components/RecuperarContraseña'
import MailEnviado from './components/MailEnviado'
import Validacion from './components/Validacion'
import CambiarContraseña from './components/CambiarContraseña'
import Files from './components/Files'
import { Routes, Route } from 'react-router-dom'

function App () {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/registro' element={<Registro />} />
        <Route path='/validacion' element={<Validacion />} />
        <Route path='/contraseña' element={<RecuperarContraseña />} />
        <Route path='/contraseña/recuperacion' element={<MailEnviado />} />
        <Route path='/contraseña/modificar' element={<CambiarContraseña />} />
        <Route path='/home' element={<Galeria />}>
          <Route path='' element={<Files />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
