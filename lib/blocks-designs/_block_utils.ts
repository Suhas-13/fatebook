import { QuestionWithAuthorAndSlackMessages, QuestionWithSlackMessagesAndForecasts } from '../../prisma/additional'
import { Block, KnownBlock } from "@slack/types"
import { getSlackPermalinkFromChannelAndTS } from '../_utils.js'

export interface ResolveQuestionActionParts {
  action: 'resolve'
  questionId: number
  answer?: 'yes' | 'no' | 'ambiguous' // can be omitted if answer is in value of dropdown
}

export interface SubmitTextForecastActionParts {
  action: 'submitTextForecast'
  questionId: number
}

export interface QuestionModalActionParts {
  action: 'qModal'
  isCreating: boolean
  channel: string
  questionId?: number // only required for editing
}

export interface UpdateResolutionDateActionParts {
  action: 'updateResolutionDate'
}

export interface OverflowAccessoryPart {
  action: 'submitTextForecast'
  questionId: number
}

export interface SortForecastsActionParts {
  action: 'sortForecasts'
  field : 'date' | 'title' | 'difference from community'
  order: 'asc' | 'desc'
}

export interface EditQuestionBtnActionParts {
  action: 'editQuestionBtn'
  questionId: number
}


export type ActionIdParts = ResolveQuestionActionParts | SubmitTextForecastActionParts | SortForecastsActionParts | QuestionModalActionParts
  | UpdateResolutionDateActionParts | EditQuestionBtnActionParts

export type Blocks = (KnownBlock | Block | Promise<KnownBlock> | Promise<Block>)[]

export function toActionId(parts: ActionIdParts) {
  const stringified = JSON.stringify(parts)
  if (stringified.length >= 255) {
    throw new Error(`ActionIdParts too long - Slack limits actionId to 255 chars. ${parts}`)
  }
  return stringified
}

export function unpackBlockActionId(actionId: string) {
  try {
    return JSON.parse(actionId) as ActionIdParts
  } catch (e) {
    throw new Error("Could not parse actionId: " + actionId)
  }
}

export function textBlock(content: string, emoji = true) {
  return {
    'type': "plain_text" as "plain_text",
    'emoji': emoji,
    'text': content,
  }
}

export function divider() {
  return {
    'type': 'divider'
  }
}

export function markdownBlock(content: string) {
  return {
    'type': "mrkdwn" as "mrkdwn",
    'text': content,
  }
}

export function feedbackOverflow(){
  return {
    "type": "overflow",
    "options": [
      {
        "text": {
          "type": "plain_text",
          "emoji": true,
          "text": "Give feedback about this app"
        },
        "value": "value-0",
        "url": "https://www.quantifiedintuitions.org/"
      }
    ]
  }
}

export async function getQuestionTitleLink(teamId : string, question: QuestionWithAuthorAndSlackMessages | QuestionWithSlackMessagesAndForecasts) {
  const questionTitle = `*${question.title}*`
  if (question.slackMessages.length) {
    const slackMessage = question.slackMessages[0]!
    const slackPermalink = await getSlackPermalinkFromChannelAndTS(teamId, slackMessage.channel, slackMessage.ts)
    return `*<${slackPermalink}|${question.title}>*`
  }
  return questionTitle
}
