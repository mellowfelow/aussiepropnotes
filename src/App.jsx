import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ROUTES } from './routes.jsx'
import { AnnouncementBar, Nav, Footer } from './components/ui.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import { BlogPost } from './pages/Blog.jsx'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// Param-based pages are registered ONCE with :params so useParams works;
// concrete entries in ROUTES are used only by the prerenderer for meta.
const isParamPage = (p) =>
  (p.startsWith('/shop/') && p !== '/shop/') ||
  p.startsWith('/product/') ||
  (p.startsWith('/blog/') && p !== '/blog/')

export default function App() {
  return (
    <>
      <ScrollTop />
      <AnnouncementBar />
      <Nav />
      <Routes>
        {ROUTES.filter(r => !isParamPage(r.path)).map(r => <Route key={r.path} path={r.path} element={r.el} />)}
        <Route path="/shop/:cat/" element={<Shop />} />
        <Route path="/product/:slug/" element={<Product />} />
        <Route path="/blog/:slug/" element={<BlogPost />} />
      </Routes>
      <Footer />
    </>
  )
}
