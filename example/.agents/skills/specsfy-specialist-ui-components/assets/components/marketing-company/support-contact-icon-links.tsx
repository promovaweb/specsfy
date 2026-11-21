import { BugAntIcon, ChatBubbleLeftRightIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'

export default function Example() {
  return (
    <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl sm:text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
          Falar com vendas
        </h2>
        <p className="mt-2 text-lg/8 text-gray-600 dark:text-gray-400">
          Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
        </p>
      </div>
      <div className="mx-auto mt-20 max-w-lg space-y-16">
        <div className="flex gap-x-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
            <ChatBubbleLeftRightIcon aria-hidden="true" className="size-6 text-white" />
          </div>
          <div>
            <h3 className="text-base/7 font-semibold text-gray-900 dark:text-white">Suporte de vendas</h3>
            <p className="mt-2 text-base/7 text-gray-600 dark:text-gray-400">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
            <p className="mt-4 text-sm/6 font-semibold">
              <a href="#" className="text-indigo-600 dark:text-indigo-400">
                Fale conosco <span aria-hidden="true">&rarr;</span>
              </a>
            </p>
          </div>
        </div>
        <div className="flex gap-x-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
            <BugAntIcon aria-hidden="true" className="size-6 text-white" />
          </div>
          <div>
            <h3 className="text-base/7 font-semibold text-gray-900 dark:text-white">Relatos de bugs</h3>
            <p className="mt-2 text-base/7 text-gray-600 dark:text-gray-400">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
            <p className="mt-4 text-sm/6 font-semibold">
              <a href="#" className="text-indigo-600 dark:text-indigo-400">
                Relatar um bug <span aria-hidden="true">&rarr;</span>
              </a>
            </p>
          </div>
        </div>
        <div className="flex gap-x-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
            <ComputerDesktopIcon aria-hidden="true" className="size-6 text-white" />
          </div>
          <div>
            <h3 className="text-base/7 font-semibold text-gray-900 dark:text-white">Suporte técnico</h3>
            <p className="mt-2 text-base/7 text-gray-600 dark:text-gray-400">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
            <p className="mt-4 text-sm/6 font-semibold">
              <a href="#" className="text-indigo-600 dark:text-indigo-400">
                Entre no nosso Discord <span aria-hidden="true">&rarr;</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
