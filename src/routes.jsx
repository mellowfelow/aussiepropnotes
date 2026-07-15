import React from 'react'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import { BlogIndex, BlogPost } from './pages/Blog.jsx'
import { About, Contact, Wholesale, Faq, Cart, Order, Shipping, Refund, Privacy, Terms, ThankYou } from './pages/Static.jsx'
import { SITE, CATEGORIES, PRODUCTS, POSTS, FAQS } from './data/site.js'

const U = SITE.url
const TODAY = '2026-07-15'
const encEmail = (e) => e.replace('@', '&#64;')

const crumbs = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: U + '/' },
    ...items.map(([n, path], i) => ({ '@type': 'ListItem', position: i + 2, name: n, ...(path ? { item: U + path } : {}) }))]
})

const faqSchema = (list) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: list.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
})

const prices = PRODUCTS.map(p => p.price)
const storeSchema = {
  '@context': 'https://schema.org', '@type': ['Store', 'Organization'],
  name: SITE.brand, url: U + '/', logo: U + '/images/logo.svg', image: U + '/images/og-home.svg',
  description: 'Australian prop money supplier: camera-ready AUD prop notes, money stacks, custom printed notes and event money props. RBA-guideline compliant, dispatched from Sydney Australia-wide.',
  foundingDate: SITE.founded,
  foundingLocation: { '@type': 'Place', name: 'Sydney, Australia' },
  address: { '@type': 'PostalAddress', addressLocality: 'Sydney', addressRegion: 'NSW', addressCountry: 'AU' },
  areaServed: 'AU', numberOfItems: PRODUCTS.length,
  knowsAbout: ['prop money', 'Australian prop money', 'film props', 'movie prop money', 'photography props', 'event props', 'custom prop money', 'RBA reproduction guidelines'],
  priceRange: '$' + Math.min(...prices) + '-$' + Math.max(...prices) + ' AUD',
  sameAs: [], brand: { '@type': 'Brand', name: SITE.brand },
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: encEmail(SITE.email), areaServed: 'AU', availableLanguage: 'English' },
  makesOffer: { '@type': 'AggregateOffer', priceCurrency: 'AUD', lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: PRODUCTS.length }
}

const websiteSchema = {
  '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.brand, url: U + '/',
  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: U + '/shop/?q={search_term_string}' }, 'query-input': 'required name=search_term_string' }
}

