const navigation = [
  { name: 'Facebook', href: '#', icon: SocialIcon },
  { name: 'Instagram', href: '#', icon: SocialIcon },
  { name: 'X', href: '#', icon: SocialIcon },
  { name: 'GitHub', href: '#', icon: SocialIcon },
  { name: 'YouTube', href: '#', icon: SocialIcon },
]

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
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center gap-x-6 md:order-2">
          {navigation.map((item) => (
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
        <p className="mt-8 text-center text-sm/6 text-gray-600 md:order-1 md:mt-0 dark:text-gray-400">
          &copy; 2024 Sua Empresa, Inc. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
