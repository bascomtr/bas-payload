'use client'

import { useState, type FormEvent } from 'react'
import { type Locale } from '@/i18n/config'

interface ContactFormProps {
  locale: Locale
  productSlug?: string
}

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  subject: string
  message: string
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: '',
}

export function ContactForm({ locale, productSlug }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    subject: productSlug ? `Ürün Talebi: ${productSlug}` : '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const labels = {
    tr: {
      name: 'Adınız Soyadınız',
      email: 'E-posta Adresiniz',
      phone: 'Telefon Numaranız',
      company: 'Şirket Adı',
      subject: 'Konu',
      message: 'Mesajınız',
      submit: 'Gönder',
      sending: 'Gönderiliyor...',
      success: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      required: 'Bu alan zorunludur',
      invalidEmail: 'Geçerli bir e-posta adresi girin',
    },
    en: {
      name: 'Your Name',
      email: 'Your Email',
      phone: 'Phone Number',
      company: 'Company Name',
      subject: 'Subject',
      message: 'Your Message',
      submit: 'Send Message',
      sending: 'Sending...',
      success: 'Your message has been sent successfully. We will get back to you soon.',
      error: 'An error occurred. Please try again later.',
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
    },
    es: {
      name: 'Su Nombre',
      email: 'Su Correo Electrónico',
      phone: 'Número de Teléfono',
      company: 'Nombre de la Empresa',
      subject: 'Asunto',
      message: 'Su Mensaje',
      submit: 'Enviar Mensaje',
      sending: 'Enviando...',
      success: 'Su mensaje ha sido enviado con éxito. Nos pondremos en contacto pronto.',
      error: 'Ocurrió un error. Por favor, inténtelo de nuevo más tarde.',
      required: 'Este campo es obligatorio',
      invalidEmail: 'Por favor, ingrese un correo electrónico válido',
    },
    ru: {
      name: 'Ваше Имя',
      email: 'Ваш Email',
      phone: 'Номер Телефона',
      company: 'Название Компании',
      subject: 'Тема',
      message: 'Ваше Сообщение',
      submit: 'Отправить',
      sending: 'Отправка...',
      success: 'Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.',
      error: 'Произошла ошибка. Пожалуйста, попробуйте позже.',
      required: 'Это поле обязательно',
      invalidEmail: 'Пожалуйста, введите действительный адрес электронной почты',
    },
  }

  const t = labels[locale] || labels.en

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      // Send form data to API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setStatus('success')
      setFormData(initialFormData)
    } catch {
      setStatus('error')
      setErrorMessage(t.error)
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg
          className="w-12 h-12 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-green-800">{t.success}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t.name} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t.email} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            {t.phone}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            {t.company}
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          {t.subject} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          {t.message} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full md:w-auto px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? t.sending : t.submit}
        </button>
      </div>
    </form>
  )
}
