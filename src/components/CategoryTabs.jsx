export default function CategoryTabs({ categories, selected, onSelect }) {
  return (
    <div className="flex gap-2 px-4 overflow-x-auto">
      {categories.map(cat => (
        <button
          key={cat.name}
          className={\`py-1 px-3 rounded-full \${selected === cat.name ? 'bg-orange-400 text-white' : 'bg-gray-200'}\`}
          onClick={() => onSelect(cat.name)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
