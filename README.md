# Using Cloudflare workers for DJ Song Requests

This repostory contains a worker script that takes song requests and them using [MailChannels](https://support.mailchannels.com/hc/en-us/articles/4565898358413-Sending-Email-from-Cloudflare-Workers-using-MailChannels-Send-API) free service from cloudflare to send a that to a desired email addess.

## Why Cloudflare workers?

Because even on there free tier you can have 100,000 requests per day. Which is plenty for something like this where you only going to have a limited number of visitors. Also MailChannels from cloudflare is also free meaning hosting this is free assuming you arn't expecting more requests than the daily limit.


## How do I setup the website?

1. You will need a [Cloudflare account](https://developers.cloudflare.com/learning-paths/get-started/account-setup/create-account/#create-an-account) if you don't already have one.
1. To get started you will need to prepare the domain you want mailchannels to send email. Start with the Domain Lockdown section move onto SPF and DKIM sections. (Store the dkim key as an environment variable called DKIM_PRIVATE_KEY)
2. Replace the to and from email addresses in the code.
3. Next is getting turnstile setup. The secret key will go into an envioremt key called SECRET_KEY. The sitekey is in the worker code.


## CF Worker Reccomendations

When using this I recomend not using a custom domain. Instead I reccomend sticking with the worker domain. As cloudflare lets you enable and disable this one at will (unlike a custom domain). 

* Meaning it can be disabled and enables as needed.
* This also means you can easily change the domain. You just need to change the name of the worker project.
* This also means you can provide a unique url to the customer so that they can embed it on any websites they have.

## Taking it to the next level
Now if you send the message to an alias setup via [SimpleLogin](https://simplelogin.io) you can control if messages make it to the DJ by turning the off or on as neeeded. 

So you can make sure the DJ doesn't get bothered more than is necessary.  

### SMS Gateway

The phone carriers offer SMS to Email Gateways meaning we can then have SimpleLogin forward the message to the email address that represents the DJ's Cell Phone. Search [email to sms](https://duckduckgo.com/?q=email+to+sms) as there are many guides on this.

For guests that email or SMS (assuming the phone carrier supports two way) it gives the DJ option of communationg back with them if they desire.

#### Why SMS

Because in low coverage locations it can be hard to even load a webpage. You would be more likley to be able to send and SMS and it's simple.

## So what does this look like?

So if I were to resprent the layers it would look something like this.


| Medium | Path | 
| -------- | -------- |
| Email     | Email <=> to SimpleLogin <=> SMS     |
| SMS     | SMS <=> Email <=> to SimpleLogin <=> SMS     |
| Website     | Website => Email => SimpleLogin => SMS     |


## Why go from sms to email and back again?

1. This allows us to not give out the DJ's Cell Phone Number.
1. This allows us to use something like simple login in the middle where it can easily switched off.

 
## Are there any downsides?

* Relies on Phone cariers email to sms gateways, Cloudflare, MailChannels, and SimpleLogin
* Cloudflares worker Daily Limit of 100,000
* Requies a bit of technical knoledge to setup
* No custom spam filtering (although simplelogin and mailchannels have there own filtering)

## How do I get the intomation to guests?

I think a vCard in the form of a QR code would be best. This also leaves the opptunity to leave a custom message in the notes of the contact if desired.
