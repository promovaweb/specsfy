import { CameraIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <div className="overflow-hidden bg-white">
      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="absolute top-0 bottom-0 left-3/4 hidden w-screen bg-gray-50 lg:block" />
        <div className="mx-auto max-w-prose text-base lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 className="text-lg font-semibold text-indigo-600">Estudo de caso</h2>
            <h3 className="mt-2 text-3xl/8 font-bold tracking-tight text-gray-900 sm:text-4xl">Conheça Whitney</h3>
          </div>
        </div>
        <div className="mt-8 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="relative lg:col-start-2 lg:row-start-1">
            <svg
              fill="none"
              width={404}
              height={384}
              viewBox="0 0 404 384"
              aria-hidden="true"
              className="absolute top-0 right-0 -mt-20 -mr-20 hidden lg:block"
            >
              <defs>
                <pattern
                  x={0}
                  y={0}
                  id="de316486-4a29-4312-bdfc-fbce2132a2c1"
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect x={0} y={0} fill="currentColor" width={4} height={4} className="text-gray-200" />
                </pattern>
              </defs>
              <rect fill="url(#de316486-4a29-4312-bdfc-fbce2132a2c1)" width={404} height={384} />
            </svg>
            <div className="relative mx-auto max-w-prose text-base lg:max-w-none">
              <figure>
                <img
                  alt="Whitney apoiada em uma grade numa rua do centro"
                  src="https://images.unsplash.com/photo-1546913199-55e06682967e?ixlib=rb-1.2.1&auto=format&fit=crop&crop=focalpoint&fp-x=.735&fp-y=.55&w=1184&h=1376&q=80"
                  width={1184}
                  height={1376}
                  className="aspect-12/7 w-full rounded-lg object-cover shadow-lg lg:aspect-auto"
                />
                <figcaption className="mt-3 flex text-sm text-gray-500">
                  <CameraIcon aria-hidden="true" className="size-5 flex-none text-gray-400" />
                  <span className="ml-2">Fotografia de Marcus O'Leary</span>
                </figcaption>
              </figure>
            </div>
          </div>
          <div className="mt-8 lg:mt-0">
            <div className="mx-auto text-base/7 text-gray-500">
              <p className="text-lg/7">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <p className="mt-5">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <p className="mt-5">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <p className="mt-5">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <ul role="list" className="mt-5 list-disc space-y-2 pl-6 marker:text-gray-300">
                <li className="pl-2">Decisões claras ajudam a equipe a manter o foco.</li>
                <li className="pl-2">O contexto compartilhado reduz dúvidas durante a execução.</li>
                <li className="pl-2">Resultados verificáveis orientam cada nova etapa.</li>
              </ul>
              <p className="mt-5">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <h3 className="mt-8 text-xl/8 font-semibold text-gray-900">Como ajudamos</h3>
              <p className="mt-3">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <p className="mt-5">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
