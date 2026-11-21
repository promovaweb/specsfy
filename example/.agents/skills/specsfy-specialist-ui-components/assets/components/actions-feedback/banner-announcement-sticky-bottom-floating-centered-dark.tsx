import { XMarkIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <>
      {/*
        Adicione espaçamento inferior às páginas que usam este banner fixo para evitar que ele cubra o conteúdo.
      */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 sm:flex sm:justify-center sm:px-6 sm:pb-5 lg:px-8">
        <div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-gray-900 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pr-3.5 sm:pl-4 dark:bg-gray-800 dark:inset-ring dark:inset-ring-white/10">
          <p className="text-sm/6 text-white">
            <a href="#">
              <strong className="font-semibold">GeneriCon 2023</strong>
              <svg viewBox="0 0 2 2" aria-hidden="true" className="mx-2 inline size-0.5 fill-current">
                <circle r={1} cx={1} cy={1} />
              </svg>
              Encontre-nos em Denver de 7 a 9 de junho para conhecer as novidades&nbsp;
              <span aria-hidden="true">&rarr;</span>
            </a>
          </p>
          <button type="button" className="-m-1.5 flex-none p-1.5">
            <span className="sr-only">Dispensar</span>
            <XMarkIcon aria-hidden="true" className="size-5 text-white" />
          </button>
        </div>
      </div>
    </>
  )
}
