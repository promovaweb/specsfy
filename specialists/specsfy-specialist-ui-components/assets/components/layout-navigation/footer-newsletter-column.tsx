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
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm3.2 10L10 15V9l5.2 3z" />
    </svg>
  )
}

export default function Example() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-8 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
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
          <div className="mt-10 xl:mt-0">
            <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Assine nossa newsletter</h3>
            <p className="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">
              Receba semanalmente as últimas notícias, artigos e recursos.
            </p>
            <form className="mt-6 sm:flex sm:max-w-md">
              <label htmlFor="email-address" className="sr-only">
                Endereço de e-mail
              </label>
              <input
                id="email-address"
                name="email-address"
                type="email"
                required
                placeholder="Digite seu e-mail"
                autoComplete="email"
                className="w-full min-w-0 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:w-64 sm:text-sm/6 xl:w-full dark:bg-white/5 dark:text-white dark:outline-gray-700 dark:focus:outline-indigo-500"
              />
              <div className="mt-4 sm:mt-0 sm:ml-4 sm:shrink-0">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  Assinar
                </button>
              </div>
            </form>
          </div>
        </div>
        <FooterBottom />
      </div>
    </footer>
  )
}

function FooterBottom() {
  return (
    <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-24 dark:border-white/10">
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
