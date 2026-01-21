import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // TODO: Implement actual email sending logic
    // Options:
    // 1. Send email via SMTP (using nodemailer or similar)
    // 2. Use a service like SendGrid, Mailgun, Resend, etc.
    // 3. Store in database and notify admin
    // 4. Send to a webhook (Slack, Discord, etc.)

    // For now, just log and return success
    console.log('Contact form submission:', {
      name: body.name,
      email: body.email,
      phone: body.phone || '-',
      company: body.company || '-',
      subject: body.subject,
      message: body.message,
      timestamp: new Date().toISOString(),
    })

    // Example: Send notification email (uncomment when ready)
    // await sendNotificationEmail({
    //   to: process.env.CONTACT_EMAIL || 'info@bas.com.tr',
    //   subject: `Yeni İletişim Formu: ${body.subject}`,
    //   html: `
    //     <h2>Yeni İletişim Formu Mesajı</h2>
    //     <p><strong>Ad:</strong> ${body.name}</p>
    //     <p><strong>E-posta:</strong> ${body.email}</p>
    //     <p><strong>Telefon:</strong> ${body.phone || '-'}</p>
    //     <p><strong>Şirket:</strong> ${body.company || '-'}</p>
    //     <p><strong>Konu:</strong> ${body.subject}</p>
    //     <p><strong>Mesaj:</strong></p>
    //     <p>${body.message}</p>
    //   `,
    // })

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
