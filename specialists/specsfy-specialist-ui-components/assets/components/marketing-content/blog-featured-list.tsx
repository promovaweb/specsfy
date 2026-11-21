const featuredPost = {
  id: 1,
  title: "Temos orgulho de anunciar a captação de US$ 75 milhões na rodada Série B",
  href: '#',
  description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  date: '16 mar. 2020',
  datetime: '2020-03-16',
  author: {
    name: 'Michael Foster',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
}

const posts = [
  ['Aumente sua taxa de conversão', 'Lindsay Walton'],
  ['Como usar SEO para aumentar as vendas', 'Tom Cook'],
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-12 px-6 sm:gap-y-16 lg:grid-cols-2 lg:px-8">
        <article className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-lg">
          <time dateTime={featuredPost.datetime} className="block text-sm/6 text-gray-600 dark:text-gray-400">
            {featuredPost.date}
          </time>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-4xl dark:text-white">
            {featuredPost.title}
          </h2>
          <p className="mt-4 text-lg/8 text-gray-600 dark:text-gray-400">{featuredPost.description}</p>
          <a href={featuredPost.href} className="mt-8 inline-block text-sm/6 font-semibold text-indigo-600 dark:text-indigo-400">
            Continuar lendo <span aria-hidden="true">&rarr;</span>
          </a>
        </article>
        <div className="mx-auto w-full max-w-2xl border-t border-gray-900/10 pt-12 lg:mx-0 lg:max-w-none lg:border-t-0 lg:pt-0 dark:border-white/10">
          <div className="-my-12 divide-y divide-gray-900/10 dark:divide-white/10">
            {posts.map(([title, author]) => (
              <article key={title} className="py-12">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                <p className="mt-4 text-sm/6 text-gray-600 dark:text-gray-400">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
                <p className="mt-4 text-sm/6 font-semibold text-gray-900 dark:text-white">{author}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
