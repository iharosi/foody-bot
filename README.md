# Slack Foody Bot

Foody bot is a Slack bot which can tell you what is the lunch for today at nearby.
It will connect through Slack's RTM protocol.

## Setup

Create a Slack app to get a Slack token: https://api.slack.com/apps  
Then rename _.env.sample_ to _.env_ and set `SLACK_TOKEN` variable.

## Start the app

Launch the nodejs service.

```sh
npm start
```

or

```
yarn start
```

The application will connect to your team's network.
Now you need to invite the bot into one of your channels.

Type this command in Slack's chat window:

```
/invite @foody
```