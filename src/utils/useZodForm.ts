import { useForm, UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export const useZodForm = <TSchema extends z.ZodType>(
    props: Omit<UseFormProps<TSchema['_input']>, 'resolver'> & {
        schema: TSchema
    },
) => {
    const form = useForm<TSchema['_input']>({
        ...props,
        mode: 'all',
        resolver: zodResolver(props.schema, undefined),
    })

    return form
}
