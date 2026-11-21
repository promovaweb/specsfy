const navigation = {
  main: [
    { name: 'Sobre', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Vagas', href: '#' },
    { name: 'Imprensa', href: '#' },
    { name: 'Acessibilidade', href: '#' },
    { name: 'Parceiros', href: '#' },
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
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav aria-label="Rodapé" className="-mb-6 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6">
          {navigation.main.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {item.name}
            </a>
          ))}
        </nav>
        <div className="mt-16 flex justify-center gap-x-10">
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
        <p className="mt-10 text-center text-sm/6 text-gray-600 dark:text-gray-400">
          &copy; 2024 Sua Empresa, Inc. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
