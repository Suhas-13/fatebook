import { Question, QuestionScore, Resolution, Group } from '@prisma/client'
import { QuestionWithAuthorAndSlackMessagesAndGroups } from '../../prisma/additional'
import { BlockActionPayload } from 'seratch-slack-types/app-backend/interactive-components/BlockActionPayload'
import { buildQuestionResolvedBlocks } from '../blocks-designs/question_resolved.js'
import { ResolveQuestionActionParts, UndoResolveActionParts } from '../blocks-designs/_block_utils.js'
import { relativeBrierScoring, ScoreCollection } from '../_scoring.js'

import prisma, { conciseDateTime, getResolutionEmoji, postBlockMessage, postEphemeralSlackMessage, postMessageToResponseUrl, round, updateForecastQuestionMessages, updateResolvePingQuestionMessages } from '../_utils.js'

async function dbResolveQuestion(questionid : number, resolution : Resolution) {
  console.log(`      dbResolveQuestion ${questionid} - ${resolution}`)
  return await prisma.question.update({
    where: {
      id: questionid,
    },
    data: {
      resolved: true,
      resolution: resolution,
      resolvedAt: new Date()
    },
    include: {
      groups: true,
      forecasts: {
        include: {
          profile: {
            include: {
              user: true
            }
          }
        }
      },
      profile: {
        include: {
          user: {
            include: {
              profiles: true
            }
          }
        }
      },
      questionMessages: {
        include: {
          message: true
        }
      },
      pingResolveMessages: {
        include: {
          message: true
        }
      }
    }
  })
}

async function scoreForecasts(scoreArray : ScoreCollection, question : Question) {
  console.log(`updating questionScores for question id: ${question.id}`)

  let updateArray : any[] = []
  for (const id in scoreArray) {
    const relativeScore = scoreArray[id].relativeBrierScore
    const absoluteScore = scoreArray[id].absoluteBrierScore
    const rank          = scoreArray[id].rank
    let profileQuestionComboId = parseInt(`${id}${question.id}`)
    updateArray.push(prisma.questionScore.upsert({
      where: {
        profileQuestionComboId: profileQuestionComboId,
      },
      update: {
        relativeScore: relativeScore,
        absoluteScore: absoluteScore,
        rank: rank
      },
      create: {
        profileQuestionComboId: profileQuestionComboId,
        profileId: Number(id),
        questionId: question.id,
        relativeScore: relativeScore,
        absoluteScore: absoluteScore,
        rank: rank
      }
    }))
    console.log(`  user id: ${id} with relative score ${relativeScore}`)
  }
  await prisma.$transaction(updateArray)
}

function getAverageScores(questionScores : QuestionScore[]) {
  const avgRelativeScore = questionScores.map(score => score.relativeScore.toNumber()).reduce((a, b) => a + b, 0) / questionScores.length
  const avgAbsoluteScore = questionScores.map(score => score.absoluteScore.toNumber()).reduce((a, b) => a + b, 0) / questionScores.length
  return {
    avgRelativeScore: avgRelativeScore,
    avgAbsoluteScore: avgAbsoluteScore
  }
}

async function messageUsers(scoreArray : ScoreCollection, question : QuestionWithAuthorAndSlackMessagesAndGroups) {
  console.log(`messageUsers for question id: ${question.id}`)

  console.log("get profiles")
  const profiles = await prisma.profile.findMany({
    where: {
      id: {
        in: Object.keys(scoreArray).map(id => Number(id))
      },
      slackId: {
        not: null
      }
    },
    include: {
      groups: {
        where: {
          // this is likely overkill, as we should only have one slack group per profile
          id: {
            in: question.groups.map((group : Group) => group.id)
          },
          slackTeamId: {
            not: null
          }
        }
      },
      forecasts: {
        where: {
          questionId: question.id
        }
      },
      questionScores: true
    }
  })

  console.log('Messaging profiles ', profiles)

  // go over each profile and send a message to each group they are in which
  //   are also in the question's groups
  await Promise.all(profiles.map(async profile => {
    // sort the foreacsts
    const sortedProfileForecasts = profile.forecasts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    const lastForecast           = sortedProfileForecasts[0]
    const averageScores          = getAverageScores(profile.questionScores)
    const scoreDetails = {
      brierScore:  scoreArray[profile.id].absoluteBrierScore,
      rBrierScore: scoreArray[profile.id].relativeBrierScore,
      ranking:     scoreArray[profile.id].rank,
      totalParticipants: Object.keys(scoreArray).length,
      lastForecast: lastForecast.forecast.toNumber()*100,
      lastForecastDate: conciseDateTime(lastForecast.createdAt, true),
      overallBrierScore: averageScores.avgAbsoluteScore,
      overallRBrierScore: averageScores.avgRelativeScore
    }
    const message = `'${question.title}' resolved ${getResolutionEmoji(question.resolution)} ${question.resolution}. Your Brier score is ${round(scoreArray[profile.id].relativeBrierScore, 4)}`
    console.log({message})
    return await Promise.all(profile.groups.map(async group => {
      const blocks = await buildQuestionResolvedBlocks(group.slackTeamId!,
                                                       question,
                                                       scoreDetails)
      await postBlockMessage(group.slackTeamId!, profile.slackId!, blocks, message, {unfurl_links: false, unfurl_media:false})
    }))
  }))
}

