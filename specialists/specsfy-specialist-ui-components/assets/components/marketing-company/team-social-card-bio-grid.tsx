const people = [
  {
    name: 'Emma Dorsey',
    role: 'Desenvolvedor Sênior',
    imageUrl:
      'https://images.unsplash.com/photo-1505840717430-882ce147ef2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    bio: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    xUrl: '#',
    linkedinUrl: '#',
  },
  {
    name: 'Alicia Bell',
    role: 'Redator Júnior',
    imageUrl:
      'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    bio: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    xUrl: '#',
    linkedinUrl: '#',
  },
  {
    name: 'Jenny Wilson',
    role: 'Artista de Estúdio',
    imageUrl:
      'https://images.unsplash.com/photo-1507101105822-7472b28e22ac?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    bio: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    xUrl: '#',
    linkedinUrl: '#',
  },
  {
    name: 'Anna Roberts',
    role: 'Sócio de Criação',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    bio: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    xUrl: '#',
    linkedinUrl: '#',
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 md:py-32 lg:py-40 dark:bg-gray-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-20 px-6 lg:px-8 xl:grid-cols-3">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Nossa equipe
          </h2>
          <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-400">
            Somos uma equipe dinâmica, comprometida com nosso trabalho e com os melhores resultados para nossos clientes.
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:gap-x-8 xl:col-span-2"
        >
          {people.map((person) => (
            <li key={person.name}>
              <img
                alt=""
                src={person.imageUrl}
                className="aspect-3/2 w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-black/5 dark:outline-white/10"
              />
              <h3 className="mt-6 text-lg/8 font-semibold text-gray-900 dark:text-white">{person.name}</h3>
              <p className="text-base/7 text-gray-600 dark:text-gray-400">{person.role}</p>
              <p className="mt-4 text-base/7 text-gray-600 dark:text-gray-400">{person.bio}</p>
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
