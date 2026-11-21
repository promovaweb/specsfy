const people = [
  {
    name: 'Leslie Alexander',
    role: 'Cofundador e CEO',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    bio: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    xUrl: '#',
    linkedinUrl: '#',
  },
  {
    name: 'Michael Foster',
    role: 'Cofundador e CTO',
    imageUrl:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    bio: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    xUrl: '#',
    linkedinUrl: '#',
  },
  {
    name: 'Dries Vincent',
    role: 'Relações Comerciais',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    bio: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    xUrl: '#',
    linkedinUrl: '#',
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 md:py-32 dark:bg-gray-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-20 px-6 lg:px-8 xl:grid-cols-5">
        <div className="max-w-2xl xl:col-span-2">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Sobre a equipe
          </h2>
          <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-400">
            Somos uma equipe dinâmica, comprometida com nosso trabalho e com os melhores resultados para nossos clientes.
          </p>
        </div>
        <ul role="list" className="divide-y divide-gray-200 xl:col-span-3 dark:divide-gray-800">
          {people.map((person) => (
            <li key={person.name} className="flex flex-col gap-10 py-12 first:pt-0 last:pb-0 sm:flex-row">
              <img
                alt=""
                src={person.imageUrl}
                className="aspect-4/5 w-52 flex-none rounded-2xl object-cover outline-1 -outline-offset-1 outline-black/5 dark:outline-white/10"
              />
              <div className="max-w-xl flex-auto">
                <h3 className="text-lg/8 font-semibold tracking-tight text-gray-900 dark:text-white">{person.name}</h3>
                <p className="text-base/7 text-gray-600 dark:text-gray-400">{person.role}</p>
                <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-400">{person.bio}</p>
                <ul role="list" className="mt-6 flex gap-x-6">
                  <li>
                    <a
                      href={person.xUrl}
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <span className="sr-only">X</span>
                      <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" className="size-5">
                        <path d="M11.4678 8.77491L17.2961 2H15.915L10.8543 7.88256L6.81232 2H2.15039L8.26263 10.8955L2.15039 18H3.53159L8.87581 11.7878L13.1444 18H17.8063L11.4675 8.77491H11.4678ZM9.57608 10.9738L8.95678 10.0881L4.02925 3.03974H6.15068L10.1273 8.72795L10.7466 9.61374L15.9156 17.0075H13.7942L9.57608 10.9742V10.9738Z" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      href={person.linkedinUrl}
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <span className="sr-only">LinkedIn</span>
                      <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" className="size-5">
                        <path
                          d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                          clipRule="evenodd"
                          fillRule="evenodd"
                        />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
