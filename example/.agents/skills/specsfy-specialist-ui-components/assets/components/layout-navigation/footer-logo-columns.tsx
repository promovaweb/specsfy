const navigation = {
  solutions: [
    { name: 'Marketing', href: '#' },
    { name: 'Análises', href: '#' },
    { name: 'Automação', href: '#' },
    { name: 'Comércio', href: '#' },
    { name: 'Análises', href: '#' },
  ],
  support: [
    { name: 'Enviar chamado', href: '#' },
    { name: 'Documentação', href: '#' },
    { name: 'Guias', href: '#' },
  ],
  company: [
    { name: 'Sobre', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Vagas', href: '#' },
    { name: 'Imprensa', href: '#' },
  ],
  legal: [
    { name: 'Termos de serviço', href: '#' },
    { name: 'Política de privacidade', href: '#' },
    { name: 'Licença', href: '#' },
  ],
}

export default function Example() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <img
            alt="Nome da empresa"
            src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="h-9 dark:hidden"
          />
          <img
            alt="Nome da empresa"
            src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=500"
            className="h-9 not-dark:hidden"
          />
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            {[
              ['Soluções', navigation.solutions],
              ['Suporte', navigation.support],
              ['Empresa', navigation.company],
              ['Jurídico', navigation.legal],
            ].map(([title, items]) => (
              <div key={title}>
                <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">{title}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {items.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
