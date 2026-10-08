<!-- URL: https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence -->
<!-- TITLE: Line Type Intelligence | Twilio -->
[Skip to content](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence#twilio-docs-content-area) [Skip to navigation](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence#twilio-docs-sidebar-nav) [Skip to topbar](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence#twilio-docs-topbar)

Search`` `K`

Search`` `K`

Page tools

Copy as markdown

Useful for sharing or LLM

Copy and view

Copy as markdown [View as markdown](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence.md)

* * *

Open in assistant

[Open in ChatGPT](https://chatgpt.com/?hint=search&q=Read%20https%3A%2F%2Fwww.twilio.com%2Fdocs%2Flookup%2Fv2-api%2Fline-type-intelligence.md%20so%20I%20can%20ask%20questions%20about%20it) [Open in Claude](https://claude.ai/new?q=Read%20https%3A%2F%2Fwww.twilio.com%2Fdocs%2Flookup%2Fv2-api%2Fline-type-intelligence.md%20so%20I%20can%20ask%20questions%20about%20it) [Open in Cursor](https://cursor.com/link/prompt?text=Read%20https%3A%2F%2Fwww.twilio.com%2Fdocs%2Flookup%2Fv2-api%2Fline-type-intelligence.md%20so%20I%20can%20ask%20questions%20about%20it) [Open in Perplexity](https://www.perplexity.ai/search?q=Read%20https%3A%2F%2Fwww.twilio.com%2Fdocs%2Flookup%2Fv2-api%2Fline-type-intelligence.md%20so%20I%20can%20ask%20questions%20about%20it)

Build with AI

[Connect your AI agent](https://www.twilio.com/docs/ai/mcp) [Install Twilio Skills](https://www.twilio.com/docs/ai/skills)

Accelerate development with AI

* * *

On this page

Looking for more inspiration?Visit the [Developer Hub](https://www.twilio.com/en-us/developers)

Copy as markdown

Copy and view

Copy as markdown [View as markdown](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence.md)

* * *

Open in assistant

[Open in ChatGPT](https://chatgpt.com/?hint=search&q=Read%20https%3A%2F%2Fwww.twilio.com%2Fdocs%2Flookup%2Fv2-api%2Fline-type-intelligence.md%20so%20I%20can%20ask%20questions%20about%20it) [Open in Claude](https://claude.ai/new?q=Read%20https%3A%2F%2Fwww.twilio.com%2Fdocs%2Flookup%2Fv2-api%2Fline-type-intelligence.md%20so%20I%20can%20ask%20questions%20about%20it) [Open in Cursor](https://cursor.com/link/prompt?text=Read%20https%3A%2F%2Fwww.twilio.com%2Fdocs%2Flookup%2Fv2-api%2Fline-type-intelligence.md%20so%20I%20can%20ask%20questions%20about%20it) [Open in Perplexity](https://www.perplexity.ai/search?q=Read%20https%3A%2F%2Fwww.twilio.com%2Fdocs%2Flookup%2Fv2-api%2Fline-type-intelligence.md%20so%20I%20can%20ask%20questions%20about%20it)

* * *

Build with AI

[Connect your AI agent](https://www.twilio.com/docs/ai/mcp) [Install Twilio Skills](https://www.twilio.com/docs/ai/skills)

# Line Type Intelligence

Positive FeedbackNegative Feedback

* * *

Use Line Type Intelligence to identify the carrier and phone line type, such as mobile, landline, fixed VoIP, non-fixed VoIP, toll free, and more. For example, you can filter out landline numbers from a list before sending SMS messages.

* * *

## Coverage

[coverage page anchor](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence#coverage)

Positive FeedbackNegative Feedback

Line Type Intelligence is available for phone numbers worldwide.

**Note**: Canadian phone numbers require special approval. Learn [how to request access to Canadian Number Portability Administration Center (NPAC) data(link takes you to an external page)](https://help.twilio.com/articles/360004563433 "how to request access to Canadian Number Portability Administration Center (NPAC) data"). Querying a Canadian phone number without access will return a [60601 error](https://www.twilio.com/docs/api/errors/60601 "60601 error").

* * *

## Run line type intelligence

[run-line-type-intelligence page anchor](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence#run-line-type-intelligence)

Positive FeedbackNegative Feedback

Make a [`GET /v2/PhoneNumbers/{PhoneNumber}`](https://www.twilio.com/docs/lookup/v2-api#making-a-request) request with the `Fields=line_type_intelligence` query parameter.

Check a phone number's line type [Link to code sample: Check a phone number's line type](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence#code-check-a-phone-numbers-line-type)

curl

Report code block

Copy code block

```
1curl -X GET "https://lookups.twilio.com/v2/PhoneNumbers/%2B15017122661?Fields=line_type_intelligence" \

2-u $TWILIO_API_KEY:$TWILIO_API_SECRET
```

* * *

## Response properties

[response-properties page anchor](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence#response-properties)

Positive FeedbackNegative Feedback

The response includes the `line_type_intelligence` object, which includes the following properties:

| Property | Description |
| --- | --- |
| `mobile_country_code` | The three-digit mobile country code of the carrier, used with the `mobile_network_code` to identify a mobile network operator. |
| `mobile_network_code` | The two- or three-digit mobile network code of the carrier, used with the mobile country code to identify a mobile network operator. This is only returned for mobile numbers. |
| `carrier_name` | The name of the carrier. |
| `type` | The phone number type. |
| `error_code` | The [error code](https://www.twilio.com/docs/api/errors "error code"). If there's no error, this value will be `null`. |

### `type` property values

[type-property-values page anchor](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence#type-property-values)

Positive FeedbackNegative Feedback

(warning)

## Warning

Carrier data isn't available for phone number types: `personal`, `tollFree`, `premium`, `sharedCost`, `uan`, `voicemail`, `pager`, or `unknown`. In these cases `mobile_country_code`, `mobile_network_code`, and `carrier_name` values will be `null`.

The following are the possible values for the `type` property.

| Value | Description |
| --- | --- |
| `landline` | A landline number that generally can't receive SMS messages. |
| `mobile` | A mobile number that generally can receive SMS messages. |
| `fixedVoip` | A virtual phone number associated with a physical device. For example, Comcast or Vonage. |
| `nonFixedVoip` | A virtual phone number obtained online without requiring a physical device. For example, Google Voice or Enflick. |
| `personal` | A phone number designated for personal use. |
| `tollFree` | A toll-free phone number where calls are free for the calling party. |
| `premium` | A premium-rate phone number. These numbers typically charge higher-than-normal rates for special services. |
| `sharedCost` | A shared cost phone number. The calling party and number subscriber share the charges. These numbers charge higher-than-normal rates. |
| `uan` | A universal access number. This is a national number that can route incoming calls to different destinations. |
| `voicemail` | A phone number associated with a voicemail service. |
| `pager` | A phone number associated with a pager device. |
| `unknown` | A valid phone number, but the line type is unknown. |

* * *

## Code examples and responses

[code-examples-and-responses page anchor](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence#code-examples-and-responses)

Positive FeedbackNegative Feedback

Line Type Intelligence Lookup [Link to code sample: Line Type Intelligence Lookup](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence#code-line-type-intelligence-lookup)

Node.jsPythonC#JavaGoPHPRubytwilio-clicurl

Report code block

Copy code block

```
1// Download the helper library from https://www.twilio.com/docs/node/install

2const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";

3

4// Find your Account SID at twilio.com/console

5// Provision API Keys at twilio.com/console/runtime/api-keys

6// and set the environment variables. See http://twil.io/secure

7// For local testing, you can use your Account SID and Auth token

8const accountSid = process.env.TWILIO_ACCOUNT_SID;

9const apiKey = process.env.TWILIO_API_KEY;

10const apiSecret = process.env.TWILIO_API_SECRET;

11const client = twilio(apiKey, apiSecret, { accountSid: accountSid });

12

13async function fetchPhoneNumber() {

14  const phoneNumber = await client.lookups.v2

15    .phoneNumbers("+14159929960")

16    .fetch({ fields: "line_type_intelligence" });

17

18  console.log(phoneNumber.lineTypeIntelligence);

19}

20

21fetchPhoneNumber();
```

### Response

Note about this response

Copy response

```
1{

2  "calling_country_code": "1",

3  "country_code": "US",

4  "phone_number": "+14159929960",

5  "national_format": "(415) 992-9960",

6  "valid": true,

7  "validation_errors": null,

8  "caller_name": null,

9  "sim_swap": null,

10  "call_forwarding": null,

11  "line_status": null,

12  "line_type_intelligence": {

13    "error_code": null,

14    "mobile_country_code": "240",

15    "mobile_network_code": "38",

16    "carrier_name": "Twilio - SMS/MMS-SVR",

17    "type": "nonFixedVoip"

18  },

19  "identity_match": null,

20  "reassigned_number": null,

21  "sms_pumping_risk": null,

22  "phone_number_quality_score": null,

23  "pre_fill": null,

24  "url": "https://lookups.twilio.com/v2/PhoneNumbers/+14159929960"

25}
```

* * *

## Video example

[video-example page anchor](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence#video-example)

Positive FeedbackNegative Feedback

The video below demonstrates how to check a phone number's line type with Lookup using Node.js and the [Twilio Node SDK(link takes you to an external page)](https://github.com/twilio/twilio-node "Twilio Node SDK").

Select sample

Report code block

Copy code block

Select sample

Report code block

Copy code block

Note: This shows the raw API response from Twilio. Responses from SDKs (Java, Python, etc.) may look a little different.

Copy response