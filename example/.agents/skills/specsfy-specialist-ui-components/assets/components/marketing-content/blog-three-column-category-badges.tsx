const posts = [
  {
    title: 'Aumente sua taxa de conversão',
    href: '#',
    category: { name: 'Artigo', href: '#', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300' },
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: '16 mar. 2020',
    datetime: '2020-03-16',
    author: {
      name: 'Paul York',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    readingTime: '6 min',
  },
  {
    title: 'Como usar SEO para aumentar as vendas',
    href: '#',
    category: { name: 'Vídeo', href: '#', color: 'bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300' },
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: '10 mar. 2020',
    datetime: '2020-03-10',
    author: {
      name: 'Dessie Ryan',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    readingTime: '4 min',
  },
  {
    title: 'Melhore a experiência dos seus clientes',
    href: '#',
    category: { name: 'Estudo de caso', href: '#', color: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300' },
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: '12 fev. 2020',
    datetime: '2020-02-12',
    author: {
      name: 'Easer Collins',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    readingTime: '11 min',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <div className="bg-white px-6 pt-16 pb-20 dark:bg-gray-900 lg:px-8 lg:pt-24 lg:pb-28">
      <div className="relative mx-auto max-w-lg divide-y-2 divide-gray-200 dark:divide-gray-800 lg:max-w-7xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Publicações recentes
          </h2>
          <p className="mt-3 text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <div className="mt-12 grid gap-16 pt-12 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12">
          {posts.map((post) => (
            <div key={post.title}>
              <div>
                <a href={post.category.href} className="inline-block">
                  <span
                    className={classNames(
                      post.category.color,
                      'inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium',
                    )}
                  >
                    {post.category.name}
                  </span>
                </a>
              </div>
              <a href={post.href} className="mt-4 block">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{post.title}</p>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400">{post.description}</p>
              </a>
              <div className="mt-6 flex items-center">
                <div className="shrink-0">
                  <a href={post.author.href}>
                    <span className="sr-only">{post.author.name}</span>
                    <img alt="" src={post.author.imageUrl} className="size-10 rounded-full" />
                  </a>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    <a href={post.author.href}>{post.author.name}</a>
                  </p>
                  <div className="flex space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <time dateTime={post.datetime}>{post.date}</time>
                    <span aria-hidden="true">&middot;</span>
                    <span>{post.readingTime} read</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
