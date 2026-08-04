# Project Discussion

This project is designed to help users automatically monitor their DPDC electricity bills without the need for repeated manual checks.

## Features

- Check the current DPDC electricity bill instantly.
- Store every bill check in the database as historical data.
- Automatically monitor bill updates through a scheduled cron job.
- Compare the latest bill with the previously stored record.
- Send a notification to a Discord channel whenever the bill amount changes.
- Eliminate the need for users to manually check their bills repeatedly.
- **Weekly Email Reports:** Users can subscribe using their **User ID** and **email address** to receive a weekly summary of their electricity bill activity. A detailed report is automatically sent to their email every **Friday**.

## Workflow

1. A user checks their DPDC electricity bill.
2. The bill information is stored in the database for future comparison.
3. Users can optionally subscribe to weekly email reports by providing their User ID and email address.
4. A scheduled cron job runs at predefined intervals.
5. The system fetches the latest bill information from DPDC.
6. The latest bill is compared with the previously stored record.
7. If the bill amount has changed, a notification containing the updated balance is sent to the configured Discord channel.
8. If there is no change, no notification is sent.
9. Every Friday, subscribed users receive a weekly email report summarizing their bill history and recent updates.

## Purpose

The primary goal of this project is to automate DPDC electricity bill monitoring and provide timely notifications whenever a bill is updated. In addition, the weekly email reporting feature keeps subscribed users informed with a concise summary of their billing activity, ensuring they stay up to date without having to check their bills manually.
