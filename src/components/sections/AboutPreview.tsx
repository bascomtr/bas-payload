import Link from 'next/link'
import Image from 'next/image'
import { type Locale, getLocalePath } from '@/i18n/config'

interface AboutPreviewProps {
  locale: Locale
  dict: Record<string, Record<string, string>>
}

const features = [
  { text: 'Yerli Üretim' },
  { text: 'Anahtar Teslim Çözümler' },
  { text: 'Ar-Ge Merkezi' },
  { text: '7/24 Teknik Destek' },
]

export function AboutPreview({ locale, dict }: AboutPreviewProps) {
  return (
    <section className="section-lg">
      <div className="container">
        <div className="about-preview">
          {/* Image Side */}
          <div className="relative">
            <div className="about-image">
              <Image
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop"
                alt="BAS Endüstriyel Üretim Tesisi"
                fill
                className="object-cover"
              />
            </div>
            {/* Experience Badge */}
            <div 
              className="absolute bg-linear-to-br from-primary to-primary-dark text-white rounded-xl text-center shadow-xl"
              style={{ bottom: '-1.5rem', right: '2rem', padding: '1.5rem 2rem' }}
            >
              <span className="block text-4xl font-bold leading-none">25+</span>
              <span className="block text-sm opacity-90" style={{ marginTop: '0.25rem' }}>Yıllık Deneyim</span>
            </div>
          </div>

          {/* Content Side */}
          <div className="about-content">
            <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4">
              Hakkımızda
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
              Manyetik Separasyon Teknolojilerinde Türkiye&apos;nin Öncü Firması
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              BAS Endüstriyel olarak, 25 yılı aşkın deneyimimizle manyetik separasyon, cevher zenginleştirme 
              ve endüstriyel ayırma teknolojilerinde sektörün lider kuruluşuyuz. Ankara merkezli üretim 
              tesisimizde, dünya standartlarında ekipmanlar üretiyoruz.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Madencilik, geri dönüşüm, çimento, cam ve birçok endüstriyel sektörde, müşterilerimize 
              özelleştirilmiş çözümler sunarak, verimliliklerini artırmalarına yardımcı oluyoruz.
            </p>

            {/* Features Grid */}
            <div className="about-features">
              {features.map((feature, index) => (
                <div key={index} className="about-feature">
                  <svg className="about-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="about-feature-text">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href={getLocalePath(locale, '/hakkimizda')} className="btn btn-primary">
                Daha Fazla Bilgi
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link 
                href={getLocalePath(locale, '/iletisim')} 
                className="inline-flex items-center border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-all"
                style={{ gap: '0.5rem', padding: '0.75rem 1.5rem' }}
              >
                İletişime Geçin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
