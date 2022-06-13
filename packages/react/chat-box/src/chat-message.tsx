import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import React from 'react'

type ChatMessageRootProps = {
  isMe: boolean
}

const ChatMessageRoot = styled(motion.div)<ChatMessageRootProps>`
  max-width: 250px;
  align-self: ${props => (props.isMe ? 'flex-end' : 'flex-start')};
`

type ChatMessageBodyProps = {
  isMe: boolean
}

const ChatMessageBody = styled(Box)<ChatMessageBodyProps>`
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.25),
    2px 2px 4px -2px rgba(0, 0, 0, 0.25);
  padding: 8px;
  background-color: ${props => (props.isMe ? '#242e39' : '#2d2f37')};
  color: #abb2bf;
  backdrop-filter: blur(20px);
  border-radius: 4px;
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ChatMessageHeaderTitle = styled('h4')`
  margin: 0;
`

const ChatMessageFooter = styled('footer')`
  font-size: 12px;
  align-self: flex-end;
`

export type ChatMessageClassNames = {
  ChatMessageBody?: string
  ChatMessageFooter?: string
  ChatMessageHeaderTitle?: string
  ChatMessageRoot?: string
}

export type Message = {
  from?: string
  message: React.ReactNode
  timestamp?: number
}

export type ChatMessageProps = Message & {
  classNames?: ChatMessageClassNames
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  classNames,
  from,
  message,
  timestamp,
}) => {
  const isMe = React.useMemo(() => !from && !!timestamp, [from, timestamp])

  return (
    <ChatMessageRoot
      animate={{ x: [isMe ? 30 : -30, 0] }}
      className={classNames?.ChatMessageRoot}
      isMe={isMe}
      transition={{ ease: 'easeInOut', duration: 0.25 }}
    >
      <ChatMessageBody className={classNames?.ChatMessageBody} isMe={isMe}>
        {from && (
          <header>
            <ChatMessageHeaderTitle
              className={classNames?.ChatMessageHeaderTitle}
            >
              {from}
            </ChatMessageHeaderTitle>
          </header>
        )}
        <div>{message}</div>
        {timestamp && (
          <ChatMessageFooter className={classNames?.ChatMessageFooter}>
            <span>{new Date(timestamp * 1000).toLocaleString()}</span>
          </ChatMessageFooter>
        )}
      </ChatMessageBody>
    </ChatMessageRoot>
  )
}
