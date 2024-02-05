import { InputWrapper } from '@/components/shared/InputWrapper'
import { passwordRules } from '@/config/constants'
import { Box, TextField as MUITextField } from '@mui/material'
import { Button } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export const RecoverPasswordForm = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'recoverPasswordForm',
  })

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm({ defaultValues: { email: '' }, mode: 'onChange' })

  const onSubmit = (data: { email: string }) => {
    console.log(data)
  }
  return (
    <Box noValidate component="form" onSubmit={handleSubmit(onSubmit)}>
      <InputWrapper error={errors['email'] as { message: string }}>
        <MUITextField
          sx={{ mb: 2, my: 2 }}
          id="email"
          label={t('email')}
          required={true}
          autoComplete="email"
          {...register('email', {
            pattern: { value: passwordRules.email, message: t('emailPattern') },
          })}
        ></MUITextField>
      </InputWrapper>
      <Button disabled={!isValid} variant="contained" type="submit" sx={{ width: 95, mt: 2 }}>
        {t('send')}
      </Button>
    </Box>
  )
}
