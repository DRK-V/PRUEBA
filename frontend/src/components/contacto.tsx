import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Linkedin, Facebook, Instagram } from 'lucide-react';

const ContactView = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // Aquí implementarías la lógica de envío del formulario
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">Contáctenos</h1>
          <p className="text-center text-lg max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos si tienes alguna pregunta o necesitas asistencia.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Información de Contacto</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <MapPin className="text-green-600 w-6 h-6 mt-1" />
                  <div>
                    <h3 className="font-medium">Dirección</h3>
                    <p className="text-gray-600">
                      Calle Principal #123<br />
                      San José, Costa Rica<br />
                      10101
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="text-green-600 w-6 h-6 mt-1" />
                  <div>
                    <h3 className="font-medium">Teléfono</h3>
                    <p className="text-gray-600">
                      +506 2222-2222<br />
                      +506 8888-8888
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="text-green-600 w-6 h-6 mt-1" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">info@empresa.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="text-green-600 w-6 h-6 mt-1" />
                  <div>
                    <h3 className="font-medium">Horario de Atención</h3>
                    <p className="text-gray-600">
                      Lunes - Viernes: 8:00 AM - 5:00 PM<br />
                      Sábado: 8:00 AM - 12:00 PM<br />
                      Domingo: Cerrado
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Síguenos</h2>
              <div className="flex space-x-4">
                <a href="#" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Envíanos un Mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Enviar Mensaje</span>
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Nuestra Ubicación</h2>
          <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
            <img
              src="/api/placeholder/1200/400"
              alt="Mapa de ubicación"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactView;