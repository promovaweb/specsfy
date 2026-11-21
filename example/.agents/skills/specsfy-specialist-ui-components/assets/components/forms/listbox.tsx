'use client'

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { Fragment } from 'react'

export function Listbox<T>({
  className,
  placeholder,
  autoFocus,
  'aria-label': ariaLabel,
  children: options,
  ...props
}: {
  className?: string
  placeholder?: React.ReactNode
  autoFocus?: boolean
  'aria-label'?: string
  children?: React.ReactNode
} & Omit<Headless.ListboxProps<typeof Fragment, T>, 'as' | 'multiple'>) {
  return (
    <Headless.Listbox {...props} multiple={false}>
      <Headless.ListboxButton
        autoFocus={autoFocus}
        data-slot="control"
        aria-label={ariaLabel}
        className={clsx([
          className,
          // Layout básico
          'group relative block w-full',
          // Cor de fundo e sombra aplicadas ao pseudoelemento interno para integrar a sombra à borda no modo claro
          'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm',
          // No modo escuro, a cor de fundo passa ao controle e a sombra é removida; por isso, o pseudoelemento `before` fica oculto
          'dark:before:hidden',
          // Oculta os estilos de foco padrão
          'focus:outline-hidden',
          // Anel de foco
          'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset data-focus:after:ring-2 data-focus:after:ring-blue-500',
          // Estado desabilitado
          'data-disabled:opacity-50 data-disabled:before:bg-zinc-950/5 data-disabled:before:shadow-none',
        ])}
      >
        <Headless.ListboxSelectedOption
          as="span"
          options={options}
          placeholder={placeholder && <span className="block truncate text-zinc-500">{placeholder}</span>}
          className={clsx([
            // Layout básico
            'relative block w-full appearance-none rounded-lg py-[calc(--spacing(2.5)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
            // Define a altura mínima quando nenhum valor está selecionado
            'min-h-11 sm:min-h-9',
            // Espaçamento horizontal
            'pr-[calc(--spacing(7)-1px)] pl-[calc(--spacing(3.5)-1px)] sm:pl-[calc(--spacing(3)-1px)]',
            // Tipografia
            'text-left text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
            // Borda
            'border border-zinc-950/10 group-data-active:border-zinc-950/20 group-data-hover:border-zinc-950/20 dark:border-white/10 dark:group-data-active:border-white/20 dark:group-data-hover:border-white/20',
            // Cor de fundo
            'bg-transparent dark:bg-white/5',
            // Estado inválido
            'group-data-invalid:border-red-500 group-data-hover:group-data-invalid:border-red-500 dark:group-data-invalid:border-red-600 dark:data-hover:group-data-invalid:border-red-600',
            // Estado desabilitado
            'group-data-disabled:border-zinc-950/20 group-data-disabled:opacity-100 dark:group-data-disabled:border-white/15 dark:group-data-disabled:bg-white/2.5 dark:group-data-disabled:data-hover:border-white/15',
          ])}
        />
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className="size-5 stroke-zinc-500 group-data-disabled:stroke-zinc-600 sm:size-4 dark:stroke-zinc-400 forced-colors:stroke-[CanvasText]"
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
          >
            <path d="M5.75 10.75L8 13L10.25 10.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.25 5.25L8 3L5.75 5.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Headless.ListboxButton>
      <Headless.ListboxOptions
        transition
        anchor="selection start"
        className={clsx(
          // Posicionamento da âncora
          '[--anchor-offset:-1.625rem] [--anchor-padding:--spacing(4)] sm:[--anchor-offset:-1.375rem]',
          // Estilos base
          'isolate w-max min-w-[calc(var(--button-width)+1.75rem)] scroll-py-1 rounded-xl p-1 select-none',
          // Borda invisível, exibida apenas no modo `forced-colors` para acessibilidade
          'outline outline-transparent focus:outline-hidden',
          // Controla a rolagem quando o menu não cabe na viewport
          'overflow-y-scroll overscroll-contain',
          // Fundo do popover
          'bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75',
          // Sombras
          'shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 dark:ring-inset',
          // Transições
          'transition-opacity duration-100 ease-in data-closed:data-leave:opacity-0 data-transition:pointer-events-none'
        )}
      >
        {options}
      </Headless.ListboxOptions>
    </Headless.Listbox>
  )
}

export function ListboxOption<T>({
  children,
  className,
  ...props
}: { className?: string; children?: React.ReactNode } & Omit<
  Headless.ListboxOptionProps<'div', T>,
  'as' | 'className'
>) {
  let sharedClasses = clsx(
    // Base
    'flex min-w-0 items-center',
    // Ícones
    '*:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 sm:*:data-[slot=icon]:size-4',
    '*:data-[slot=icon]:text-zinc-500 group-data-focus/option:*:data-[slot=icon]:text-white dark:*:data-[slot=icon]:text-zinc-400',
    'forced-colors:*:data-[slot=icon]:text-[CanvasText] forced-colors:group-data-focus/option:*:data-[slot=icon]:text-[Canvas]',
    // Avatares
    '*:data-[slot=avatar]:-mx-0.5 *:data-[slot=avatar]:size-6 sm:*:data-[slot=avatar]:size-5'
  )

  return (
    <Headless.ListboxOption as={Fragment} {...props}>
      {({ selectedOption }) => {
        if (selectedOption) {
          return <div className={clsx(className, sharedClasses)}>{children}</div>
        }

        return (
          <div
            className={clsx(
              // Layout básico
              'group/option grid cursor-default grid-cols-[--spacing(5)_1fr] items-baseline gap-x-2 rounded-lg py-2.5 pr-3.5 pl-2 sm:grid-cols-[--spacing(4)_1fr] sm:py-1.5 sm:pr-3 sm:pl-1.5',
              // Tipografia
              'text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
              // Foco
              'outline-hidden data-focus:bg-blue-500 data-focus:text-white',
              // Modo de cores forçadas
              'forced-color-adjust-none forced-colors:data-focus:bg-[Highlight] forced-colors:data-focus:text-[HighlightText]',
              // Desabilitado
              'data-disabled:opacity-50'
            )}
          >
            <svg
              className="relative hidden size-5 self-center stroke-current group-data-selected/option:inline sm:size-4"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 8.5l3 3L12 4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={clsx(className, sharedClasses, 'col-start-2')}>{children}</span>
          </div>
        )
      }}
    </Headless.ListboxOption>
  )
}

export function ListboxLabel({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return <span {...props} className={clsx(className, 'ml-2.5 truncate first:ml-0 sm:ml-2 sm:first:ml-0')} />
}

export function ListboxDescription({ className, children, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        'flex flex-1 overflow-hidden text-zinc-500 group-data-focus/option:text-white before:w-2 before:min-w-0 before:shrink dark:text-zinc-400'
      )}
    >
      <span className="flex-1 truncate">{children}</span>
    </span>
  )
}
