import { useEffect, useMemo, useState } from 'react'
import './App.css'

const initialProducts = [
  {
    id: 1,
    name: 'Smart Speaker Mini',
    category: 'Eletrônicos',
    price: 239,
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
    description: 'Som compacto para animar a casa, o trabalho ou uma viagem.',
    stock: 18,
    featured: true,
  },
  {
    id: 2,
    name: 'Lâmpada Glow',
    category: 'Casa',
    price: 129,
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    description: 'Luz ajustável para deixar cada ambiente no clima certo.',
    stock: 11,
    featured: true,
  },
  {
    id: 3,
    name: 'Kit Skincare Seed',
    category: 'Beleza',
    price: 169,
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    description: 'Cuidados para sua rotina de skincare, reunidos em um só kit.',
    stock: 24,
    featured: true,
  },
  {
    id: 4,
    name: 'Mochila Urban',
    category: 'Acessórios',
    price: 199,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    description: 'Mochila para levar os itens do dia a dia, com espaço para notebook.',
    stock: 14,
    featured: false,
  },
  {
    id: 5,
    name: 'Air Fryer Compact',
    category: 'Casa',
    price: 399,
    image:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80',
    description: 'Mais praticidade na cozinha para preparar seus pratos favoritos.',
    stock: 7,
    featured: false,
  },
  {
    id: 6,
    name: 'Cesta de Presentes',
    category: 'Presentes',
    price: 149,
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    description: 'Uma seleção de presentes pronta para surpreender.',
    stock: 22,
    featured: true,
  },
]

const refreshedDescriptions = {
  1: ['Caixa de som compacta com som estéreo, controle por voz e bateria.', 'Som compacto para animar a casa, o trabalho ou uma viagem.'],
  2: ['Luz ajustável para ambiente com estética minimalista e eficiência.', 'Luz ajustável para deixar cada ambiente no clima certo.'],
  3: ['Kit para rotina de cuidado com ativos hidratantes e suaves.', 'Cuidados para sua rotina de skincare, reunidos em um só kit.'],
  4: ['Mochila resistente com compartimento para laptop e prateleiras.', 'Mochila para levar os itens do dia a dia, com espaço para notebook.'],
  5: ['Fritadeira sem óleo para preparo rápido e praticidade.', 'Mais praticidade na cozinha para preparar seus pratos favoritos.'],
  6: ['Combinação com itens de bem-estar e decoração de mesa.', 'Uma seleção de presentes pronta para surpreender.'],
}

const defaultTheme = {
  name: 'Modern',
  primary: '#1d4ed8',
  secondary: '#14b8a6',
  accent: '#f59e0b',
  background: '#eef6ff',
  surface: '#ffffff',
  text: '#102030',
  muted: '#64748b',
}

const STORAGE_KEYS = {
  products: 'zoo-variedades-products',
  cart: 'zoo-variedades-cart',
  theme: 'zoo-variedades-theme',
  coupon: 'zoo-variedades-coupon',
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function getBrandMonogram(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'LO'
}

const whatsappNumber = '5581989769880'
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'zoo2026'
const wallpaperStorageKey = 'zoo-variedades-wallpaper'
const companyStorageKey = 'zoo-variedades-company'
const brandImageStorageKey = 'zoo-variedades-brand-image'
const socialStorageKey = 'zoo-variedades-social-links'
const couponsStorageKey = 'zoo-variedades-coupons'
const defaultCoupons = [
  { code: 'SAVE10', discount: 10, active: true },
  { code: 'WELCOME15', discount: 15, active: true },
]
const socialNetworks = [
  { key: 'instagram', label: 'Instagram', domains: ['instagram.com'] },
  { key: 'facebook', label: 'Facebook', domains: ['facebook.com'] },
  { key: 'tiktok', label: 'TikTok', domains: ['tiktok.com'] },
  { key: 'youtube', label: 'YouTube', domains: ['youtube.com', 'youtu.be'] },
]

function readSocialLinks(storageKey) {
  let saved
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    return {}
  }
  return socialNetworks.reduce((links, network) => {
    const value = saved[network.key]
    if (typeof value !== 'string' || !value.trim()) return links
    try {
      const url = new URL(value)
      const host = url.hostname.toLowerCase()
      if (url.protocol === 'https:' && network.domains.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
        links[network.key] = url.href
      }
    } catch {
      return links
    }
    return links
  }, {})
}

function getProductImages(product) {
  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : [product.image]
  return images.map((image) => safeUploadedImage(image) || safeImageUrl(image)).filter(Boolean)
}

function normalizeProducts(products) {
  return products.map((product) => {
    const images = getProductImages(product)
    const refreshedDescription = refreshedDescriptions[product.id]
    const description = refreshedDescription && product.description === refreshedDescription[0]
      ? refreshedDescription[1]
      : product.description
    return { ...product, description, image: images[0] || '', images }
  })
}