async function handleQuestionResolution(questionid : number, resolution : Resolution, teamId : string) {
  console.log(`    handleQuestionResolution: ${questionid} ${resolution}`)
  const question = await dbResolveQuestion(questionid, resolution)
  console.log(`    handledUpdateQuestionResolution: ${questionid} ${resolution}`)

  // message users first for responsiveness
  await updateForecastQuestionMessages(question, teamId, "Question resolved!")

  const scores = relativeBrierScoring(question.forecasts, question)
  await scoreForecasts(scores, question)
  await messageUsers(scores, question)

  await updateResolvePingQuestionMessages(question, teamId, "Question resolved!")
}

export async function resolve(actionParts: ResolveQuestionActionParts, responseUrl?: string, userSlackId?: string, actionValue?: string, teamId?: string) {
  // actionParts.answer is set by buttons block in resolution reminder DM, actionValue is set by select block on question
  const answer = actionParts.answer || actionValue
  if (!answer)
    throw Error('blockActions: both payload.actions.answer and actionValue is undefined')
  else if (actionParts.questionId === undefined || userSlackId === undefined || teamId === undefined || responseUrl === undefined)
    throw Error('blockActions: missing param')

  const { questionId } = actionParts
  console.log(`  resolve question ${questionId} to ${answer}`)

  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: {
      profile: {
        include: {
          user: {
            include: {
              profiles: true
            }
          }
        }
      }
    },
  })

  if (!question) {
    console.error("Couldn't find question to open edit modal: ", questionId)
    await postMessageToResponseUrl({
      text: `Error: Couldn't find question to edit.`,
      replace_original: false,
      response_type: 'ephemeral',
    }, responseUrl)
    throw new Error(`Couldn't find question ${questionId}`)
  }

  if (!question.profile.user.profiles.some((p) => p.slackId === userSlackId)) {
    // user is not the author of the question
    await postMessageToResponseUrl({
      text: `Only the question's author <@${question.profile.slackId}> can resolve it.`,
      replace_original: false,
      response_type: 'ephemeral',
    }, responseUrl)
    return
  }

  // TODO:NEAT replace yes/no/ambiguous with enum (with check for resolution template)
  switch (answer) {
    case 'yes':
      await handleQuestionResolution(questionId, Resolution.YES, teamId)
      break
    case 'no':
      await handleQuestionResolution(questionId, Resolution.NO, teamId)
      break
    case 'ambiguous':
      await handleQuestionResolution(questionId, Resolution.AMBIGUOUS, teamId)
      break
    default:
      console.error('Unhandled resolution: ', answer)
      throw new Error('Unhandled resolution')
  }
}

export async function buttonUndoResolution(actionParts: UndoResolveActionParts, payload: BlockActionPayload){
  const questionId = actionParts.questionId
  if (!questionId){
    throw Error('blockActions: payload.actions.questionId is undefined')
  }
  if (!payload.team?.id || !payload.user?.id || !payload.channel?.id) {
    throw new Error('Missing team or user or channel id on question overflow > undo_resolve')
  }
  await undoQuestionResolution(questionId, payload.team.id, payload.user.id, payload.channel.id)
}

export async function undoQuestionResolution(questionId: number, groupId: string, userSlackId: string, channelId: string) {
  const questionPreUpdate = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: {
      profile: true
    }
  })

  if (questionPreUpdate?.profile.slackId !== userSlackId) {
    console.log("Can't undo resolution, not author")
    await postEphemeralSlackMessage(groupId, {
      text: `Only the question's author${
        (questionPreUpdate?.profile.slackId ? ' <@' + questionPreUpdate?.profile.slackId + '> ' : '')
      }can undo a resolution.`,
      channel: channelId,
      user: userSlackId,
    }
    )
    return
  }

  await prisma.$transaction([
    prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        resolution: null,
        resolvedAt: null,
        resolved: false,
      },
    }),
    prisma.questionScore.deleteMany({
      where: {
        questionId: questionId,
      }
    })
  ])

  const questionUpdated = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: {
      forecasts: {
        include: {
          profile: {
            include: {
              user: true
            }
          }
        }
      },
      profile: {
        include: {
          user: {
            include: {
              profiles: true
            }
          }
        }
      },
      questionMessages: {
        include: {
          message: true
        }
      },
      pingResolveMessages: {
        include: {
          message: true
        }
      }

    }
  })
  if (!questionUpdated) {
    throw Error(`Cannot find question with id: ${questionId}`)
  }
  await updateForecastQuestionMessages(questionUpdated, groupId, "Question resolution undone!")
  await updateResolvePingQuestionMessages(questionUpdated, groupId, "Question resolution undone!")
}

