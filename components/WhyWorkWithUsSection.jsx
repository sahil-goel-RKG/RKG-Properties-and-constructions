import { resolveSectionStyle } from '@/lib/resolveSectionClass'

const ITEMS = [
  {
    title: 'Local Expertise',
    description:
      'Deep knowledge of neighborhood trends, pricing, and inventory to guide smart decisions.',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
  },
  {
    title: 'Negotiation Power',
    description:
      'Proven strategy to secure the best price and terms for buyers and sellers.',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
        />
      </svg>
    ),
  },
  {
    title: 'End-to-End Service',
    description:
      'From staging and photography to financing and closing, we handle the details.',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
]

export default function WhyWorkWithUsSection() {
  return (
    <section className="py-8 sm:py-16 section-mid" style={resolveSectionStyle('section-mid')}>
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-3xl font-bold font-serif-display text-[#f5f5f5] mb-6 sm:mb-12 text-center">
          Why Work With Us
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className="why-work-card text-center p-5 sm:p-8 card-luxury rounded-xl transition"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a227]/35 bg-[#c9a227]/10 text-[#c9a227]">
                {item.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#f5f5f5] mb-2 sm:mb-3">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-[#a3a3a3]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
