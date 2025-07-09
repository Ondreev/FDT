import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import CategoryTabs from './components/CategoryTabs'
import ProductList from './components/ProductList'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby073FVIxsh4rQ_3OVHaGeZtE7mev33gJNAYKUVrG6-shTjhepo0Zg-xeXxEuPJu5m3QA/exec'

export default function App() {
  const [settings, setSettings] = useState({})
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchSettings()
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchSettings = async () => {
    const res = await fetch(`${SCRIPT_URL}?action=getSettings`)
    const data = await res.json()
    setSettings(data)
  }

  const fetchProducts = async () => {
    const res = await fetch(`${SCRIPT_URL}?action=getProducts`)
    const data = await res.json()
    setProducts(data.filter(p => p.active))
  }

  const fetchCategories = async () => {
    const res = await fetch(`${SCRIPT_URL}?action=getCategories`)
    const data = await res.json()
    setCategories(data)
    if (data.length > 0) setSelectedCategory(data[0].name)
  }

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products

  return (
    <div className="min-h-screen text-gray-900 font-sans">
      <Header title={settings.projectTitle} logo={settings.logoUrl} />
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <ProductList products={filteredProducts} currency={settings.currency || '₽'} />
    </div>
  )
}
