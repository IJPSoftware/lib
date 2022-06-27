import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import SocketIOClient, { Socket } from 'socket.io-client'

import { Message } from './src/chat-message'
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
import { apiFetch, Result } from './src/helper'

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

export type ChatBoxConfig = {
  accessToken: string
  apiEndPoint: string
  chatEndPoint: string
}

export type ChatBoxProps = {
  chatSubmitIcon: React.ReactNode
  classNames?: ChatBoxClassNames
  config: ChatBoxConfig
  defaultShow?: boolean
  floatingButtonIcon: React.ReactNode
  onAgentsOnline?: (online: boolean) => void
  onClose?: () => void
  onFormSubmit?: OnFormSubmit
  onOpen?: () => void
  open?: boolean
  show?: boolean
  texts: ChatBoxTexts
  withForm?: boolean
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  chatSubmitIcon,
  classNames,
  config: { accessToken, apiEndPoint, chatEndPoint },
  floatingButtonIcon,
  onAgentsOnline,
  onClose,
  onOpen,
  open = false,
  show = false,
  texts,
  withForm = false,
}) => {
  const socket = React.useRef<Socket>()
  const [type, setType] = React.useState<'form' | 'chat' | null>(null)
  const [sessionID, setSessionID] = React.useState('')
  const messagesRef = React.useRef<Message[]>([])
  const [chatSessionID, setChatSessionID] = React.useState<number>()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [agentTyping, setAgentTyping] = React.useState(false)
  const [agentDisconnected, setAgentDisconnected] = React.useState<Message>()
  const [tempMessages, setTempMessages] = React.useState<Message[]>([])

  const handleSubmit = React.useCallback<(session?: string) => OnFormSubmit>(
    session => async form => {
      setSessionID('')

      const data = await apiFetch(
        `${apiEndPoint}/${accessToken}/company_customer`,
        {
          body: JSON.stringify({
            email: form?.email,
            name: form?.name,
            sessionId: session,
          }),
          method: 'POST',
        },
      )

      if (data.session) {
        localStorage.setItem('sessionID', data.session)
        setSessionID(data.session)
      }
    },
    [accessToken, apiEndPoint],
  )

  const handleClearChatSessionID = React.useCallback(() => {
    localStorage.removeItem('chatSessionID')
    setChatSessionID(undefined)
  }, [])

  const handleAgentDisconnected = React.useCallback(
    (data: Message) => {
      setAgentDisconnected(data)
      setTimeout(() => {
        setType(null)
        handleClearChatSessionID()
        setMessages([])
        messagesRef.current = []
        setAgentTyping(false)
        setAgentDisconnected(undefined)
        onClose?.()
      }, 5000)
    },
    [handleClearChatSessionID, onClose],
  )

  const handleSetChatSessionID = React.useCallback(async (id: number) => {
    setChatSessionID(id)
    localStorage.setItem('chatSessionID', id.toString())
  }, [])

  const handleShow = React.useCallback(() => {
    open ? onClose?.() : onOpen?.()
  }, [onClose, onOpen, open])

  const handleTempMessage = React.useCallback(
    (message: Message) => {
      setTempMessages([...tempMessages, message])
      setMessages([...messages, message])
    },
    [messages, tempMessages],
  )

  const getSessionID = React.useCallback(() => {
    const session = localStorage.getItem('sessionID') ?? undefined
    if (session || !withForm) {
      handleSubmit(session)()
    }
  }, [handleSubmit, withForm])

  const loadChatSessionID = React.useCallback(() => {
    const chatSession = localStorage.getItem('chatSessionID') ?? undefined
    if (chatSession) {
      setChatSessionID(+chatSession)
    }
    return chatSession
  }, [])

  const getMessages = React.useCallback(async () => {
    if (sessionID && chatSessionID && messages.length === 0 && open) {
      const [newMessages, error] = await Result.try<{ messages: Message[] }>(
        apiFetch(`${apiEndPoint}/message/${chatSessionID}`, sessionID),
      )

      if (error) {
        handleClearChatSessionID()
      } else if (newMessages && newMessages.messages) {
        setMessages(
          newMessages.messages.map(el => ({
            message: el.message,
            from: el.from === 'anonymous' ? undefined : el.from,
            timestamp: new Date(el.timestamp ?? 0).getTime() / 1000,
          })),
        )
      }
    }
  }, [
    apiEndPoint,
    chatSessionID,
    messages.length,
    open,
    sessionID,
    handleClearChatSessionID,
  ])

  React.useEffect(() => {
    if (onAgentsOnline) {
      getSessionID()
    }
  }, [getSessionID, onAgentsOnline])

  React.useEffect(() => {
    if (!onAgentsOnline && show) {
      getSessionID()
    }
  }, [getSessionID, onAgentsOnline, show])

  React.useEffect(() => {
    messagesRef.current = [...messages]
  }, [messages])

  React.useEffect(() => {
    getMessages()
  }, [getMessages])

  React.useEffect(() => {
    if (open && sessionID) {
      const id = loadChatSessionID()
      if (!id) {
        apiFetch(`${apiEndPoint}/company_customer/request_support`, sessionID, {
          method: 'POST',
        })
      }
    }
  }, [apiEndPoint, sessionID, open, chatSessionID, loadChatSessionID])

  React.useEffect(() => {
    if (chatSessionID && tempMessages.length) {
      const messages = [...tempMessages]
      setTempMessages([])
      Result.try(
        apiFetch(
          `${apiEndPoint}/message/${chatSessionID}/send_bulk_messages`,
          sessionID,
          {
            body: JSON.stringify({
              messages,
            }),
            method: 'POST',
          },
        ),
      )
    }
  }, [apiEndPoint, chatSessionID, sessionID, tempMessages])

  React.useEffect(() => {
    if (!socket.current && sessionID && (onAgentsOnline || show)) {
      socket.current = SocketIOClient(`${chatEndPoint}`, {
        query: {
          name: sessionID,
        },
        transports: ['websocket'],
      })
    }

    if (socket.current) {
      if (onAgentsOnline) {
        socket.current.on('agents.online', ({ online }) => {
          onAgentsOnline(online)
        })
      }

      if (show) {
        socket.current
          .on('agent.connected', data => {
            if (Array.isArray(data.chatSessionId)) {
              handleSetChatSessionID(data.chatSessionId.at(-1))
            } else {
              handleSetChatSessionID(data.chatSessionId)
            }
          })
          .on('message', data => {
            setMessages([...messagesRef.current, data])
          })
          .on('agent.typing', _ => {
            setAgentTyping(true)
          })
          .on('agent.stopTyping', _ => {
            setAgentTyping(false)
          })
          .on('agent.completed', data => {
            handleAgentDisconnected(data)
          })
      }
    }
  }, [
    chatEndPoint,
    sessionID,
    handleAgentDisconnected,
    onAgentsOnline,
    show,
    handleSetChatSessionID,
  ])

  React.useEffect(
    () => () => {
      if (!show && !open && !sessionID && !chatSessionID) {
        socket.current?.disconnect()
      }
    },
    [chatSessionID, open, sessionID, show],
  )

  React.useEffect(() => {
    if (open) {
      setType(withForm ? 'form' : 'chat')
    }
  }, [open, withForm])

  const Root = React.useCallback<React.FC<{ children?: React.ReactNode }>>(
    ({ children }) => (
      <ChatBoxRoot className={classNames?.ChatBoxRoot}>
        {show && (
          <>
            {open && (
              <AnimatePresence initial={false}>
                <motion.div
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                    transition: { duration: 0.2 },
                  }}
                  initial={{ opacity: 0, y: 50, scale: 0.3 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            )}
            <ChatBoxFloatingButton onClick={handleShow}>
              {floatingButtonIcon}
            </ChatBoxFloatingButton>
          </>
        )}
      </ChatBoxRoot>
    ),
    [classNames?.ChatBoxRoot, show, open, handleShow, floatingButtonIcon],
  )

  if (sessionID && withForm && type === 'form')
    return (
      <Root>
        <FormPanel
          classNames={classNames}
          onSubmit={handleSubmit()}
          texts={texts}
        />
      </Root>
    )

  if (sessionID && type === 'chat')
    return (
      <Root>
        <ChatPanel
          agentDisconnected={agentDisconnected}
          agentTyping={agentTyping}
          apiEndPoint={apiEndPoint}
          chatID={chatSessionID}
          classNames={classNames}
          messages={messages}
          onTempMessage={handleTempMessage}
          sessionID={sessionID}
          submitIcon={chatSubmitIcon}
          texts={texts}
        />
      </Root>
    )

  return <Root />
}
