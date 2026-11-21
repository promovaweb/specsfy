const jobOpenings = [
  {
    id: 1,
    role: 'Designer em tempo integral',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    salary: '$75,000 USD',
    location: 'San Francisco, CA',
  },
  {
    id: 2,
    role: 'Desenvolvedor Laravel',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    salary: '$125,000 USD',
    location: 'San Francisco, CA',
  },
  {
    id: 3,
    role: 'Desenvolvedor React Native',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    salary: '$105,000 USD',
    location: 'San Francisco, CA',
  },
]

export default function Example() {
  return (
    <div className="bg-white py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-end justify-between gap-16 lg:mx-0 lg:max-w-none lg:flex-row">
          <div className="w-full lg:max-w-lg lg:flex-auto">
            <h2 className="text-3xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-4xl dark:text-white">
              Estamos sempre procurando pessoas incríveis para a nossa equipe
            </h2>
            <p className="mt-6 text-xl/8 text-gray-600 dark:text-gray-400">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
            <img
              alt=""
              src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1344&h=1104&q=80"
              className="mt-16 aspect-6/5 w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-black/5 lg:aspect-auto lg:h-138 dark:outline-white/10"
            />
          </div>
          <div className="w-full lg:max-w-xl lg:flex-auto">
            <h3 className="sr-only">Vagas abertas</h3>
            <ul className="-my-8 divide-y divide-gray-100 dark:divide-gray-800">
              {jobOpenings.map((opening) => (
                <li key={opening.id} className="py-8">
                  <dl className="relative flex flex-wrap gap-x-3">
                    <dt className="sr-only">Cargo</dt>
                    <dd className="w-full flex-none text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                      <a href={opening.href}>
                        {opening.role}
                        <span aria-hidden="true" className="absolute inset-0" />
                      </a>
                    </dd>
                    <dt className="sr-only">Descrição</dt>
                    <dd className="mt-2 w-full flex-none text-base/7 text-gray-600 dark:text-gray-400">
                      {opening.description}
                    </dd>
                    <dt className="sr-only">Salário</dt>
                    <dd className="mt-4 text-base/7 font-semibold text-gray-900 dark:text-white">{opening.salary}</dd>
                    <dt className="sr-only">Localização</dt>
                    <dd className="mt-4 flex items-center gap-x-3 text-base/7 text-gray-500 dark:text-gray-400">
                      <svg
                        viewBox="0 0 2 2"
                        aria-hidden="true"
                        className="size-0.5 flex-none fill-gray-300 dark:fill-gray-600"
                      >
                        <circle r={1} cx={1} cy={1} />
                      </svg>
                      {opening.location}
                    </dd>
                  </dl>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex border-t border-gray-100 pt-8 dark:border-gray-800">
              <a
                href="#"
                className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Ver todas as vagas <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
