import { ServerClient } from "postmark"
import { getUnsubscribeUrl } from "../../pages/unsubscribe"
import { postmarkApiToken } from "../_constants"
import { backendAnalyticsEvent } from "../_utils_server"

export async function sendEmail({
  subject,
  htmlBody,
  textBody,
  to,
}: {
  subject: string
  htmlBody: string
  textBody: string
  to: string
}) {
  console.log("Sending email...")
  const client = new ServerClient(postmarkApiToken)
  const response = await client.sendEmail({
    "From": "reminders@fatebook.io",
    "ReplyTo": "hello@sage-future.org",
    "To": to,
    "Subject": subject,
    "HtmlBody": htmlBody,
    "TextBody": textBody,
    "MessageStream": "outbound"
  })

  if (response.ErrorCode) {
    console.error(`Error sending email: ${JSON.stringify(response)}`)
  } else {
    console.log(`Sent email to ${to} with subject: ${subject}`)
    await backendAnalyticsEvent("email_sent", { platform: "web" })
  }
}

export function fatebookEmailFooter(userEmailAddress: string) {
  return `\n
<br/>
<p><i><a href="https://fatebook.io">Fatebook</a> helps you rapidly make and track predictions about the future.</i></p>
<br/>
<p><a href=${getUnsubscribeUrl(userEmailAddress)}Unsubscribe from all emails from Fatebook</a></p>
`
}