function readCoupons() {
  try {
    const saved = localStorage.getItem(couponsStorageKey)
    if (!saved) return defaultCoupons
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return defaultCoupons
    return parsed.filter((coupon) =>
      typeof coupon?.code === 'string' &&
      /^[A-Z0-9_-]{3,20}$/.test(coupon.code) &&
      Number.isFinite(coupon.discount) &&
      coupon.discount >= 1 &&
      coupon.discount <= 100 &&
      typeof coupon.active === 'boolean',
    )
  } catch {
    return defaultCoupons
  }
}

function optimizeBrandImage(file, maxDimension = 512) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return Promise.reject(new Error('Escolha uma imagem JPG, PNG ou WebP.'))
  }
  if (file.size > 10 * 1024 * 1024) {
    return Promise.reject(new Error('A imagem deve ter no máximo 10 MB.'))
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      if (image.naturalWidth * image.naturalHeight > 40000000) {
        reject(new Error('A resolução da imagem é muito alta. Escolha uma imagem menor.'))
        return
      }
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.naturalWidth * scale)
      canvas.height = Math.round(image.naturalHeight * scale)
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Não foi possível processar essa imagem.'))
        return
      }
      try {
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        const optimizedImage = canvas.toDataURL('image/webp', 0.78)
        if (optimizedImage.length > 1500000) {
          reject(new Error('A imagem otimizada ficou muito grande. Escolha um arquivo menor.'))
          return
        }
        resolve(optimizedImage)
      } catch {
        reject(new Error('Não foi possível processar essa imagem.'))
      }
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Não foi possível abrir essa imagem.'))
    }
    image.src = objectUrl
  })
}

function safeImageUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

function safeUploadedImage(value) {
  return /^data:image\/webp;base64,[A-Za-z0-9+/]+=*$/.test(value) ? value : ''
}

