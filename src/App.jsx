import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import CategoryTabs from './components/CategoryTabs'
import ProductList from './components/ProductList'

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
    const res = await fetch('https://script.google.com/macros/s/AKfycbxIz5qxFXEc3vW4TnWkGyZAVA4Y9psWkvWXl7iR5V_vyyAT-fsmpGPGInuF2C3MIw427w/exec?action=getSettings')
    const data = await res.json()
    setSettings(data)
  }

  const fetchProducts = async () => {
    const res = await fetch('https://script.google.com/macros/s/AKfycbxIz5qxFXEc3vW4TnWkGyZAVA4Y9psWkvWXl7iR5V_vyyAT-fsmpGPGInuF2C3MIw427w/exec?action=getProducts')
    const data = await res.json()
    setProducts(data.filter(p => p.active))
  }

  const fetchCategories = async () => {
    const res = await fetch('https://script.google.com/macros/s/AKfycbxIz5qxFXEc3vW4TnWkGyZAVA4Y9psWkvWXl7iR5V_vyyAT-fsmpGPGInuF2C3MIw427w/exec?action=getCategories')
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
