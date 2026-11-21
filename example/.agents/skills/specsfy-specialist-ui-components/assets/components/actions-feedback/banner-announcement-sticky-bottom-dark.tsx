import { XMarkIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <>
      {/*
        Adicione espaçamento inferior às páginas que usam este banner fixo para evitar que ele cubra o conteúdo.
      */}
      <div className="fixed inset-x-0 bottom-0">
        <div className="flex items-center gap-x-6 bg-gray-900 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 dark:bg-gray-800 dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:top-0 dark:after:h-px dark:after:bg-white/10">
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
          <div className="flex flex-1 justify-end">
            <button type="button" className="-m-3 p-3 focus-visible:-outline-offset-4">
              <span className="sr-only">Dispensar</span>
              <XMarkIcon aria-hidden="true" className="size-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
