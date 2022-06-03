import { Box, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import React, { useRef } from 'react'
import SocketIOClient, { Socket } from 'socket.io-client'

import { ChatMessage, Message } from './chat-message'

const ChatPanelRoot = styled(Box)``

const ChatPanelHeader = styled(Box)`
  background-color: #61afef;
  color: #181a1f;
  padding: 4px 8px;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.25),
    2px 2px 4px -2px rgba(0, 0, 0, 0.25);
`

const ChatPanelHeaderTitle = styled(Box)`
  margin: 0;
`

const ChatPanelBody = styled(Box)`
  height: 400px;
  box-shadow: inset 1px 1px 4px 1px rgba(0, 0, 0, 0.25),
    inset 2px 2px 4px -2px rgba(0, 0, 0, 0.25);
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  scrollbar-color: #5c6370 #181a1f;
  scrollbar-width: 0.8rem;

  &::-webkit-scrollbar {
    width: 0.8rem;
  }

  &::-webkit-scrollbar-track {
    background-color: #181a1f;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #5c6370;
  }
`

const ChatPanelFooter = styled(Box)`
  background-color: #5c6370;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.25),
    2px 2px 4px -2px rgba(0, 0, 0, 0.25);
`

const ChatPanelForm = styled('form')`
  gap: 4px;
  display: flex;
  align-items: center;
`

const ChatPanelFormInput = styled('input')`
  flex-grow: 1;
  background-color: transparent;
  border: none;
  color: #ffffff;
  padding: 8px 17px;

  &:focus-visible {
    outline: 0;
  }

  &::placeholder {
    color: #ffffffaa;
    font-style: italic;
  }
`

const ChatPanelFormButton = styled(Button)`
  background-color: transparent;
  outline: none;
  border: none;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  &:disabled {
    cursor: default;
    svg path {
      stroke: #ffffffaa;
    }
  }

  svg path {
    stroke: #fafafa;
  }
`

export type ChatPanelProps = {
  submitIcon: React.ReactNode
  inputPlaceholder: string
  chatEndPoint: string
  apiEndPoint: string
  sessionID?: string
  noAgentConnectedMessage: string
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  submitIcon,
  chatEndPoint,
  apiEndPoint,
  inputPlaceholder,
  sessionID,
  noAgentConnectedMessage,
}) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const socket = useRef<Socket>()
  const messagesRef = useRef<Message[]>([])
  const [chatID, setChatID] = React.useState<number>()
  const [message, setMessage] = React.useState('')
  const [messages, setMessages] = React.useState<Message[]>([])

  const handleSubmit = React.useCallback<
    React.EventHandler<React.FormEvent | React.MouseEvent>
  >(
    async event => {
      event.preventDefault()

      await fetch(`${apiEndPoint}/message/${chatID}/send_message`, {
        method: 'POST',
        body: JSON.stringify({
          sessionId: sessionID,
          message,
        }),
      })
    },
    [apiEndPoint, chatID, message, sessionID],
  )

  const handleChange = React.useCallback<
    React.EventHandler<React.ChangeEvent<HTMLInputElement>>
  >(async event => {
    setMessage(event.target.value)
  }, [])

  React.useEffect(() => {
    if (!socket.current) {
      socket.current = SocketIOClient(`${chatEndPoint}`, {
        query: {
          name: sessionID,
        },
        transports: ['websocket'],
      })

      socket.current.on('agent.connected', data => {
        setChatID(data.chatSessionId)
      })

      socket.current.on('message', data => {
        setMessages([...messagesRef.current, data])
      })
    }

    return () => {
      socket.current?.disconnect()
    }
  }, [chatEndPoint, sessionID])

  React.useEffect(() => {
    if (rootRef.current)
      rootRef.current.scrollTop = rootRef.current?.scrollHeight
    messagesRef.current = [...messages]
  }, [messages])

  return (
    <ChatPanelRoot>
      <ChatPanelHeader>
        <ChatPanelHeaderTitle>Chat</ChatPanelHeaderTitle>
      </ChatPanelHeader>
      <ChatPanelBody ref={rootRef}>
        {message ? (
          messages.map(message => (
            <ChatMessage key={message.timestamp} {...message} />
          ))
        ) : (
          <ChatMessage message={noAgentConnectedMessage} />
        )}
      </ChatPanelBody>
      <ChatPanelFooter>
        <ChatPanelForm onSubmit={handleSubmit}>
          <ChatPanelFormInput
            disabled={!chatID}
            id="message"
            name="message"
            onChange={handleChange}
            placeholder={inputPlaceholder}
          />
          <ChatPanelFormButton
            disabled={!chatID || !message}
            onClick={handleSubmit}
            type="submit"
          >
            {submitIcon}
          </ChatPanelFormButton>
        </ChatPanelForm>
      </ChatPanelFooter>
    </ChatPanelRoot>
  )
}
