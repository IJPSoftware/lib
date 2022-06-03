import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import React from 'react'

type ChatMessageRootProps = {
  isMe: boolean
}

const ChatMessageRoot = styled(Box)<ChatMessageRootProps>`
  max-width: 250px;
  align-self: ${props => (props.isMe ? 'flex-end' : 'flex-start')};
`

const ChatMessageBody = styled(Box)`
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.25),
    2px 2px 4px -2px rgba(0, 0, 0, 0.25);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #5c6370;
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &::before {
    content: '';
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    position: absolute;
    z-index: -1;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(20px);
    border-radius: 4px;
  }
`

const ChatMessageHeaderTitle = styled('h4')`
  margin: 0;
`

const ChatMessageFooter = styled('footer')`
  font-size: 12px;
  align-self: flex-end;
`

export type Message = {
  from?: string
  message: string
  timestamp?: number
}

export const ChatMessage: React.FC<Message> = ({
  message,
  from,
  timestamp,
}) => (
  <ChatMessageRoot isMe={!from}>
    <ChatMessageBody>
      {from && (
        <header>
          <ChatMessageHeaderTitle>{from}</ChatMessageHeaderTitle>
        </header>
      )}
      <div>{message}</div>
      {timestamp && (
        <ChatMessageFooter>
          <span>{new Date(timestamp * 1000).toLocaleString()}</span>
        </ChatMessageFooter>
      )}
    </ChatMessageBody>
  </ChatMessageRoot>
)
