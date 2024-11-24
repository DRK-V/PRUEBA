'use client'

import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartLine,
  faBox,
  faAddressBook,
  faTicketAlt,
  faUserEdit,
  faSignOutAlt,
  faChevronRight,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div
      className={`bg-green-600 text-white flex flex-col h-screen transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-69' // Aquí puedes ajustar el tamaño según lo necesites
      }`}
    >
      {/* Logo y título */}
      <div className="flex items-center justify-center p-4">
        <img
          src="/images/descarga (1).png"
          alt="Logo"
          className="rounded-full w-12 h-12"
        />
        {!isCollapsed && <span className="text-white text-xl font-bold ml-4">Inventario</span>}
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-6">
          <li>
            <a
              href="/dashboard"
              className={`flex items-center p-2 hover:bg-green-700 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <FontAwesomeIcon icon={faChartLine} className="w-6 h-6" />
              {!isCollapsed && <span className="ml-4">Tablero</span>}
            </a>
          </li>
          <li>
            <a
              href="/articulos"
              className={`flex items-center p-2 hover:bg-green-700 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <FontAwesomeIcon icon={faBox} className="w-6 h-6" />
              {!isCollapsed && <span className="ml-4">Artículos</span>}
            </a>
          </li>
          <li>
            <a
              href="/contacto"
              className={`flex items-center p-2 hover:bg-green-700 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <FontAwesomeIcon icon={faAddressBook} className="w-6 h-6" />
              {!isCollapsed && <span className="ml-4">Contacto</span>}
            </a>
          </li>
          <li>
            <a
              href="/tickets"
              className={`flex items-center p-2 hover:bg-green-700 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <FontAwesomeIcon icon={faTicketAlt} className="w-6 h-6" />
              {!isCollapsed && <span className="ml-4">Tiquetes</span>}
            </a>
          </li>
          <li className="relative">
            <a
              href="/EditarPerfil"
              className={`flex items-center p-2 hover:bg-green-700 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <FontAwesomeIcon icon={faUserEdit} className="w-6 h-6" />
              {!isCollapsed && <span className="ml-4">Editar perfil</span>}
            </a>
            {/* Botón para colapsar/expandir */}
            <button
              onClick={toggleSidebar}
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-green-700 text-white p-1.5 rounded-l-md hover:bg-green-800 focus:outline-none transition-colors duration-200"
              aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              <FontAwesomeIcon
                icon={isCollapsed ? faChevronRight : faChevronLeft}
                className="w-3 h-3"
              />
            </button>
          </li>
        </ul>
      </nav>

      {/* Opción de salir */}
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className={`flex items-center p-2 hover:bg-green-700 w-full ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="w-6 h-6" />
          {!isCollapsed && <span className="ml-4">Salir</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
