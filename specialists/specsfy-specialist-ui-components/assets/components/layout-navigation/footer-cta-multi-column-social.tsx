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
  social: [
    { name: 'Facebook', href: '#', icon: SocialIcon },
    { name: 'Instagram', href: '#', icon: SocialIcon },
    { name: 'X', href: '#', icon: SocialIcon },
    { name: 'GitHub', href: '#', icon: SocialIcon },
    { name: 'YouTube', href: '#', icon: SocialIcon },
  ],
}

function SocialIcon(props) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        d="M12 2a10 10 0 100 20 10 10 0 000-20zm4 13.5L10 18V6l6 9.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function Example() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <hgroup>
            <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Começar</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
              Aumente sua produtividade. Comece a usar nosso aplicativo hoje.
            </p>
          </hgroup>
          <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-600 dark:text-gray-400">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Começar
            </a>
          </div>
        </div>
        <div className="mt-24 border-t border-gray-900/10 pt-12 xl:grid xl:grid-cols-3 xl:gap-8 dark:border-white/10">
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
          <FooterColumns />
        </div>
        <FooterBottom />
      </div>
    </footer>
  )
}

function FooterColumns() {
  return (
    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
      {[
        ['Soluções', navigation.solutions],
        ['Suporte', navigation.support],
        ['Empresa', navigation.company],
        ['Jurídico', navigation.legal],
      ].map(([title, items]) => (
        <div key={title}>
          <h3 className="text-sm/6 font-semibold text-gray-950 dark:text-white">{title}</h3>
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
  )
}

function FooterBottom() {
  return (
    <div className="mt-12 border-t border-gray-900/10 pt-8 md:flex md:items-center md:justify-between dark:border-white/10">
      <div className="flex gap-x-6 md:order-2">
        {navigation.social.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <span className="sr-only">{item.name}</span>
            <item.icon aria-hidden="true" className="size-6" />
          </a>
        ))}
      </div>
      <p className="mt-8 text-sm/6 text-gray-600 md:order-1 md:mt-0 dark:text-gray-400">
        &copy; 2024 Sua Empresa, Inc. Todos os direitos reservados.
      </p>
    </div>
  )
}
