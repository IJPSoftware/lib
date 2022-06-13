import { Box, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import React from 'react'

const FormPanelRoot = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 32px 16px;

  border-radius: 4px;
  background-color: #181a1f;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.25),
    2px 2px 4px -2px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`

const FormTitle = styled('h2')`
  margin: 0 0 8px 0;
`

const FormLabel = styled('label')`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 16px;
  color: #abb2bf;
`

const FormInput = styled('input')`
  background-color: #5c6370;
  color: #ffffff;
  font-size: 16px;
  border-radius: 4px;
  padding: 4px 8px;
  border: none;
  box-shadow: inset 1px 1px 4px 1px rgba(0, 0, 0, 0.25),
    inset 2px 2px 4px -2px rgba(0, 0, 0, 0.25);
`

const FormButton = styled(Button)`
  margin-top: 16px;
  outline: 0;
  border: 0;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #61afef;
`

export type OnFormSubmit = (form?: { email?: string; name?: string }) => void

export type FormPanelTexts = {
  formEmailLabel?: React.ReactNode
  formNameLabel?: React.ReactNode
  formSubmitLabel?: React.ReactNode
  formTitle?: React.ReactNode
}

export type FormPanelClassNames = {
  FormButton?: string
  FormInput?: string
  FormLabel?: string
  FormPanelRoot?: string
  FormTitle?: string
}

export type FormPanelProps = {
  classNames?: FormPanelClassNames
  onSubmit?: OnFormSubmit
  texts?: FormPanelTexts
}

export const FormPanel: React.FC<FormPanelProps> = ({
  classNames,
  onSubmit,
  texts = {
    formEmailLabel: 'emailLabel',
    formNameLabel: 'nameLabel',
    formSubmitLabel: 'submitLabel',
    formTitle: 'title',
  },
}) => {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target
      switch (name) {
        case 'name':
          setName(value)
          break
        case 'email':
          setEmail(value)
          break
      }
    },
    [],
  )

  const handleSubmit = React.useCallback(() => {
    onSubmit?.({
      name,
      email,
    })
  }, [onSubmit, name, email])

  return (
    <FormPanelRoot className={classNames?.FormPanelRoot}>
      <FormTitle className={classNames?.FormTitle}>{texts.formTitle}</FormTitle>
      <FormLabel className={classNames?.FormLabel}>
        <span>{texts.formNameLabel}</span>
        <FormInput
          className={classNames?.FormInput}
          id="name"
          name="name"
          onChange={handleChange}
        />
      </FormLabel>
      <FormLabel className={classNames?.FormLabel}>
        <span>{texts.formEmailLabel}</span>
        <FormInput
          className={classNames?.FormInput}
          id="email"
          name="email"
          onChange={handleChange}
          type="email"
        />
      </FormLabel>
      <FormButton className={classNames?.FormButton} onClick={handleSubmit}>
        {texts.formSubmitLabel}
      </FormButton>
    </FormPanelRoot>
  )
}
