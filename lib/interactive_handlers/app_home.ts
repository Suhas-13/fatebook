import prisma, {
  backendAnalyticsEvent,
  callSlackApi,
  getOrCreateProfile,
} from "../_utils_server"
import { HomeAppPageNavigationActionParts } from "../blocks-designs/_block_utils"
import { buildHomeTabBlocks } from "../blocks-designs/app_home"

export async function refreshAppHome(event: any, teamId: string) {
  await refreshUserAppHome(event.user, teamId)
}

export async function refreshUserAppHome(
  userId: string,
  teamId: string,
  activePage: number = 0,
  closedPage: number = 0,
) {
  const profile = await getOrCreateProfile(teamId, userId)

  if (!profile) {
    console.error("Could not find or create profile for user", userId)
    return
  }

  const allUserForecasts = await prisma.forecast.findMany({
    where: {
      userId: profile.user.id,
    },
    include: {
      question: {
        include: {
          forecasts: true,
          questionMessages: {
            include: {
              message: true,
            },
          },
          resolutionMessages: {
            include: {
              message: true,
            },
          },
        },
      },
    },
  })

  const allUserQuestionScores = await prisma.questionScore.findMany({
    where: {
      userId: profile.user.id,
    },
  })

  const blocks = await buildHomeTabBlocks(
    teamId,
    profile.userId,
    allUserForecasts,
    allUserQuestionScores,
    activePage,
    closedPage,
  )

  await callSlackApi(
    teamId,
    {
      user_id: userId,
      view: {
        type: "home",
        blocks,
      },
    },
    "https://slack.com/api/views.publish",
  )

  await backendAnalyticsEvent("app_home_refreshed", {
    platform: "slack",
    team: teamId,
    user: userId,
  })
}

export async function buttonHomeAppPageNavigation(
  actionParts: HomeAppPageNavigationActionParts,
  payload: any,
) {
  console.log("  buttonHomeAppPageNavigation")
  let { activePage, closedPage } = actionParts
  //add or minus one from appropriate page
  if (actionParts.isForActiveForecasts) {
    activePage = activePage + (actionParts.direction == "next" ? 1 : -1)
  } else {
    closedPage = closedPage + (actionParts.direction == "next" ? 1 : -1)
  }

  await refreshUserAppHome(
    payload.user.id,
    payload.user.team_id,
    activePage,
    closedPage,
  )

  await backendAnalyticsEvent("app_home_pagination_navigated", {
    platform: "slack",
    team: payload.user.team_id,
    user: payload.user.id,
  })
}
