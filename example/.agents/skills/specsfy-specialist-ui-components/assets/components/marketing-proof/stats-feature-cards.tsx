export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Encaramos o trabalho como uma forma de tornar o mundo melhor
          </h2>
          <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-300">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl flex-col gap-8 lg:mx-0 lg:mt-20 lg:max-w-none lg:flex-row lg:items-end">
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-gray-50 p-8 sm:w-3/4 sm:max-w-md sm:flex-row-reverse sm:items-end lg:w-72 lg:max-w-none lg:flex-none lg:flex-col lg:items-start dark:bg-white/5 dark:inset-ring dark:inset-ring-white/10">
            <p className="flex-none text-3xl font-bold tracking-tight text-gray-900 dark:text-white">250k</p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                Usuários na plataforma
              </p>
              <p className="mt-2 text-base/7 text-gray-600 dark:text-gray-300">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-gray-900 p-8 sm:flex-row-reverse sm:items-end lg:w-full lg:max-w-sm lg:flex-auto lg:flex-col lg:items-start lg:gap-y-44 dark:bg-gray-700 dark:inset-ring dark:inset-ring-white/10">
            <p className="flex-none text-3xl font-bold tracking-tight text-white">US$ 8,9 bilhões</p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight text-white">
                Temos orgulho de nossos clientes terem gerado mais de US$ 8 bilhões em receita total.
              </p>
              <p className="mt-2 text-base/7 text-gray-400 dark:text-gray-300">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-indigo-600 p-8 sm:w-11/12 sm:max-w-xl sm:flex-row-reverse sm:items-end lg:w-full lg:max-w-none lg:flex-auto lg:flex-col lg:items-start lg:gap-y-28 dark:inset-ring dark:inset-ring-white/10">
            <p className="flex-none text-3xl font-bold tracking-tight text-white">401,093</p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight text-white">Transações neste ano</p>
              <p className="mt-2 text-base/7 text-indigo-200 dark:text-indigo-100">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
