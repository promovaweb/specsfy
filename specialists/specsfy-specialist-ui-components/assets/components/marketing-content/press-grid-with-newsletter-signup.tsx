const posts = [
  {
    title: 'Aumente sua taxa de conversão',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: '16 mar. 2020',
    datetime: '2020-03-16',
  },
  {
    title: 'Como usar SEO para aumentar as vendas',
    href: '#',
    description: 'Uma abordagem prática para resolver necessidades reais com clareza e consistência.',
    date: '10 mar. 2020',
    datetime: '2020-03-10',
  },
  {
    title: 'Melhore a experiência dos seus clientes',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: '12 fev. 2020',
    datetime: '2020-02-12',
  },
  {
    title: 'Como escrever uma landing page eficaz',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: 'Jan 29, 2020',
    datetime: '2020-01-29',
  },
]

export default function Example() {
  return (
    <div className="bg-white px-6 pt-16 pb-20 dark:bg-gray-900 lg:px-8 lg:pt-24 lg:pb-28">
      <div className="relative mx-auto max-w-lg divide-y-2 divide-gray-200 dark:divide-gray-800 lg:max-w-7xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Imprensa</h2>
          <div className="mt-3 sm:mt-4 lg:grid lg:grid-cols-2 lg:items-center lg:gap-5">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Aprenda a desenvolver seu negócio com a orientação de especialistas.
            </p>
            <form className="mt-6 flex flex-col sm:flex-row lg:mt-0 lg:items-center lg:justify-end">
              <div>
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
                  className="w-full appearance-none rounded-md bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 outline-1 outline-gray-300 focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500 dark:bg-gray-950 dark:text-white dark:placeholder-gray-400 dark:outline-gray-700 lg:max-w-xs"
                />
              </div>
              <div className="mt-2 flex w-full shrink-0 rounded-md shadow-xs sm:mt-0 sm:ml-3 sm:inline-flex sm:w-auto">
                <button
                  type="button"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:inline-flex sm:w-auto"
                >
                  Avise-me
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-6 grid gap-16 pt-10 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-12">
          {posts.map((post) => (
            <div key={post.title}>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <time dateTime={post.datetime}>{post.date}</time>
              </p>
              <a href="#" className="mt-2 block">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{post.title}</p>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400">{post.description}</p>
              </a>
              <div className="mt-3">
                <a
                  href={post.href}
                  className="text-base font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Ler história completa
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
