import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <div className="relative isolate overflow-hidden bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div
        aria-hidden="true"
        className="absolute -top-80 left-[max(6rem,33%)] -z-10 transform-gpu blur-3xl sm:left-1/2 md:top-20 lg:ml-20 xl:top-3 xl:ml-56"
      >
        <div
          style={{
            clipPath:
              'polygon(63.1% 29.6%, 100% 17.2%, 76.7% 3.1%, 48.4% 0.1%, 44.6% 4.8%, 54.5% 25.4%, 59.8% 49.1%, 55.3% 57.9%, 44.5% 57.3%, 27.8% 48%, 35.1% 81.6%, 0% 97.8%, 39.3% 100%, 35.3% 81.5%, 97.2% 52.8%, 63.1% 29.6%)',
          }}
          className="aspect-801/1036 w-200.25 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20"
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <p className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Faça deploy mais rápido</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Um fluxo de trabalho melhor
          </h1>
          <p className="mt-6 text-xl/8 text-gray-700 dark:text-gray-300">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-10 lg:max-w-none lg:grid-cols-12">
          <div className="relative lg:order-last lg:col-span-5">
            <svg
              aria-hidden="true"
              className="absolute -top-160 left-1 -z-10 h-256 w-702 -translate-x-1/2 mask-[radial-gradient(64rem_64rem_at_111.5rem_0%,white,transparent)] stroke-gray-900/10 dark:stroke-white/10"
            >
              <defs>
                <pattern
                  id="e87443c8-56e4-4c20-9111-55b82fa704e3"
                  width={200}
                  height={200}
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M0.5 0V200M200 0.5L0 0.499983" />
                </pattern>
              </defs>
              <rect fill="url(#e87443c8-56e4-4c20-9111-55b82fa704e3)" width="100%" height="100%" strokeWidth={0} />
            </svg>
            <figure className="border-l border-indigo-600 pl-8 dark:border-indigo-400">
              <blockquote className="text-xl/8 font-semibold tracking-tight text-gray-900 dark:text-white">
                <p>
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </blockquote>
              <figcaption className="mt-8 flex gap-x-4">
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  className="mt-1 size-10 flex-none rounded-full bg-gray-50 dark:bg-gray-800"
                />
                <div className="text-sm/6">
                  <div className="font-semibold text-gray-900 dark:text-white">Brenna Goyette</div>
                  <div className="text-gray-600 dark:text-gray-400">@brenna</div>
                </div>
              </figcaption>
            </figure>
          </div>
          <div className="max-w-xl text-base/7 text-gray-600 lg:col-span-7 dark:text-gray-400">
            <p>
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
            <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600 dark:text-gray-400">
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
                <ServerIcon aria-hidden="true" className="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400" />
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
  )
}
