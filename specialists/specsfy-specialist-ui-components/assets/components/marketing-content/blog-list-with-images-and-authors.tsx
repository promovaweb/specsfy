const posts = [
  {
    id: 1,
    title: 'Aumente sua taxa de conversão',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    imageUrl:
      'https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80',
    date: '16 mar. 2020',
    datetime: '2020-03-16',
    category: { title: 'Marketing', href: '#' },
    author: {
      name: 'Michael Foster',
      role: 'Cofundador e CTO',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    id: 2,
    title: 'Como usar SEO para aumentar as vendas',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    imageUrl:
      'https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3270&q=80',
    date: '10 mar. 2020',
    datetime: '2020-03-10',
    category: { title: 'Vendas', href: '#' },
    author: {
      name: 'Lindsay Walton',
      role: 'Desenvolvedor front-end',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    id: 3,
    title: 'Melhore a experiência dos seus clientes',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    imageUrl:
      'https://images.unsplash.com/photo-1492724441997-5dc865305da7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3270&q=80',
    date: '12 fev. 2020',
    datetime: '2020-02-12',
    category: { title: 'Negócios', href: '#' },
    author: {
      name: 'Tom Cook',
      role: 'Diretor de Produto',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Do blog
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600 dark:text-gray-400">
            Aprenda a desenvolver seu negócio com a orientação de especialistas.
          </p>
          <div className="mt-16 space-y-20 lg:mt-20">
            {posts.map((post) => (
              <article key={post.id} className="relative isolate flex flex-col gap-8 lg:flex-row">
                <div className="relative aspect-video sm:aspect-2/1 lg:aspect-square lg:w-64 lg:shrink-0">
                  <img
                    alt=""
                    src={post.imageUrl}
                    className="absolute inset-0 size-full rounded-2xl bg-gray-50 object-cover dark:bg-gray-800"
                  />
                  <div className="absolute inset-0 rounded-2xl inset-ring inset-ring-gray-900/10 dark:inset-ring-white/10" />
                </div>
                <div>
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={post.datetime} className="text-gray-500 dark:text-gray-400">
                      {post.date}
                    </time>
                    <a
                      href={post.category.href}
                      className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      {post.category.title}
                    </a>
                  </div>
                  <div className="group relative max-w-xl">
                    <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600 dark:text-white dark:group-hover:text-gray-300">
                      <a href={post.href}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </a>
                    </h3>
                    <p className="mt-5 text-sm/6 text-gray-600 dark:text-gray-400">{post.description}</p>
                  </div>
                  <div className="mt-6 flex border-t border-gray-900/5 pt-6 dark:border-white/10">
                    <div className="relative flex items-center gap-x-4">
                      <img
                        alt=""
                        src={post.author.imageUrl}
                        className="size-10 rounded-full bg-gray-50 dark:bg-gray-800"
                      />
                      <div className="text-sm/6">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          <a href={post.author.href}>
                            <span className="absolute inset-0" />
                            {post.author.name}
                          </a>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">{post.author.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
