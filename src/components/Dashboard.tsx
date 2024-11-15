import { useState } from 'react'
import { Package, FileText, BarChart2, Menu, X } from 'lucide-react'

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - siempre visible en desktop, toggle en móvil */}
      <aside className={`bg-white w-64 min-h-screen flex-shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden'} md:block`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors">
                <BarChart2 className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors">
                <FileText className="w-5 h-5" />
                <span>Reporte</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors">
                <Package className="w-5 h-5" />
                <span>Inventario</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <button 
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-lg text-gray-700 truncate">
            Bienvenido COLEGIO SAN FRANCISCO DE ASIS
          </h1>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <h2 className="text-2xl font-semibold text-gray-800">Tablero</h2>

          {/* Inventory Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Resumen de Inventario</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-3xl font-bold">0</div>
                <div className="text-sm text-gray-500">Artículos a Mano</div>
              </div>
              <div>
                <div className="text-gray-600">No Rastreado</div>
                <div className="text-sm text-gray-500">Ubicaciones</div>
              </div>
              <div>
                <div className="text-3xl font-bold">0.00</div>
                <div className="text-sm text-gray-500">Costo Artículo</div>
              </div>
              <div>
                <div className="text-gray-600">No Rastreado</div>
                <div className="text-sm text-gray-500">Precio Venta</div>
              </div>
            </div>
          </div>

          {/* Quick Transaction */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Transacción Rápida</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Recibo</span>
                <span className="text-xs text-gray-500">para las cosas entrantes</span>
              </button>
              <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                  <Package className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Tiquete</span>
                <span className="text-xs text-gray-500">para las cosas salientes</span>
              </button>
              <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Ajuste</span>
                <span className="text-xs text-gray-500">para cosas perdidas o creadas</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Actividad Reciente</h3>
              <span className="text-sm text-gray-500">Mes Hasta Hoy</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">TIQUETES</div>
                <div className="text-lg font-semibold">0</div>
                <div className="text-xs text-gray-500">Artículos con Ticket</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">RECIBOS</div>
                <div className="text-lg font-semibold">0</div>
                <div className="text-xs text-gray-500">Artículos Recibidos</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">AJUSTES</div>
                <div className="text-lg font-semibold">0</div>
                <div className="text-xs text-gray-500">Artículos Eliminados</div>
              </div>
              <div>
                <div className="text-lg font-semibold">0.00</div>
                <div className="text-xs text-gray-500">Aumento de Costo</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}