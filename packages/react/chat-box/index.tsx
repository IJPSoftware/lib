import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

import {
  ChatPanel,
  ChatPanelClassNames,
  ChatPanelTexts,
} from './src/chat-panel'
import {
  FormPanel,
  FormPanelClassNames,
  FormPanelTexts,
  OnFormSubmit,
} from './src/form-panel'

const ChatBoxRoot = styled(Box)`
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 320px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ChatBoxFloatingButton = styled('button')`
  background-color: #61afef;
  outline: none;
  border: none;
  width: 48px;
  height: 48px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: flex-end;
  border-radius: 50%;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.25),
    2px 2px 4px -2px rgba(0, 0, 0, 0.25);

  &:disabled {
    cursor: default;
    svg path {
      stroke: #ffffffaa;
    }
  }

  svg {
    font-size: 24px;
    path {
      stroke: #181a1f;
    }
  }
`

export type ChatBoxClassNames = FormPanelClassNames &
  ChatPanelClassNames & {
    ChatBoxRoot?: string
  }

export type ChatBoxTexts = FormPanelTexts & ChatPanelTexts

export type ChatBoxProps = {
  accessToken: string
  apiEndPoint: string
  chatEndPoint: string
  chatSubmitIcon: React.ReactNode
  classNames?: ChatBoxClassNames
  defaultShow?: boolean
  floatingButtonIcon: React.ReactNode
  onClose?: () => void
  onFormSubmit?: OnFormSubmit
  onOpen?: () => void
  open?: boolean
  texts: ChatBoxTexts
  withForm?: boolean
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  accessToken,
  apiEndPoint,
  chatEndPoint,
  chatSubmitIcon,
  classNames,
  defaultShow = false,
  floatingButtonIcon,
  onClose,
  onOpen,
  open,
  texts,
  withForm = false,
}) => {
  const [show, setShow] = React.useState(defaultShow)
  const [type, setType] = React.useState<'form' | 'chat' | null>(null)
  const [chatSessionID, setChatSessionID] = React.useState('')

  const handleSubmit = React.useCallback<(session?: string) => OnFormSubmit>(
    session => async form => {
      setChatSessionID('')

      const data = await fetch(
        `${apiEndPoint}/${accessToken}/company_customer`,
        {
          body: JSON.stringify({
            email: form?.email,
            name: form?.name,
            sessionId: session,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
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
    localStorage.removeItem('chatSessionID')
    setTimeout(() => {
      setType(null)
      setChatSessionID('')
    }, 5000)
  }, [])

  const handleShow = React.useCallback(() => {
    const newShow = !show
    newShow ? onOpen?.() : onClose?.()
    setShow(newShow)
  }, [onClose, onOpen, show])

  React.useEffect(() => {
    const session = localStorage.getItem('chatSessionID') ?? undefined
    if (session || !withForm) {
      handleSubmit(session)()
    }
  }, [handleSubmit, withForm])

  React.useEffect(() => {
    if (typeof open !== 'undefined' && open !== show) {
      setShow(open)
    }
  }, [open, show])

  const Root = React.useCallback<React.FC<{ children?: React.ReactNode }>>(
    ({ children }) => (
      <ChatBoxRoot className={classNames?.ChatBoxRoot}>
        {show && (
          <AnimatePresence initial={false}>
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        )}
        <ChatBoxFloatingButton onClick={handleShow}>
          {floatingButtonIcon}
        </ChatBoxFloatingButton>
      </ChatBoxRoot>
    ),
    [classNames?.ChatBoxRoot, show, handleShow, floatingButtonIcon],
  )

  if (withForm && type === 'form')
    return (
      <Root>
        <FormPanel
          classNames={classNames}
          onSubmit={handleSubmit()}
          texts={texts}
        />
      </Root>
    )

  if (chatSessionID && type === 'chat')
    return (
      <Root>
        <ChatPanel
          apiEndPoint={apiEndPoint}
          chatEndPoint={chatEndPoint}
          classNames={classNames}
          onAgentDisconnected={handleAgentDisconnected}
          sessionID={chatSessionID}
          submitIcon={chatSubmitIcon}
          texts={texts}
        />
      </Root>
    )

  return <Root />
}
