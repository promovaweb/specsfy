const navigation = [
  { name: 'Soluções', href: '#' },
  { name: 'Preços', href: '#' },
  { name: 'Documentação', href: '#' },
  { name: 'Empresa', href: '#' },
]

export default function Example() {
  return (
    <header className="bg-indigo-600">
      <nav aria-label="Início" className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex w-full items-center justify-between border-b border-indigo-500 py-6 lg:border-none">
          <div className="flex items-center">
            <a href="#">
              <span className="sr-only">Sua Empresa</span>
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=white"
                className="h-10 w-auto"
              />
            </a>
            <div className="ml-10 hidden space-x-8 lg:block">
              {navigation.map((link) => (
                <a key={link.name} href={link.href} className="text-base font-medium text-white hover:text-indigo-50">
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          <div className="ml-10 space-x-4">
            <a
              href="#"
              className="inline-block rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-base font-medium text-white hover:bg-indigo-500/75"
            >
              Entrar
            </a>
            <a
              href="#"
              className="inline-block rounded-md border border-transparent bg-white px-4 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Criar conta
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 py-4 lg:hidden">
          {navigation.map((link) => (
            <a key={link.name} href={link.href} className="text-base font-medium text-white hover:text-indigo-50">
              {link.name}
            </a>
          ))}
        </div>
      </nav>
    </header>
  )
}
