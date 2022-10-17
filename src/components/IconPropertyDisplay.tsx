import { trpc } from '~/utils/trpc'
import { ReactNode } from 'react'

interface IconPropertyDisplayProps {
    value: string | undefined
    children: ReactNode
    identifier: string
}

export const IconPropertyDisplay = ({ value, children, identifier }: IconPropertyDisplayProps) => {
    return (
        <div className={'flex flex-row items-center gap-1'}>
            {children}
            <div id={`header-property-${identifier}`}>{value}</div>
        </div>
    )
}
