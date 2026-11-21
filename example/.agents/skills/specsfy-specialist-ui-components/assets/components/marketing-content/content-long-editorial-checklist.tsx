import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <div className="bg-white px-6 py-32 lg:px-8 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl text-base/7 text-gray-700 dark:text-gray-300">
        <p className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Apresentação</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
          JavaScript para iniciantes
        </h1>
        <p className="mt-6 text-xl/8">
          Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
        </p>
        <div className="mt-10 max-w-2xl text-gray-600 dark:text-gray-400">
          <p>
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
          <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600 dark:text-gray-400">
            <li className="flex gap-x-3">
              <CheckCircleIcon
                aria-hidden="true"
                className="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400"
              />
              <span>
                <strong className="font-semibold text-gray-900 dark:text-white">Tipos de dados.</strong> Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </span>
            </li>
            <li className="flex gap-x-3">
              <CheckCircleIcon
                aria-hidden="true"
                className="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400"
              />
              <span>
                <strong className="font-semibold text-gray-900 dark:text-white">Laços.</strong> Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </span>
            </li>
            <li className="flex gap-x-3">
              <CheckCircleIcon
                aria-hidden="true"
                className="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400"
              />
              <span>
                <strong className="font-semibold text-gray-900 dark:text-white">Eventos.</strong> Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </span>
            </li>
          </ul>
          <p className="mt-8">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
          <h2 className="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white">
            Do nível iniciante ao avançado em 3 horas
          </h2>
          <p className="mt-6">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
          <figure className="mt-10 border-l border-indigo-600 pl-9 dark:border-indigo-400">
            <blockquote className="font-semibold text-gray-900 dark:text-white">
              <p>
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </blockquote>
            <figcaption className="mt-6 flex gap-x-4">
              <img
                alt=""
                src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="size-6 flex-none rounded-full bg-gray-50 dark:bg-gray-800"
              />
              <div className="text-sm/6">
                <strong className="font-semibold text-gray-900 dark:text-white">Maria Hill</strong> – Gerente de Marketing
              </div>
            </figcaption>
          </figure>
          <p className="mt-10">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <figure className="mt-16">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&w=1310&h=873&q=80&facepad=3"
            className="aspect-video rounded-xl bg-gray-50 object-cover dark:bg-gray-800"
          />
          <figcaption className="mt-4 flex gap-x-2 text-sm/6 text-gray-500 dark:text-gray-400">
            <InformationCircleIcon
              aria-hidden="true"
              className="mt-0.5 size-5 flex-none text-gray-300 dark:text-gray-600"
            />
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </figcaption>
        </figure>
        <div className="mt-16 max-w-2xl text-gray-600 dark:text-gray-400">
          <h2 className="text-3xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white">
            Tudo o que você precisa para começar
          </h2>
          <p className="mt-6">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
          <p className="mt-8">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
      </div>
    </div>
  )
}
