const featuredPost = {
  id: 1,
  title: "Temos orgulho de anunciar a captação de US$ 75 milhões na rodada Série B",
  href: '#',
  description:
    'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
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
  {
    id: 2,
    title: 'Aumente sua taxa de conversão',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: '10 mar. 2020',
    datetime: '2020-03-16',
    author: {
      name: 'Lindsay Walton',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    id: 3,
    title: 'Como usar SEO para aumentar as vendas',
    href: '#',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: '12 fev. 2020',
    datetime: '2020-03-10',
    author: {
      name: 'Tom Cook',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-12 px-6 sm:gap-y-16 lg:grid-cols-2 lg:px-8">
        <article className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-lg">
          <time dateTime={featuredPost.datetime} className="block text-sm/6 text-gray-600 dark:text-gray-400">
            {featuredPost.date}
          </time>
          <h2
            id="featured-post"
            className="mt-4 text-3xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-4xl dark:text-white"
          >
            {featuredPost.title}
          </h2>
          <p className="mt-4 text-lg/8 text-gray-600 dark:text-gray-400">{featuredPost.description}</p>
          <div className="mt-4 flex flex-col justify-between gap-6 sm:mt-8 sm:flex-row-reverse sm:gap-8 lg:mt-4 lg:flex-col">
            <div className="flex">
              <a
                href={featuredPost.href}
                aria-describedby="featured-post"
                className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Continuar lendo <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
            <div className="flex lg:border-t lg:border-gray-900/10 lg:pt-8 dark:lg:border-white/10">
              <a
                href={featuredPost.author.href}
                className="flex gap-x-2.5 text-sm/6 font-semibold text-gray-900 dark:text-white"
              >
                <img
                  alt=""
                  src={featuredPost.author.imageUrl}
                  className="size-6 flex-none rounded-full bg-gray-50 dark:bg-gray-800"
                />
                {featuredPost.author.name}
              </a>
            </div>
          </div>
        </article>
        <div className="mx-auto w-full max-w-2xl border-t border-gray-900/10 pt-12 sm:pt-16 lg:mx-0 lg:max-w-none lg:border-t-0 lg:pt-0 dark:border-white/10">
          <div className="-my-12 divide-y divide-gray-900/10 dark:divide-white/10">
            {posts.map((post) => (
              <article key={post.id} className="py-12">
                <div className="group relative max-w-xl">
                  <time dateTime={post.datetime} className="block text-sm/6 text-gray-600 dark:text-gray-400">
                    {post.date}
                  </time>
                  <h2 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-gray-600 dark:text-white dark:group-hover:text-gray-300">
                    <a href={post.href}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </a>
                  </h2>
                  <p className="mt-4 text-sm/6 text-gray-600 dark:text-gray-400">{post.description}</p>
                </div>
                <div className="mt-4 flex">
                  <a
                    href={post.author.href}
                    className="relative flex gap-x-2.5 text-sm/6 font-semibold text-gray-900 dark:text-white"
                  >
                    <img
                      alt=""
                      src={post.author.imageUrl}
                      className="size-6 flex-none rounded-full bg-gray-50 dark:bg-gray-800"
                    />
                    {post.author.name}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
