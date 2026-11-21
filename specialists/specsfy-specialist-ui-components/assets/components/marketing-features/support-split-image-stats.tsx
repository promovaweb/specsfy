import { UsersIcon } from '@heroicons/react/24/outline'

export default function Example() {
  return (
    <div className="relative bg-white">
      <div className="h-56 bg-indigo-600 sm:h-72 lg:absolute lg:left-0 lg:h-full lg:w-1/2">
        <img
          alt="Equipe de suporte"
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
          className="size-full object-cover"
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-2xl lg:mr-0 lg:ml-auto lg:w-1/2 lg:max-w-none lg:pl-10">
          <div>
            <div className="flex size-12 items-center justify-center rounded-md bg-indigo-500 text-white">
              <UsersIcon aria-hidden="true" className="size-6" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Entregue sempre o que seus clientes esperam
          </h2>
          <p className="mt-6 text-lg text-gray-500">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
          <div className="mt-8 overflow-hidden">
            <dl className="-mx-8 -mt-8 flex flex-wrap">
              <div className="flex flex-col px-8 pt-8">
                <dt className="order-2 text-base font-medium text-gray-500">Entrega</dt>
                <dd className="order-1 text-2xl font-bold text-indigo-600 sm:text-3xl sm:tracking-tight">24/7</dd>
              </div>
              <div className="flex flex-col px-8 pt-8">
                <dt className="order-2 text-base font-medium text-gray-500">Calabresa</dt>
                <dd className="order-1 text-2xl font-bold text-indigo-600 sm:text-3xl sm:tracking-tight">99.9%</dd>
              </div>
              <div className="flex flex-col px-8 pt-8">
                <dt className="order-2 text-base font-medium text-gray-500">Calorias</dt>
                <dd className="order-1 text-2xl font-bold text-indigo-600 sm:text-3xl sm:tracking-tight">100k+</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
