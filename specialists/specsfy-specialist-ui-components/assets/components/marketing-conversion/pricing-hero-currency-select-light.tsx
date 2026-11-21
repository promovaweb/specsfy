import { ChevronDownIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:flex lg:justify-between lg:px-8">
        <div className="max-w-xl">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">Planos e preços</h2>
          <p className="mt-5 text-xl text-gray-500">
            Comece gratuitamente e adicione um plano para publicar. Os planos da conta liberam recursos adicionais.
          </p>
        </div>
        <div className="mt-10 w-full max-w-xs">
          <label htmlFor="currency" className="block text-base font-medium text-gray-500">
            Moeda
          </label>
          <div className="relative mt-1.5">
            <select
              id="currency"
              name="currency"
              defaultValue="Estados Unidos (USD)"
              className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-base text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden sm:text-sm"
            >
              <option>Argentina (ARS)</option>
              <option>Austrália (AUD)</option>
              <option>Estados Unidos (USD)</option>
              <option>Canadá (CAD)</option>
              <option>França (EUR)</option>
              <option>Japão (JPY)</option>
              <option>Nigéria (NGN)</option>
              <option>Suíça (CHF)</option>
              <option>Reino Unido (GBP)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDownIcon aria-hidden="true" className="size-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
