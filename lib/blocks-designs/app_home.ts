import { QuestionScore } from '@prisma/client'
import { formatDecimalNicely } from '../../lib/_utils'
import { ForecastWithQuestionWithSlackMessagesAndForecasts } from "../../prisma/additional"
import { numberOfDaysInRecentPeriod, quantifiedIntuitionsUrl } from '../_constants'
import { Blocks, dividerBlock, headerBlock, markdownBlock, textBlock } from "./_block_utils"
import { buildGetForecastsBlocks } from "./get_forecasts"

type ScoreDetails = {
  brierScore: number
  rBrierScore: number
  ranking: number
  totalParticipants: number
}

type QScoreLite = {
  absolute: number
  relative: number
}

function averageScores(scores: number[]) {
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

function populateDetails(questionScores : QuestionScore[]) : { recentDetails: ScoreDetails, overallDetails: ScoreDetails } {
  const recentScores = questionScores.filter((qs : QuestionScore) => qs.createdAt > new Date(Date.now() - 1000 * 60 * 60 * 24 * numberOfDaysInRecentPeriod)).map((qs : QuestionScore) => { return {absolute: qs.absoluteScore.toNumber(), relative: qs.relativeScore.toNumber()}})

  const overallScores = questionScores.map((qs : QuestionScore) => { return {absolute: qs.absoluteScore.toNumber(), relative: qs.relativeScore.toNumber()}})
  const recentDetails = {
    brierScore: averageScores(recentScores.map((qs : QScoreLite) => qs.absolute)),
    rBrierScore: averageScores(recentScores.map((qs : QScoreLite) => qs.relative)),
    ranking: 0,
    totalParticipants: 0,
  }
  const overallDetails = {
    brierScore: averageScores(overallScores.map((qs : QScoreLite) => qs.absolute)),
    rBrierScore: averageScores(overallScores.map((qs : QScoreLite) => qs.relative)),
    ranking: 0,
    totalParticipants: 0,
  }
  return {recentDetails, overallDetails}
}

export async function buildHomeTabBlocks(teamId: string, allUserForecasts: ForecastWithQuestionWithSlackMessagesAndForecasts[], questionScores: QuestionScore[], activePage : number = 0, closedPage : number = 0): Promise<Blocks> {
  const {recentDetails, overallDetails} = populateDetails(questionScores)

  const formatScore = (score: number, decimals: number = 6) => {
    return (score || score === 0) ? formatDecimalNicely(score, decimals) : '...'
  }

  const myRecentScoreBlock     = [
    {
      type: 'section',
      'fields': [
        markdownBlock(`*Brier score* _(<https://en.wikipedia.org/wiki/Brier_score|Lower is better>)_\n ${formatScore(recentDetails.brierScore)}`),
        markdownBlock(`*Relative Brier score*\n ${formatScore(recentDetails.rBrierScore)}`),
        //markdownBlock(`*Ranking*\n *${details.ranking}*/${details.totalParticipants}`),
      ]
    }
  ] as Blocks
  const myOverallScoreBlock     = [
    {
      type: 'section',
      'fields': [
        markdownBlock(`*Overall Brier score* _(<https://en.wikipedia.org/wiki/Brier_score|Lower is better>)_\n ${formatScore(overallDetails.brierScore)}`),
        markdownBlock(`*Overall Relative Brier score*\n ${formatScore(overallDetails.rBrierScore)}`),
        //markdownBlock(`*Ranking*\n *${details.ranking}*/${details.totalParticipants}`),
      ]
    }
  ] as Blocks

  const activeForecasts = allUserForecasts.filter(f => f.question.resolution == null).sort((a, b) => b.question.createdAt.getTime() - a.question.createdAt.getTime())
  const closedForecasts = allUserForecasts.filter(f => f.question.resolution != null).sort((a, b) => b.question.createdAt.getTime() - a.question.createdAt.getTime())

  const myActiveForecastsBlock : Blocks = await buildGetForecastsBlocks(
    teamId, activeForecasts, activePage, closedPage, true,
    '_Time to make your first prediction! Create a question by typing `/forecast` in any channel._'
  )
  const myClosedForecastsBlock : Blocks = await buildGetForecastsBlocks(
    teamId, closedForecasts, activePage, closedPage, false,
    '_Check here once a question you\'ve forecasted on has resolved._'
  )
  return [
    headerBlock('Your score for the last 3 months'),
    ...(myRecentScoreBlock),
    dividerBlock(),
    headerBlock('Your active forecasts'),
    ...(myActiveForecastsBlock),
    dividerBlock(),
    headerBlock('Your resolved forecasts'),
    ...(myClosedForecastsBlock),
    dividerBlock(),
    headerBlock('Your all-time overall score'),
    ...(myOverallScoreBlock),
    dividerBlock(),
    headerBlock('How to use this app'),
    {
      "type": "section",
      "text": textBlock(
        '1. Ask a question about the future by typing `/forecast` in any Slack channel\n' +
        '2. Record your prediction of how likely the question is to be answered \'yes\'\n' +
        '3. After time passes, resolve the question Yes, No or Ambiguous\n' +
        '4. Check back here to see your scores and watch your prediction skills improve over time!'
      )
    },
    dividerBlock(),
    {
      'type': 'context',
      'elements': [
        markdownBlock(`_<https://fatebook.io|Fatebook> is built by Sage to help impactful teams seek the truth._`),
        markdownBlock(`_Want more Fatebook? <https://fatebook.io/for-slack|Install Fatebook to another Slack workspace>._`),
        markdownBlock(`_Find our other forecasting tools on <${quantifiedIntuitionsUrl}|Quantified Intuitions>._`),
      ]
    }

  ]
}
