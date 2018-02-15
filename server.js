#!/usr/local/bin/node
'use strict';

require('dotenv').config();

const url = require('url');
const moment = require('moment');
const request = require('request-promise-native');
const {RtmClient, CLIENT_EVENTS, RTM_EVENTS, WebClient} = require('@slack/client');
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);
const rtm = new RtmClient(token, {
    dataStore: false,
    useRtmConnect: true
});
const apiUrl = 'http://daily-menu.iharosi.com:3000';

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData) => {
    console.log(`Logged in as ${connectData.self.id} of team ${connectData.team.id}`);
});

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
    let reply;
    let text = message.text || '';
    let match = text.match(/^!m (?!list$)(\w+)/);

    if (text === '!m') {
        reply = `Hi <@${message.user}>! Use the *!m list* command to get the restaurant list.`;
        web.chat.postMessage(message.channel, reply);
    }
    if (text === '!m list') {
        request(url.resolve(apiUrl, '/restaurant'))
            .then((response) => {
                let restaurantList = JSON.parse(response)
                    .map((restaurant) => {
                        return `\`!m ${restaurant.id}\` - ${restaurant.name}`;
                    });

                web.chat.postMessage(
                    message.channel,
                    [
                        'So, here are the available restaurants what you can query, ',
                        `<@${message.user}>! :slightly_smiling_face:`
                    ].join(''),
                    {
                        attachments: [{
                            color: '#eeeeee',
                            title: `Expand the list to see all the ${restaurantList.length} ` +
                                `available restaurants.`
                        }, {
                            text: restaurantList.join('\n')
                        }]
                    }
                );
            })
            .catch((error) => {
                console.log(error);
            });
    }
    if (match) {
        request(url.resolve(apiUrl, `/restaurant/${match[1]}`))
            .then((response) => {
                let data = JSON.parse(response);

                web.chat.postMessage(
                    message.channel,
                    '',
                    {
                        attachments: [{
                            color: '#eeeeee',
                            title: data.name,
                            title_link: data.url, // eslint-disable-line camelcase
                            text: data.menu.join('\n'),
                            thumb_url: data.logo, // eslint-disable-line camelcase
                            // footer: 'Daily Menu API',
                            // footer_icon: 'https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png',
                            ts: moment(data.lastUpdated).unix()
                        }]
                    }
                );
            })
            .catch((error) => {
                if (error && error.statusCode === 404) {
                    web.chat.postMessage(message.channel, error.message);
                } else {
                    console.log(error);
                }
            });
    }
});

rtm.start();
