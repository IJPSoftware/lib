import { Box, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import React from 'react'

const FormPanelRoot = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 32px 16px;
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

export type OnFormSubmit = (form?: { name?: string; email?: string }) => void

export type FormPanelProps = {
  onSubmit?: OnFormSubmit
  nameLabel: React.ReactNode
  emailLabel: React.ReactNode
  submitLabel: React.ReactNode
  title: React.ReactNode
}

export const FormPanel: React.FC<FormPanelProps> = ({
  onSubmit,
  nameLabel,
  emailLabel,
  submitLabel,
  title,
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
    <FormPanelRoot>
      <FormTitle>{title}</FormTitle>
      <FormLabel>
        <span>{nameLabel}</span>
        <FormInput id="name" name="name" onChange={handleChange} />
      </FormLabel>
      <FormLabel>
        <span>{emailLabel}</span>
        <FormInput
          id="email"
          name="email"
          onChange={handleChange}
          type="email"
        />
      </FormLabel>
      <FormButton onClick={handleSubmit}>{submitLabel}</FormButton>
    </FormPanelRoot>
  )
}
