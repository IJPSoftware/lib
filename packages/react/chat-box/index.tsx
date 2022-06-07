import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import React from 'react'

import { ChatPanel } from './src/chat-panel'
import { FormPanel, OnFormSubmit } from './src/form-panel'

const ChatBoxRoot = styled(Box)`
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 320px;
  z-index: 10000;
  border-radius: 4px;
  background-color: #181a1f;
  overflow: hidden;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.25),
    2px 2px 4px -2px rgba(0, 0, 0, 0.25);
`

export type ChatBoxProps = {
  chatSubmitIcon: React.ReactNode
  onFormSubmit?: OnFormSubmit
  formNameLabel?: React.ReactNode
  formEmailLabel?: React.ReactNode
  formSubmitLabel?: React.ReactNode
  formTitle?: React.ReactNode
  chatEndPoint: string
  apiEndPoint: string
  withForm?: boolean
  accessToken: string
  chatInputPlaceholder: string
  noAgentConnectedMessage: string
  agentDisconnectedMessage: string
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  chatSubmitIcon,
  formNameLabel,
  formEmailLabel,
  formSubmitLabel,
  formTitle,
  chatEndPoint,
  apiEndPoint,
  accessToken,
  withForm = false,
  chatInputPlaceholder,
  noAgentConnectedMessage,
  agentDisconnectedMessage,
}) => {
  const [type, setType] = React.useState<'form' | 'chat' | null>(null)
  const [chatSessionID, setChatSessionID] = React.useState('')

  const handleSubmit = React.useCallback<(session?: string) => OnFormSubmit>(
    session => async form => {
      setChatSessionID('')

      const data = await fetch(
        `${apiEndPoint}/${accessToken}/company_customer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: session,
            name: form?.name,
            email: form?.email,
          }),
        },
      ).then(res => res.json())

      console.log(data.session)

      if (data.session) {
        localStorage.setItem('chatSessionID', data.session)
        setChatSessionID(data.session)
        setType('chat')
      }
    },
    [accessToken, apiEndPoint],
  )

  const handleAgentDisconnected = React.useCallback(() => {
    setTimeout(() => {
      setType(null)
      setChatSessionID('')
      localStorage.removeItem('chatSessionID')
    }, 5000)
  }, [])

  React.useEffect(() => {
    const session = localStorage.getItem('chatSessionID') ?? undefined
    if (session || !withForm) {
      handleSubmit(session)()
    }
  }, [handleSubmit, withForm])

  const renderContent = React.useMemo(() => {
    if (type === 'form' && withForm)
      return (
        <FormPanel
          emailLabel={formEmailLabel}
          nameLabel={formNameLabel}
          onSubmit={handleSubmit()}
          submitLabel={formSubmitLabel}
          title={formTitle}
        />
      )
    if (type === 'chat' && chatSessionID)
      return (
        <ChatPanel
          agentDisconnectedMessage={agentDisconnectedMessage}
          apiEndPoint={apiEndPoint}
          chatEndPoint={chatEndPoint}
          inputPlaceholder={chatInputPlaceholder}
          noAgentConnectedMessage={noAgentConnectedMessage}
          onAgentDisconnected={handleAgentDisconnected}
          sessionID={chatSessionID}
          submitIcon={chatSubmitIcon}
        />
      )

    return null
  }, [
    apiEndPoint,
    chatEndPoint,
    chatInputPlaceholder,
    chatSessionID,
    chatSubmitIcon,
    formEmailLabel,
    formNameLabel,
    formSubmitLabel,
    formTitle,
    handleSubmit,
    type,
    withForm,
  ])

  return <ChatBoxRoot>{renderContent}</ChatBoxRoot>
}
