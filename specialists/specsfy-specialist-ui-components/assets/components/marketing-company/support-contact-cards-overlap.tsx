import { LifebuoyIcon, NewspaperIcon, PhoneIcon } from '@heroicons/react/24/outline'

const supportLinks = [
  {
    name: 'Vendas',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: PhoneIcon,
  },
  {
    name: 'Suporte Técnico',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: LifebuoyIcon,
  },
  {
    name: 'Contato para Imprensa',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: NewspaperIcon,
  },
]

export default function Example() {
  return (
    <div className="bg-white">
      <div className="relative bg-gray-800 pb-32">
        <div className="absolute inset-0">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1525130413817-d45c1d127c42?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1920&q=60&&sat=-100"
            className="size-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gray-800 mix-blend-multiply" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">Suporte</h1>
          <p className="mt-6 max-w-3xl text-xl text-gray-300">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
      </div>

      <section aria-labelledby="contact-heading" className="relative z-10 mx-auto -mt-32 max-w-7xl px-6 pb-32 lg:px-8">
        <h2 id="contact-heading" className="sr-only">
          Fale conosco
        </h2>
        <div className="grid grid-cols-1 gap-y-20 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
          {supportLinks.map((link) => (
            <div key={link.name} className="flex flex-col rounded-2xl bg-white shadow-xl">
              <div className="relative flex-1 px-6 pt-16 pb-8 md:px-8">
                <div className="absolute top-0 inline-block -translate-y-1/2 transform rounded-xl bg-indigo-600 p-5 shadow-lg">
                  <link.icon aria-hidden="true" className="size-6 text-white" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">{link.name}</h3>
                <p className="mt-4 text-base text-gray-500">{link.description}</p>
              </div>
              <div className="rounded-br-2xl rounded-bl-2xl bg-gray-50 p-6 md:px-8">
                <a href={link.href} className="text-base font-medium text-indigo-700 hover:text-indigo-600">
                  Fale conosco<span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
