export default function ProductList({ products, currency }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {products.map(p => (
        <div key={p.id} className="bg-white rounded-xl shadow p-4">
          <img src={p.imageUrl} alt={p.name} className="w-full h-40 object-cover rounded-md mb-2" />
          <h3 className="text-lg font-bold">{p.name}</h3>
          <p className="text-sm text-gray-600">{p.description}</p>
          <div className="mt-2 text-orange-500 font-bold text-right">{p.price}{currency}</div>
        </div>
      ))}
    </div>
  )
}
