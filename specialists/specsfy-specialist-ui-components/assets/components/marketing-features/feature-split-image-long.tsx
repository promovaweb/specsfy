import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <div className="relative bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl lg:flex lg:justify-between lg:px-8 xl:justify-end">
        <div className="lg:flex lg:w-1/2 lg:shrink lg:grow-0 xl:absolute xl:inset-y-0 xl:right-1/2 xl:w-1/2">
          <div className="relative h-80 lg:-ml-8 lg:h-auto lg:w-full lg:grow xl:ml-0">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-x=.4&w=2560&h=3413&&q=80"
              className="absolute inset-0 size-full bg-gray-50 object-cover dark:bg-gray-800"
            />
          </div>
        </div>
        <div className="px-6 lg:contents">
          <div className="mx-auto max-w-2xl pt-16 pb-24 sm:pt-20 sm:pb-32 lg:mr-0 lg:ml-8 lg:w-full lg:max-w-lg lg:flex-none lg:pt-32 xl:w-1/2">
            <p className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Faça deploy mais rápido</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
              Um fluxo de trabalho melhor
            </h1>
            <p className="mt-6 text-xl/8 text-gray-700 dark:text-gray-300">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
            <div className="mt-10 max-w-xl text-base/7 text-gray-600 lg:max-w-none dark:text-gray-400">
              <p>
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <p className="mt-8">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <ul role="list" className="mt-8 space-y-8 text-gray-600 dark:text-gray-400">
                <li className="flex gap-x-3">
                  <CloudArrowUpIcon
                    aria-hidden="true"
                    className="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400"
                  />
                  <span>
                    <strong className="font-semibold text-gray-900 dark:text-white">Envio para deploy.</strong> Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <LockClosedIcon
                    aria-hidden="true"
                    className="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400"
                  />
                  <span>
                    <strong className="font-semibold text-gray-900 dark:text-white">Certificados SSL.</strong> Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <ServerIcon
                    aria-hidden="true"
                    className="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400"
                  />
                  <span>
                    <strong className="font-semibold text-gray-900 dark:text-white">Backups do banco de dados.</strong> Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                  </span>
                </li>
              </ul>
              <p className="mt-8">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Sem servidor? Sem problema.
              </h2>
              <p className="mt-6">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
