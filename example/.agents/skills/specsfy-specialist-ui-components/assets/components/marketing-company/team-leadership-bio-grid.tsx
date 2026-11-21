const people = [
  {
    name: 'Leonard Krasner',
    role: 'Designer Sênior',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    bio: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
  {
    name: 'Floyd Miles',
    role: 'Designer Principal',
    imageUrl:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    bio: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
  {
    name: 'Emily Selman',
    role: 'VP de Experiência do Usuário',
    imageUrl:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    bio: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
  {
    name: 'Kristin Watson',
    role: 'VP de Recursos Humanos',
    imageUrl:
      'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6&ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    bio: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
            Conheça nossa liderança
          </h2>
          <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-400">
            Somos uma equipe dinâmica, comprometida com nosso trabalho e com os melhores resultados para nossos clientes.
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:max-w-4xl lg:gap-x-8 xl:max-w-none"
        >
          {people.map((person) => (
            <li key={person.name} className="flex flex-col gap-6 xl:flex-row">
              <img
                alt=""
                src={person.imageUrl}
                className="aspect-4/5 w-52 flex-none rounded-2xl object-cover outline-1 -outline-offset-1 outline-black/5 dark:outline-white/10"
              />
              <div className="flex-auto">
                <h3 className="text-lg/8 font-semibold tracking-tight text-gray-900 dark:text-white">{person.name}</h3>
                <p className="text-base/7 text-gray-600 dark:text-gray-400">{person.role}</p>
                <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-400">{person.bio}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