export const ROUTES = [
  { path: '/', el: <Home />, title: 'Australian Prop Money for Film, TV & Events | Aussie Prop Notes',
    desc: 'Buy camera-ready Australian prop money — AUD prop notes, money stacks & custom prints. RBA-compliant, fast Sydney dispatch, free shipping over $500. Shop now.',
    schema: [storeSchema, websiteSchema, faqSchema(FAQS.slice(0, 4))] },

  { path: '/shop/', el: <Shop />, title: 'Buy Prop Money Australia — Full Range | Aussie Prop Notes',
    desc: 'Shop the full Australian prop money range: film & TV notes, money stacks, photography props, event props and custom prints. Min order $250 AUD, fast dispatch.',
    schema: [crumbs([['Shop', null]]), { '@context': 'https://schema.org', '@type': 'OfferCatalog', name: 'Aussie Prop Notes Catalog', url: U + '/shop/', numberOfItems: PRODUCTS.length }] },

  ...CATEGORIES.map(c => ({
    path: '/shop/' + c.slug + '/', el: <Shop />,
    title: (c.name + ' — Prop Money Australia | Aussie Prop Notes').slice(0, 60),
    desc: (c.desc + ' Minimum order $250 AUD, fast dispatch from Sydney.').slice(0, 158),
    schema: [crumbs([['Shop', '/shop/'], [c.name, null]])]
  })),

  ...PRODUCTS.map(p => {
    const c = CATEGORIES.find(x => x.slug === p.cat)
    return {
      path: '/product/' + p.slug + '/', el: <Product />,
      title: (p.name + ' | Aussie Prop Notes').slice(0, 60),
      desc: (p.short + ' ' + 'Buy Australian prop money with fast Sydney dispatch and free shipping over $500 AUD.').slice(0, 158),
      schema: [
        { '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: U + '/images/' + p.slug + '.webp',
          description: p.short, sku: 'APN-' + p.slug.toUpperCase().slice(0, 12), brand: { '@type': 'Brand', name: SITE.brand },
          category: c.name,
          offers: { '@type': 'Offer', url: U + '/product/' + p.slug + '/', priceCurrency: 'AUD', price: p.price,
            availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: SITE.brand } } },
        crumbs([['Shop', '/shop/'], [c.name, '/shop/' + c.slug + '/'], [p.name, null]])
      ]
    }
  }),

  { path: '/blog/', el: <BlogIndex />, title: 'Prop Money Guides & Resources Australia | Aussie Prop Notes',
    desc: 'Guides on buying and using prop money in Australia: legality under RBA rules, choosing camera-ready notes, and production best practice. Read the guides.',
    schema: [crumbs([['Blog', null]])] },

  ...POSTS.map(p => ({
    path: '/blog/' + p.slug + '/', el: <BlogPost />,
    title: p.title.slice(0, 60),
    desc: p.excerpt.slice(0, 158),
    schema: [
      { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.excerpt,
        datePublished: p.date, dateModified: TODAY, author: { '@type': 'Organization', name: SITE.brand },
        publisher: { '@type': 'Organization', name: SITE.brand, logo: { '@type': 'ImageObject', url: U + '/images/logo.svg' } },
        mainEntityOfPage: U + '/blog/' + p.slug + '/', image: U + '/images/og-home.svg' },
      crumbs([['Blog', '/blog/'], [p.title, null]])
    ]
  })),

  { path: '/about/', el: <About />, title: 'About Aussie Prop Notes — Australian Prop Money Supplier',
    desc: 'Sydney-founded in 2022, Aussie Prop Notes supplies camera-ready, RBA-compliant prop money to film productions, photographers and events across Australia.',
    schema: [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About Aussie Prop Notes', url: U + '/about/', mainEntity: storeSchema }, crumbs([['About', null]])] },

  { path: '/contact/', el: <Contact />, title: 'Contact Us | Aussie Prop Notes — Prop Money Australia',
    desc: 'Contact Aussie Prop Notes about prop money orders, custom prints or wholesale. Email, contact form or WhatsApp — we reply within one business day.',
    schema: [crumbs([['Contact', null]])] },

  { path: '/wholesale/', el: <Wholesale />, title: 'Prop Money Wholesale Australia — Trade Pricing | Aussie Prop',
    desc: 'Bulk prop money for film studios, event companies and trainers. Tiered trade discounts to 20%, priority Sydney dispatch. Request wholesale pricing today.',
    schema: [crumbs([['Wholesale', null]])] },

  { path: '/faq/', el: <Faq />, title: 'Prop Money FAQ Australia — Legality, Orders & Shipping',
    desc: 'Answers to the questions Australian prop money buyers ask most: is it legal, will it look real on camera, minimum orders, payment methods and shipping.',
    schema: [faqSchema(FAQS), crumbs([['FAQ', null]])] },

  { path: '/cart/', el: <Cart />, title: 'Your Cart | Aussie Prop Notes',
    desc: 'Review your prop money order: quantities, crypto discount, shipping threshold and total. Minimum order $250 AUD, free shipping over $500 AUD.',
    schema: [crumbs([['Cart', null]])] },

  { path: '/order/', el: <Order />, title: 'Place Your Order | Aussie Prop Notes — Prop Money Australia',
    desc: 'Order Australian prop money by form or WhatsApp. Pay by crypto for 10% off, bank transfer or PayID. Stock confirmed within one business day.',
    schema: [crumbs([['Cart', '/cart/'], ['Order', null]])] },

  { path: '/shipping/', el: <Shipping />, title: 'Shipping — Prop Money Delivery Australia | Aussie Prop Notes',
    desc: 'Prop money shipping across Australia: 1-day Sydney dispatch, free over $500 AUD, flat $20 under. Metro delivery 1-3 days, express options for shoots.',
    schema: [crumbs([['Shipping', null]])] },

  { path: '/refund/', el: <Refund />, title: 'Refund & Returns Policy | Aussie Prop Notes',
    desc: 'Our refund policy: replacements for damaged or incorrect prop money orders, 14-day change-of-mind returns on stock items, and custom print guarantees.',
    schema: [crumbs([['Refund Policy', null]])] },

  { path: '/privacy/', el: <Privacy />, title: 'Privacy Policy | Aussie Prop Notes',
    desc: 'How Aussie Prop Notes handles your data: what our order and contact forms collect, how it is used, retention, access requests and site security.',
    schema: [crumbs([['Privacy', null]])] },

  { path: '/terms/', el: <Terms />, title: 'Terms of Service | Aussie Prop Notes — Prop Money Australia',
    desc: 'Terms of service covering permitted prop money use, RBA compliance, orders, payment and liability. All notes are marked props — never legal tender.',
    schema: [crumbs([['Terms', null]])] },

  { path: '/thank-you-contact/', el: <ThankYou kind="contact" />, title: 'Message Received | Aussie Prop Notes',
    desc: 'Thanks for contacting Aussie Prop Notes — we reply to every message within one business day. Need a faster answer? Message us on WhatsApp any time.',
    schema: [crumbs([['Thank You', null]])], noindex: true },
  { path: '/thank-you-order/', el: <ThankYou kind="order" />, title: 'Order Received | Aussie Prop Notes',
    desc: 'Thanks for your prop money order — we confirm stock and send payment details within one business day. Crypto discount applied at invoicing.',
    schema: [crumbs([['Thank You', null]])], noindex: true },
  { path: '/thank-you-wholesale/', el: <ThankYou kind="wholesale" />, title: 'Wholesale Enquiry Received | Aussie Prop Notes',
    desc: 'Thanks for your wholesale enquiry — our trade team replies with tiered pricing and stock confirmation within one business day.',
    schema: [crumbs([['Thank You', null]])], noindex: true },
]
