export default function Header({ title, logo }) {
  return (
    <header className="p-4 flex items-center gap-4">
      {logo && <img src={logo} alt="logo" className="h-10" />}
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  )
}