function createWhatsAppUrl(product) {
  const message = [
    'Olá! Gostaria de finalizar a compra deste item:',
    `• Produto: ${product.name}`,
    `• Valor: ${currency.format(product.price)}`,
    '• Opções selecionadas: Não se aplica',
    '',
    'Por favor, me informe os próximos passos para o pagamento e entrega!',
  ].join('\n')
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

function App() {
  const [loadingPhase, setLoadingPhase] = useState(() => (
    window.location.pathname.replace(/\/+$/, '') === '/admin' ? 'hidden' : 'loading'
  ))
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.products)
    return normalizeProducts(saved ? JSON.parse(saved) : initialProducts)
  })
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.cart)
    return saved ? JSON.parse(saved) : []
  })
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.theme)
    return saved ? JSON.parse(saved) : defaultTheme
  })
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('zoo-variedades-dark-mode') === 'true')
  const [wallpaper, setWallpaper] = useState(() => {
    const saved = localStorage.getItem(wallpaperStorageKey) || ''
    return safeImageUrl(saved) || safeUploadedImage(saved)
  })
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [productMessage, setProductMessage] = useState('')
  const [identityMessage, setIdentityMessage] = useState('')
  const [company, setCompany] = useState(() => localStorage.getItem(companyStorageKey) || 'Variedades')
  const [companyInput, setCompanyInput] = useState(() => localStorage.getItem(companyStorageKey) || 'Variedades')
  const [socialLinks, setSocialLinks] = useState(() => readSocialLinks(socialStorageKey))
  const [socialDraft, setSocialDraft] = useState(() => readSocialLinks(socialStorageKey))
  const [socialMessage, setSocialMessage] = useState('')
  const [coupons, setCoupons] = useState(readCoupons)
  const [couponMessage, setCouponMessage] = useState('')
  const [couponForm, setCouponForm] = useState({ code: '', discount: '' })
  const [brandImage, setBrandImage] = useState(() => localStorage.getItem(brandImageStorageKey) || '')
  const [productImages, setProductImages] = useState([])
  const [gallerySelection, setGallerySelection] = useState({})
  const [shoppingScreen, setShoppingScreen] = useState('catalog')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [imageUploadMessage, setImageUploadMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [couponInput, setCouponInput] = useState('')
  const [activeCoupon, setActiveCoupon] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.coupon)
    return saved && coupons.some((coupon) => coupon.code === saved && coupon.active) ? saved : ''
  })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [sort, setSort] = useState('relevancia')

  useEffect(() => {
    if (loadingPhase !== 'loading') return undefined
    const loadingDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 1050
    const timer = window.setTimeout(() => setLoadingPhase('leaving'), loadingDuration)
    return () => window.clearTimeout(timer)
  }, [loadingPhase])

  useEffect(() => {
    if (loadingPhase !== 'leaving') return undefined
    const timer = window.setTimeout(() => setLoadingPhase('hidden'), 320)
    return () => window.clearTimeout(timer)
  }, [loadingPhase])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme))
  }, [theme])

  useEffect(() => {
    localStorage.setItem('zoo-variedades-dark-mode', String(darkMode))
  }, [darkMode])

  const isAdminRoute = window.location.pathname.replace(/\/+$/, '') === '/admin'
  const activeTheme = darkMode
    ? {
        ...theme,
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb',
        muted: '#cbd5e1',
      }
    : theme
  const shellStyle = {
    '--primary': activeTheme.primary,
    '--secondary': activeTheme.secondary,
    '--accent': activeTheme.accent,
    '--background': activeTheme.background,
    '--surface': activeTheme.surface,
    '--text': activeTheme.text,
    '--muted': activeTheme.muted,
    '--wallpaper': wallpaper ? `url("${wallpaper}")` : 'none',
    '--page-overlay': wallpaper
      ? darkMode
        ? 'rgba(17, 24, 39, 0.74)'
        : 'rgba(238, 246, 255, 0.68)'
      : 'transparent',
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.coupon, activeCoupon)
  }, [activeCoupon])

  const categories = useMemo(
    () => ['Todas', ...new Set(products.map((product) => product.category))],
    [products],
  )

  const filteredProducts = useMemo(() => {
    const list = products.filter((product) => {
      const matchesSearch = `${product.name} ${product.description}`
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesCategory = category === 'Todas' || product.category === category
      return matchesSearch && matchesCategory
    })

    if (sort === 'menor') return [...list].sort((a, b) => a.price - b.price)
    if (sort === 'maior') return [...list].sort((a, b) => b.price - a.price)
    return list
  }, [products, search, category, sort])

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id)
    if (!product) return sum
    return sum + product.price * item.quantity
  }, 0)

  const selectedCoupon = coupons.find((coupon) => coupon.code === activeCoupon && coupon.active)
  const discount = selectedCoupon ? subtotal * (selectedCoupon.discount / 100) : 0
  const total = Math.max(0, subtotal - discount)

  function addToCart(productId) {
    setCart((current) => {
      const existing = current.find((item) => item.id === productId)
      if (existing) {
        return current.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { id: productId, quantity: 1 }]
    })
  }

  function openWhatsApp(product) {
    window.open(createWhatsAppUrl(product), '_blank', 'noopener,noreferrer')
  }

  function showProduct(product) {
    setSelectedProductId(product.id)
    setShoppingScreen('product')
  }

  function removeWallpaper() {
    try {
      localStorage.removeItem(wallpaperStorageKey)
      setWallpaper('')
      setImageUploadMessage('')
      setProductMessage('Imagem de fundo removida.')
    } catch {
      setImageUploadMessage('Não foi possível remover a imagem de fundo.')
    }
  }

  async function handleProductImageUpload(event) {
    const input = event.currentTarget
    const files = Array.from(input.files || [])
    if (!files.length) return
    try {
      const availableSlots = Math.max(0, 5 - productImages.length)
      if (availableSlots === 0) {
        setImageUploadMessage('Cada produto pode ter até 5 fotos. Remova uma foto antes de adicionar outras.')
        return
      }
      const images = await Promise.all(files.slice(0, availableSlots).map((file) => optimizeBrandImage(file, 1200)))
      setProductImages((current) => [...current, ...images])
      setImageUploadMessage(files.length > availableSlots
        ? `${images.length} foto(s) carregada(s). O limite é de 5 por produto.`
        : `${images.length} foto(s) carregada(s).`)
    } catch (error) {
      setImageUploadMessage(error instanceof Error ? error.message : 'Não foi possível carregar a foto do produto.')
    } finally {
      input.value = ''
    }
  }

  async function handleWallpaperUpload(event) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return
    try {
      const image = await optimizeBrandImage(file, 1600)
      localStorage.setItem(wallpaperStorageKey, image)
      setWallpaper(image)
      setImageUploadMessage('Imagem de fundo carregada e aplicada.')
    } catch (error) {
      setImageUploadMessage(error instanceof Error ? error.message : 'Não foi possível carregar a imagem de fundo.')
    } finally {
      input.value = ''
    }
  }

  function saveStoreIdentity() {
    const name = companyInput.trim()
    if (!name) {
      setIdentityMessage('Informe o nome da loja.')
      return
    }
    try {
      localStorage.setItem(companyStorageKey, name)
      setCompany(name)
      setIdentityMessage('Identidade da loja salva.')
    } catch {
      setIdentityMessage('Não foi possível salvar. Libere espaço no armazenamento do navegador e tente novamente.')
    }
  }

  async function handleBrandImageUpload(event) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return
    try {
      const image = await optimizeBrandImage(file)
      localStorage.setItem(brandImageStorageKey, image)
      setBrandImage(image)
      setIdentityMessage('Foto da loja atualizada.')
    } catch (error) {
      setIdentityMessage(error instanceof Error ? error.message : 'Não foi possível salvar a foto da loja.')
    } finally {
      input.value = ''
    }
  }

  function removeBrandImage() {
    try {
      localStorage.removeItem(brandImageStorageKey)
      setBrandImage('')
      setIdentityMessage('Foto da loja removida.')
    } catch {
      setIdentityMessage('Não foi possível remover a foto da loja.')
    }
  }

  function handleAdminLogin(event) {
    event.preventDefault()
    const submittedPassword = new FormData(event.currentTarget).get('password')
    if (submittedPassword !== adminPassword) {
      setAdminError('Senha incorreta.')
      return
    }
    setAdminAuthenticated(true)
    setAdminError('')
  }

  function handleAdminLogout() {
    setAdminAuthenticated(false)
  }

  function changeQty(productId, delta) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function applyCoupon() {
    const normalized = couponInput.trim().toUpperCase()
    const coupon = coupons.find((entry) => entry.code === normalized && entry.active)
    if (!coupon) {
      setActiveCoupon('')
      setCouponMessage('Cupom inválido ou indisponível.')
      return
    }
    setActiveCoupon(normalized)
    setCouponInput(normalized)
    setCouponMessage(`Cupom aplicado: ${coupon.discount}% de desconto.`)
  }

  function resetCoupon() {
    setActiveCoupon('')
    setCouponInput('')
    setCouponMessage('')
  }

  function saveSocialLinks() {
    const nextLinks = {}
    for (const network of socialNetworks) {
      const value = socialDraft[network.key]?.trim()
      if (!value) continue
      let url
      try {
        url = new URL(value)
      } catch {
        setSocialMessage(`Informe um link válido para ${network.label}.`)
        return
      }
      const host = url.hostname.toLowerCase()
      if (url.protocol !== 'https:' || !network.domains.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
        setSocialMessage(`Use um link HTTPS válido do ${network.label}.`)
        return
      }
      nextLinks[network.key] = url.href
    }
    try {
      localStorage.setItem(socialStorageKey, JSON.stringify(nextLinks))
      setSocialLinks(nextLinks)
      setSocialMessage('Redes sociais salvas.')
    } catch {
      setSocialMessage('Não foi possível salvar. Libere espaço no armazenamento do navegador e tente novamente.')
    }
  }

  function saveCoupon(event) {
    event.preventDefault()
    const code = couponForm.code.trim().toUpperCase()
    const discountValue = Number(couponForm.discount)
    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
      setCouponMessage('Use um código de 3 a 20 caracteres: letras, números, hífen ou sublinhado.')
      return
    }
    if (!Number.isFinite(discountValue) || discountValue < 1 || discountValue > 100) {
      setCouponMessage('O desconto deve estar entre 1% e 100%.')
      return
    }
    if (coupons.some((coupon) => coupon.code === code)) {
      setCouponMessage('Já existe um cupom com esse código.')
      return
    }
    const updatedCoupons = [...coupons, { code, discount: discountValue, active: true }]
    try {
      localStorage.setItem(couponsStorageKey, JSON.stringify(updatedCoupons))
      setCoupons(updatedCoupons)
      setCouponForm({ code: '', discount: '' })
      setCouponMessage(`Cupom ${code} criado e disponível para os clientes.`)
    } catch {
      setCouponMessage('Não foi possível salvar o cupom no navegador.')
    }
  }

  function updateCouponStatus(code, active) {
    const updatedCoupons = coupons.map((coupon) =>
      coupon.code === code ? { ...coupon, active } : coupon,
    )
    try {
      localStorage.setItem(couponsStorageKey, JSON.stringify(updatedCoupons))
      setCoupons(updatedCoupons)
      if (!active && activeCoupon === code) resetCoupon()
      setCouponMessage(`Cupom ${code} ${active ? 'ativado' : 'desativado'}.`)
    } catch {
      setCouponMessage('Não foi possível atualizar o cupom.')
    }
  }

  function deleteCoupon(code) {
    const updatedCoupons = coupons.filter((coupon) => coupon.code !== code)
    try {
      localStorage.setItem(couponsStorageKey, JSON.stringify(updatedCoupons))
      setCoupons(updatedCoupons)
      if (activeCoupon === code) resetCoupon()
      setCouponMessage(`Cupom ${code} removido.`)
    } catch {
      setCouponMessage('Não foi possível remover o cupom.')
    }
  }

  function handleCheckout() {
    if (!cart.length) return
    alert(`Pedido demonstrativo confirmado. Total: ${currency.format(total)}.`)
    setCart([])
    setActiveCoupon('')
    setCouponInput('')
  }

  function submitProduct(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const price = Number(form.get('price'))
    const images = productImages.map((image) => safeUploadedImage(image) || safeImageUrl(image)).filter(Boolean)
    if (!String(form.get('name') || '').trim() || !String(form.get('category') || '').trim() || !String(form.get('description') || '').trim() || !Number.isFinite(price) || price <= 0 || !images.length) {
      setProductMessage('Preencha os dados do produto e envie uma foto pelo computador.')
      return
    }
    const product = {
      id: editingId ?? Date.now(),
      name: String(form.get('name')).trim(),
      category: String(form.get('category')).trim(),
      price,
      image: images[0],
      images,
      description: String(form.get('description')).trim(),
      stock: Math.max(0, Number(form.get('stock')) || 0),
      featured: false,
    }

    const updatedProducts = editingId
      ? products.map((entry) => entry.id === editingId ? product : entry)
      : [product, ...products]
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(updatedProducts))
    } catch {
      setImageUploadMessage('Não foi possível salvar. Remova algumas imagens ou use arquivos menores para liberar espaço no navegador.')
      return
    }
    setProducts(updatedProducts)
    event.currentTarget.reset()
    setProductImages([])
    setEditingId(null)
    setProductMessage(editingId ? 'Produto atualizado.' : 'Produto adicionado.')
  }

  function editProduct(product) {
    setEditingId(product.id)
    const form = document.querySelector('.admin-product-form')
    if (!form) return
    form.elements.name.value = product.name
    form.elements.category.value = product.category
    form.elements.price.value = product.price
    setProductImages(getProductImages(product))
    form.elements.description.value = product.description
    form.elements.stock.value = product.stock
  }

  function deleteProduct(productId) {
    const updatedProducts = products.filter((product) => product.id !== productId)
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(updatedProducts))
    } catch {
      setImageUploadMessage('Não foi possível salvar. Remova algumas imagens ou use arquivos menores para liberar espaço no navegador.')
      return
    }
    setProducts(updatedProducts)
    setCart((current) => current.filter((item) => item.id !== productId))
    setProductMessage('Produto removido.')
  }

  function applyThemePreset(name) {
    const presets = {
      moderno: {
        name: 'moderno',
        primary: '#1d4ed8',
        secondary: '#14b8a6',
        accent: '#f59e0b',
        background: '#eef6ff',
        surface: '#ffffff',
        text: '#102030',
        muted: '#64748b',
      },
      vibrante: {
        name: 'vibrante',
        primary: '#7c3aed',
        secondary: '#f43f5e',
        accent: '#facc15',
        background: '#fdf2f8',
        surface: '#ffffff',
        text: '#1f2937',
        muted: '#4b5563',
      },
      escuro: {
        name: 'escuro',
        primary: '#0f172a',
        secondary: '#22c55e',
        accent: '#fbbf24',
        background: '#0b1120',
        surface: '#111827',
        text: '#f8fafc',
        muted: '#94a3b8',
      },
    }

    setTheme(presets[name])
  }

  if (isAdminRoute) {
    return (
      <div className={`market-shell admin-shell${darkMode ? ' dark-mode' : ''}`} style={shellStyle}>
        <main className="admin-page">
          <a className="admin-back-link" href="/">← Voltar à loja</a>
          {!adminAuthenticated ? (
            <section className="admin-login-card">
              <p className="eyebrow">Área restrita</p>
              <h1>Acesso administrativo</h1>
              <p>Senha demo: <strong>zoo2026</strong>. Se configurou outra senha em <code>.env.local</code>, use a senha personalizada.</p>
              <form className="product-form" onSubmit={handleAdminLogin}>
                <label htmlFor="admin-password">Senha</label>
                <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
                <button className="primary-btn full" type="submit">Entrar</button>
                {adminError && <p className="form-message" role="alert">{adminError}</p>}
              </form>
            </section>
          ) : (
            <>
              <header className="admin-heading">
                <div>
                  <p className="eyebrow">Área restrita · demonstração</p>
                  <h1>Gerenciar catálogo</h1>
                </div>
                <button type="button" className="secondary-btn" onClick={handleAdminLogout}>Sair</button>
              </header>
              <section className="admin-content">
                <section className="panel-box store-identity-panel">
                  <h2>Identidade da loja</h2>
                  <label>Nome da loja<input value={companyInput} onChange={(event) => setCompanyInput(event.target.value)} maxLength={60} /></label>
                  <div className="brand-identity-preview">
                    {brandImage ? <img src={brandImage} alt="Prévia da foto da loja" /> : <span>Z</span>}
                    <label>Enviar foto da loja
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleBrandImageUpload} />
                    </label>
                  </div>
                  <div className="theme-actions">
                    <button className="primary-btn small" type="button" onClick={saveStoreIdentity}>Salvar identidade</button>
                    {brandImage && <button className="secondary-btn small" type="button" onClick={removeBrandImage}>Remover foto</button>}
                  </div>
                  <p className="form-hint">JPG, PNG ou WebP · até 10 MB. A imagem é otimizada e salva neste navegador.</p>
                  {identityMessage && <p className="form-message" role="status">{identityMessage}</p>}
                </section>
                <section className="panel-box">
                  <h2>Cupons de desconto</h2>
                  <form className="product-form coupon-admin-form" onSubmit={saveCoupon}>
                    <label htmlFor="new-coupon-code">Código do cupom
                      <input id="new-coupon-code" value={couponForm.code} onChange={(event) => setCouponForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} maxLength={20} autoCapitalize="characters" required />
                    </label>
                    <label htmlFor="new-coupon-discount">Desconto (%)
                      <input id="new-coupon-discount" type="number" min="1" max="100" step="1" value={couponForm.discount} onChange={(event) => setCouponForm((current) => ({ ...current, discount: event.target.value }))} required />
                    </label>
                    <button className="primary-btn full" type="submit">Criar cupom</button>
                  </form>
                  <ul className="coupon-admin-list">
                    {coupons.map((coupon) => (
                      <li key={coupon.code}>
                        <div><strong>{coupon.code}</strong><span>{coupon.discount}% de desconto · {coupon.active ? 'Ativo' : 'Pausado'}</span></div>
                        <div className="coupon-admin-actions">
                          <button type="button" className="secondary-btn small" onClick={() => updateCouponStatus(coupon.code, !coupon.active)}>{coupon.active ? 'Pausar' : 'Ativar'}</button>
                          <button type="button" className="secondary-btn small danger" onClick={() => deleteCoupon(coupon.code)}>Excluir</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {couponMessage && <p className="form-message" role="status">{couponMessage}</p>}
                </section>
                <section className="panel-box social-admin-panel">
                  <h2>Redes sociais</h2>
                  <p className="form-hint">Adicione os links HTTPS dos perfis da loja. Eles aparecem no rodapé da vitrine.</p>
                  <div className="product-form">
                    {socialNetworks.map((network) => (
                      <label key={network.key} htmlFor={`social-${network.key}`}>{network.label}
                        <input id={`social-${network.key}`} type="url" inputMode="url" placeholder={`https://${network.domains[0]}/...`} value={socialDraft[network.key] || ''} onChange={(event) => setSocialDraft((current) => ({ ...current, [network.key]: event.target.value }))} />
                      </label>
                    ))}
                    <button type="button" className="primary-btn full" onClick={saveSocialLinks}>Salvar redes sociais</button>
                  </div>
                  {socialMessage && <p className="form-message" role="status">{socialMessage}</p>}
                </section>
                <div className="panel-box">
                  <h2>{editingId ? 'Editar produto' : 'Adicionar produto'}</h2>
                  <form className="product-form admin-product-form" onSubmit={submitProduct}>
                    <label>Nome<input name="name" required /></label>
                    <label>Categoria<input name="category" required /></label>
                    <label>Preço<input name="price" type="number" min="0.01" step="0.01" required /></label>
                    <label>Fotos do produto (até 5; selecione várias de uma vez)<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleProductImageUpload} /></label>
                    {productImages.length > 0 && <div className="admin-image-previews">{productImages.map((image, index) => (
                      <div key={`${index}-${image.slice(-24)}`}>
                        <img className="image-upload-preview" src={image} alt={`Prévia ${index + 1} da foto do produto`} />
                        <button type="button" className="secondary-btn small danger" onClick={() => setProductImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}>Remover foto {index + 1}</button>
                      </div>
                    ))}</div>}
                    {imageUploadMessage && <p className="form-message" role="status">{imageUploadMessage}</p>}
                    <label>Descrição<textarea name="description" required /></label>
                    <label>Estoque demonstrativo<input name="stock" type="number" min="0" /></label>
                    <button className="primary-btn full" type="submit">{editingId ? 'Salvar alterações' : 'Adicionar produto'}</button>
                    {productMessage && <p className="form-message" role="status">{productMessage}</p>}
                  </form>
                </div>
                <section className="panel-box admin-table">
                  <h2>Produtos cadastrados</h2>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Produto</th><th>Preço</th><th>Ações</th></tr></thead>
                      <tbody>{products.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{currency.format(product.price)}</td>
                          <td className="table-actions">
                            <button type="button" className="secondary-btn small" onClick={() => editProduct(product)}>Editar</button>
                            <button type="button" className="secondary-btn small danger" onClick={() => deleteProduct(product.id)}>Excluir</button>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </section>
              </section>
              <p className="admin-notice">Painel demonstrativo local. Não representa uma área protegida para produção.</p>
            </>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className={`market-shell${darkMode ? ' dark-mode' : ''}${shoppingScreen !== 'catalog' ? ' shopping-screen-active' : ''}`} style={shellStyle} aria-busy={loadingPhase !== 'hidden'}>
      {loadingPhase !== 'hidden' && (
        <div className={`store-loader${loadingPhase === 'leaving' ? ' is-leaving' : ''}`} role="status" aria-live="polite">
          <div className="store-loader-content">
            <div className="store-loader-mark">{brandImage ? <img src={brandImage} alt="" /> : getBrandMonogram(company)}</div>
            <p className="store-loader-label">{company}</p>
            <h1>Boas descobertas começam por aqui.</h1>
            <p className="store-loader-caption">Estamos abrindo a loja para você.</p>
            <div className="store-loader-track"><span /></div>
          </div>
        </div>
      )}
      <header className="market-header">
        <div className="logo-area">
          <div className="logo-badge">{brandImage ? <img src={brandImage} alt="" /> : getBrandMonogram(company)}</div>
          <div>
            <p className="eyebrow">{getBrandMonogram(company)}</p>
            <strong>{company}</strong>
          </div>
        </div>
        <nav className="top-nav">
          <a href="#catalogo">Produtos</a>
          <a href="#ofertas">Ofertas</a>
          <a href="#catalogo">Catálogo</a>
        </nav>
        <div className="header-actions">
          <a className="admin-entry-link" href="/admin">Área da equipe</a>
          <button type="button" className="theme-toggle" onClick={() => setDarkMode((value) => !value)} aria-pressed={darkMode}>
            {darkMode ? '☀️ Claro' : '🌙 Escuro'}
          </button>
          <button type="button" className="cart-button" onClick={() => setShoppingScreen('cart')}>Carrinho • {cart.reduce((sum, item) => sum + item.quantity, 0)}</button>
          {Object.keys(socialLinks).length > 0 && (
            <nav className="social-header-links" aria-label="Redes sociais da loja">
              {socialNetworks.filter((network) => socialLinks[network.key]).map((network) => (
                <a key={network.key} href={socialLinks[network.key]} target="_blank" rel="noopener noreferrer">{network.label}</a>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="market-page">
        <section className="promo-banner" id="inicio">
          <div>
            <p className="eyebrow">Semana de ofertas</p>
            <h1>Produtos que resolvem o dia a dia.</h1>
            <p>
              Achados para deixar a rotina mais prática — e presentes para acertar em cheio.
            </p>
            <div className="banner-actions">
              <a href="#catalogo" className="primary-btn">Comprar agora</a>
              <button type="button" className="secondary-btn" onClick={() => setCategory('Todas')}>Ver tudo</button>
            </div>
          </div>
          <div className="promo-pills">
            <span>Eletrônicos</span>
            <span>Casa</span>
            <span>Beleza</span>
          </div>
        </section>

        <section className="controls-row" id="ofertas">
          <input
            placeholder="Buscar produto"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="relevancia">Relevância</option>
            <option value="menor">Menor preço</option>
            <option value="maior">Maior preço</option>
          </select>
        </section>

        <section className="catalog-grid" id="catalogo">
          <div className="products-panel">
            <div className="section-title">
              <p className="eyebrow">Catálogo</p>
              <h2>Escolhas para o dia a dia</h2>
            </div>

            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <button type="button" className="product-image-action" onClick={() => showProduct(product)} aria-label={`Ver detalhes de ${product.name}`}>
                    <img src={getProductImages(product)[gallerySelection[product.id] || 0] || product.image} alt={product.name} loading="lazy" />
                  </button>
                  {getProductImages(product).length > 1 && <div className="product-thumbnails" aria-label={`Fotos de ${product.name}`}>
                    {getProductImages(product).map((image, index) => (
                      <button key={`${product.id}-${index}`} type="button" className={gallerySelection[product.id] === index ? 'active' : ''} onClick={() => setGallerySelection((current) => ({ ...current, [product.id]: index }))} aria-label={`Ver foto ${index + 1} de ${product.name}`} aria-pressed={gallerySelection[product.id] === index}>
                        <img src={image} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>}
                  <div className="product-body">
                    <div className="product-meta">
                      <span>{product.category}</span>
                      <strong>{currency.format(product.price)}</strong>
                    </div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="product-footer">
                      <small>{product.stock} em estoque</small>
                      <div className="product-actions">
                        <button type="button" className="primary-btn small" onClick={() => showProduct(product)}>Ver produto</button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="checkout-panel" id="carrinho">
            <div className="panel-title">
              <p className="eyebrow">Seu carrinho</p>
              <h3>Resumo</h3>
            </div>

            <div className="cart-list">
              {cart.length === 0 ? (
                <p className="empty">Ainda não há produtos no carrinho.</p>
              ) : (
                cart.map((item) => {
                  const product = products.find((entry) => entry.id === item.id)
                  if (!product) return null
                  return (
                    <div key={item.id} className="cart-item">
                      <div>
                        <strong>{product.name}</strong>
                        <span>{currency.format(product.price)} cada</span>
                      </div>
                      <div className="qty-control">
                        <button type="button" onClick={() => changeQty(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => changeQty(item.id, 1)}>+</button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="coupon-box">
              <label htmlFor="coupon">Cupom</label>
              <div className="coupon-row">
                <input id="coupon" placeholder="Ex.: SAVE10" value={couponInput} onChange={(event) => setCouponInput(event.target.value.toUpperCase())} />
                <button type="button" className="secondary-btn small" onClick={applyCoupon}>Aplicar</button>
                <button type="button" className="secondary-btn small" onClick={resetCoupon}>Limpar</button>
              </div>
              {activeCoupon && <small>Cupom ativo: {activeCoupon}</small>}
              {couponMessage && <small className="coupon-feedback" role="status">{couponMessage}</small>}
            </div>

            <div className="totals">
              <div><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
              <div><span>Desconto</span><strong>- {currency.format(discount)}</strong></div>
              <div className="total-line"><span>Total</span><strong>{currency.format(total)}</strong></div>
            </div>

            <button type="button" className="primary-btn full" onClick={handleCheckout}>Finalizar compra</button>
          </aside>
        </section>

        <section className="bottom-grid">
          <div className="panel-box theme-box">
            <p className="eyebrow">Personalização</p>
            <h3>Visual</h3>
            <div className="theme-actions">
              <button type="button" className="secondary-btn small" onClick={() => applyThemePreset('moderno')}>Moderno</button>
              <button type="button" className="secondary-btn small" onClick={() => applyThemePreset('vibrante')}>Vibrante</button>
              <button type="button" className="secondary-btn small" onClick={() => applyThemePreset('escuro')}>Escuro</button>
            </div>
            <div className="color-picks">
              <label><span>Primária</span><input type="color" value={theme.primary} onChange={(event) => setTheme((current) => ({ ...current, primary: event.target.value }))} /></label>
              <label><span>Secundária</span><input type="color" value={theme.secondary} onChange={(event) => setTheme((current) => ({ ...current, secondary: event.target.value }))} /></label>
              <label><span>Detalhe</span><input type="color" value={theme.accent} onChange={(event) => setTheme((current) => ({ ...current, accent: event.target.value }))} /></label>
            </div>
            <label className="wallpaper-field">Imagem de fundo (envie do computador)
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleWallpaperUpload} />
            </label>
            {imageUploadMessage && <p className="form-message" role="status">{imageUploadMessage}</p>}
            <div className="theme-actions">
              <button type="button" className="secondary-btn small" onClick={removeWallpaper}>Remover imagem</button>
            </div>
            {productMessage && <p className="form-message" role="status">{productMessage}</p>}
          </div>
        </section>
      </main>
      {shoppingScreen !== 'catalog' && (
        <section className="shopping-screen" aria-label={shoppingScreen === 'product' ? 'Detalhes do produto' : 'Carrinho'}>
          <header className="shopping-screen-header">
            <button type="button" className="secondary-btn" onClick={() => setShoppingScreen('catalog')}>← Voltar aos produtos</button>
            <strong>{shoppingScreen === 'product' ? 'Detalhes do produto' : 'Seu carrinho'}</strong>
            {shoppingScreen === 'product' && <button type="button" className="secondary-btn" onClick={() => setShoppingScreen('cart')}>Carrinho ({cart.reduce((sum, item) => sum + item.quantity, 0)})</button>}
          </header>
          {shoppingScreen === 'product' && products.filter((product) => product.id === selectedProductId).map((product) => (
            <article key={product.id} className="product-detail-screen">
              <div>
                <img className="product-detail-image" src={getProductImages(product)[gallerySelection[product.id] || 0] || product.image} alt={product.name} />
                {getProductImages(product).length > 1 && <div className="product-thumbnails">
                  {getProductImages(product).map((image, index) => (
                    <button key={`${product.id}-${index}`} type="button" className={gallerySelection[product.id] === index ? 'active' : ''} onClick={() => setGallerySelection((current) => ({ ...current, [product.id]: index }))} aria-label={`Ver foto ${index + 1} de ${product.name}`} aria-pressed={gallerySelection[product.id] === index}><img src={image} alt="" /></button>
                  ))}
                </div>}
              </div>
              <div className="product-detail-copy">
                <p className="eyebrow">{product.category}</p>
                <h1>{product.name}</h1>
                <strong className="product-detail-price">{currency.format(product.price)}</strong>
                <p>{product.description}</p>
                <p className="form-hint">{product.stock} unidade(s) em estoque</p>
                <button type="button" className="primary-btn full" onClick={() => { addToCart(product.id); setShoppingScreen('cart') }}>Adicionar ao carrinho</button>
                <button type="button" className="secondary-btn full" onClick={() => openWhatsApp(product)}>Comprar pelo WhatsApp</button>
              </div>
            </article>
          ))}
          {shoppingScreen === 'cart' && <section className="shopping-cart-screen">
            <h1>Seu carrinho</h1>
            {cart.length === 0 ? <p className="empty">Seu carrinho está vazio.</p> : cart.map((item) => {
              const product = products.find((entry) => entry.id === item.id)
              if (!product) return null
              return <div key={item.id} className="cart-item">
                <div><strong>{product.name}</strong><span>{currency.format(product.price)} cada</span></div>
                <div className="qty-control"><button type="button" aria-label={`Diminuir quantidade de ${product.name}`} onClick={() => changeQty(item.id, -1)}>-</button><span>{item.quantity}</span><button type="button" aria-label={`Aumentar quantidade de ${product.name}`} onClick={() => changeQty(item.id, 1)}>+</button></div>
                <strong>{currency.format(product.price * item.quantity)}</strong>
              </div>
            })}
            <div className="coupon-box">
              <label htmlFor="shopping-screen-coupon">Cupom</label>
              <div className="coupon-row">
                <input id="shopping-screen-coupon" placeholder="Digite seu cupom" value={couponInput} onChange={(event) => setCouponInput(event.target.value.toUpperCase())} />
                <button type="button" className="secondary-btn small" onClick={applyCoupon}>Aplicar</button>
                <button type="button" className="secondary-btn small" onClick={resetCoupon}>Limpar</button>
              </div>
              {activeCoupon && <small>Cupom ativo: {activeCoupon}</small>}
              {couponMessage && <small className="coupon-feedback" role="status">{couponMessage}</small>}
            </div>
            <div className="totals">
              <div><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
              <div><span>Desconto</span><strong>- {currency.format(discount)}</strong></div>
              <div className="total-line"><span>Total</span><strong>{currency.format(total)}</strong></div>
            </div>
            <button type="button" className="primary-btn full" onClick={handleCheckout}>Finalizar compra</button>
          </section>}
        </section>
      )}
      {Object.keys(socialLinks).length > 0 && (
        <footer className="social-footer">
          <strong>Siga {company}</strong>
          <nav aria-label="Redes sociais da loja">
            {socialNetworks.filter((network) => socialLinks[network.key]).map((network) => (
              <a key={network.key} href={socialLinks[network.key]} target="_blank" rel="noopener noreferrer">{network.label}</a>
            ))}
          </nav>
        </footer>
      )}
    </div>
  )
}

export default App
